import type { Feature, FeatureCollection, Geometry } from "geojson";
import type { DemandPressureLabel, DistanceResult, PowerAnalysis, ScenarioConfig, SourceMeta } from "@/lib/types";
import { getFetcher, getStateGisBundle } from "@/lib/gis/stateGis";
import { NATIONAL_SOURCES } from "@/lib/gis/nationalSources";
import { fetchHifldSubstations, getCountyDensityRecord } from "@/lib/gis/nationalFetchers";
import { bboxAroundMiles, milesBetween, nearestFeature, polygonContaining } from "@/lib/spatial/geo";
import { NEARBY_GENERATION_RADIUS_MI, POPULATION_DENSITY_TIERS } from "@/lib/constants/assumptions";
import { cached, TTL } from "@/lib/cache/memoryCache";
import { queryArcGisGeoJSON, type Bbox } from "@/lib/gis/arcgis";

interface TransmissionProps {
  XRefCd?: string;
  OperatingLineNm?: string;
  VoltageMeas?: number;
}

interface SubstationProps {
  Name?: string | null;
  County?: string | null;
  State?: string | null;
  Status?: string | null;
  Owner?: string | null;
  Lines?: number | null;
  MaxVoltKv?: number | null;
  MinVoltKv?: number | null;
}

const UA = "Mozilla/5.0 (compatible; DataCenterSitingPlatform/1.0; +https://vercel.com)";

const NEAREST_GRID_SEARCH_RADII_MI = [35, 75, 150, 300, 600, 1200, 2500] as const;

async function fetchTransmissionTier(
  bbox: Bbox,
  minKv: number,
  maxKv?: number
): Promise<FeatureCollection<Geometry, TransmissionProps>> {
  const where = maxKv != null
    ? `voltage >= ${minKv} AND voltage < ${maxKv}`
    : `voltage >= ${minKv}`;

  const fc = await queryArcGisGeoJSON<{
    owner?: string;
    voltage?: number | string;
    type?: string;
    id?: string;
  }>(
    NATIONAL_SOURCES.hifldTransmission.url,
    { bbox, where, outFields: "owner,voltage,type,id" },
    TTL.ONE_DAY
  );

  return {
    type: "FeatureCollection",
    features: fc.features.map((feature) => {
      const p = feature.properties ?? {};
      const rawVoltage = typeof p.voltage === "number" ? p.voltage : Number(p.voltage);
      const voltage = Number.isFinite(rawVoltage) && rawVoltage > 0 ? rawVoltage : undefined;
      return {
        ...feature,
        properties: {
          VoltageMeas: voltage,
          OperatingLineNm: p.owner ? `${p.owner}${p.type ? ` (${p.type})` : ""}` : undefined,
          XRefCd: p.id ?? undefined,
        },
      };
    }),
  };
}

async function nearestWithExpandingSearch<P>(
  lng: number,
  lat: number,
  fetcher: (bbox: Bbox) => Promise<FeatureCollection<Geometry, P>>
) {
  for (let i = 0; i < NEAREST_GRID_SEARCH_RADII_MI.length; i += 1) {
    const radius = NEAREST_GRID_SEARCH_RADII_MI[i]!;
    const fc = await fetcher(bboxAroundMiles(lng, lat, radius));
    const nearest = nearestFeature(lng, lat, fc);
    if (!nearest.feature) continue;

    const nextRadius =
      NEAREST_GRID_SEARCH_RADII_MI[Math.min(i + 1, NEAREST_GRID_SEARCH_RADII_MI.length - 1)]!;
    if (nextRadius === radius) return nearest;

    const wider = await fetcher(bboxAroundMiles(lng, lat, nextRadius));
    return nearestFeature(lng, lat, wider);
  }

  return { feature: null, distanceMiles: null };
}

interface CensusGeographyResponse {
  result: {
    geographies: {
      Counties?: { NAME: string; GEOID: string }[];
    };
  };
}

/**
 * Same Census geocoder endpoint (and cache key format) regulation.ts's
 * reverseGeocodeCounty uses — sharing the key means whichever of the two
 * analysis steps runs first populates the cache for the other, so this
 * never costs a second network round trip per scenario.
 */
async function getCountyGeoid(lng: number, lat: number): Promise<{ geoid: string; name: string } | null> {
  const url = `https://geocoding.geo.census.gov/geocoder/geographies/coordinates?x=${lng}&y=${lat}&benchmark=Public_AR_Current&vintage=Current_Current&layers=Counties&format=json`;
  try {
    const data = await cached(`county:${lng.toFixed(3)},${lat.toFixed(3)}`, TTL.ONE_DAY, async () => {
      const res = await fetch(url, { headers: { "User-Agent": UA }, cache: "no-store" });
      if (!res.ok) throw new Error(`Census geocoder failed (${res.status})`);
      return (await res.json()) as CensusGeographyResponse;
    });
    const county = data.result.geographies.Counties?.[0];
    return county ? { geoid: county.GEOID, name: county.NAME } : null;
  } catch {
    return null;
  }
}

function demandPressureLabelFor(densityPerSqMi: number | null): DemandPressureLabel {
  if (densityPerSqMi == null) return "Unknown";
  if (densityPerSqMi >= POPULATION_DENSITY_TIERS.high) return "Very High";
  if (densityPerSqMi >= POPULATION_DENSITY_TIERS.moderate) return "High";
  if (densityPerSqMi >= POPULATION_DENSITY_TIERS.low) return "Moderate";
  return "Low";
}

function toDistanceResult(
  result: { feature: Feature<Geometry, TransmissionProps> | null; distanceMiles: number | null },
  source: SourceMeta
): DistanceResult & { voltageKv: number | null } {
  const voltage = result.feature?.properties?.VoltageMeas ?? null;
  const name = result.feature?.properties?.OperatingLineNm ?? result.feature?.properties?.XRefCd ?? null;
  return {
    distanceMiles: result.distanceMiles,
    nearestFeatureLabel: name,
    voltageKv: voltage,
    confidence: result.feature ? "fact" : "unknown",
    source,
  };
}

export async function computePowerAnalysis(scenario: ScenarioConfig): Promise<PowerAnalysis> {
  const { lng, lat, mwLoad, stateId } = scenario;
  const bundle = getStateGisBundle(stateId);

  const transmissionBbox = bboxAroundMiles(lng, lat, 35);
  const territoryBbox = bboxAroundMiles(lng, lat, 20);
  const generationBbox = bboxAroundMiles(lng, lat, NEARBY_GENERATION_RADIUS_MI);

  const [
    transmissionFc,
    territoryFc,
    generationFc,
    county,
    nearest115Raw,
    nearest230Raw,
    nearest500Raw,
    nearestSubstationResult,
  ] = await Promise.all([
    getFetcher(stateId, "transmission-lines")(transmissionBbox) as Promise<FeatureCollection<Geometry, TransmissionProps>>,
    getFetcher(stateId, "utility-territories")(territoryBbox) as Promise<
      FeatureCollection<Geometry, { Name?: string }>
    >,
    getFetcher(stateId, "power-plants")(generationBbox) as Promise<
      FeatureCollection<Geometry, { plantName?: string; fuel?: string; nameplateMw?: number }>
    >,
    getCountyGeoid(lng, lat),
    nearestWithExpandingSearch(lng, lat, (bbox) => fetchTransmissionTier(bbox, 115, 230)),
    nearestWithExpandingSearch(lng, lat, (bbox) => fetchTransmissionTier(bbox, 230, 500)),
    nearestWithExpandingSearch(lng, lat, (bbox) => fetchTransmissionTier(bbox, 500)),
    nearestWithExpandingSearch(lng, lat, (bbox) =>
      fetchHifldSubstations(bbox) as Promise<FeatureCollection<Geometry, SubstationProps>>
    ),
  ]);

  const densityRecord = getCountyDensityRecord(county?.geoid);
  const demandPressureLabel = demandPressureLabelFor(densityRecord?.densityPerSqMi ?? null);

  const nearestAny = toDistanceResult(nearestFeature(lng, lat, transmissionFc), bundle.transmissionSource);
  const nearest115 = toDistanceResult(nearest115Raw, NATIONAL_SOURCES.hifldTransmission);
  const nearest230 = toDistanceResult(nearest230Raw, NATIONAL_SOURCES.hifldTransmission);
  const nearest500 = toDistanceResult(nearest500Raw, NATIONAL_SOURCES.hifldTransmission);

  const territory = polygonContaining(lng, lat, territoryFc);

  const substationProps = nearestSubstationResult.feature?.properties ?? null;
  const substationGeometry = nearestSubstationResult.feature?.geometry;
  const substationCoords =
    substationGeometry?.type === "Point" ? (substationGeometry.coordinates as [number, number]) : null;
  const nearestSubstation: PowerAnalysis["nearestSubstation"] = {
    distanceMiles: nearestSubstationResult.distanceMiles,
    nearestFeatureLabel: substationProps?.Name ?? (substationProps ? `Substation (${substationProps.County ?? "unnamed"})` : null),
    maxVoltageKv: substationProps?.MaxVoltKv ?? null,
    lineCount: substationProps?.Lines ?? null,
    lng: substationCoords?.[0] ?? null,
    lat: substationCoords?.[1] ?? null,
    confidence: nearestSubstationResult.feature ? "fact" : "unknown",
    source: NATIONAL_SOURCES.hifldSubstations,
  };

  const eiaConfigured = Boolean(process.env.EIA_API_KEY);
  const plants = generationFc.features
    .filter(
      (f): f is Feature<{ type: "Point"; coordinates: [number, number] }, typeof f.properties> =>
        f.geometry?.type === "Point"
    )
    .map((f) => {
      const [pLng, pLat] = f.geometry.coordinates;
      return {
        name: f.properties?.plantName ?? "Unknown",
        mw: f.properties?.nameplateMw ?? 0,
        fuel: f.properties?.fuel ?? "Unknown",
        miles: Math.round(milesBetween(lng, lat, pLng, pLat) * 100) / 100,
      };
    })
    .sort((a, b) => a.miles - b.miles);
  const totalMw = plants.reduce((sum, p) => sum + (p.mw || 0), 0);

  return {
    facilityRequirementMw: mwLoad,
    nearestTransmission: nearestAny,
    nearest115kv: nearest115,
    nearest230kv: nearest230,
    nearest500kv: nearest500,
    nearestSubstation,
    utilityTerritory: {
      label: "Utility service territory",
      value: (territory?.properties as { Name?: string } | undefined)?.Name ?? null,
      confidence: territory ? "proxy" : "unknown",
      source: bundle.utilityTerritorySource,
      caveats: bundle.utilityTerritoryCaveats,
    },
    nearbyGeneration: {
      label: `Generation capacity within ${NEARBY_GENERATION_RADIUS_MI} mi`,
      value: eiaConfigured ? { totalMw, count: plants.length, plants: plants.slice(0, 15) } : null,
      confidence: eiaConfigured ? "fact" : "unknown",
      source: NATIONAL_SOURCES.eia,
      caveats: eiaConfigured
        ? ["Reflects EIA-reported nameplate capacity, not real-time output or available headroom."]
        : ["EIA_API_KEY is not configured on the server — nearby generation capacity is unavailable."],
    },
    gridCapacity: {
      label: "Interconnection / substation capacity",
      value: "Unknown",
      confidence: "unknown",
      source: bundle.transmissionSource,
      caveats: [
        nearestSubstation.nearestFeatureLabel
          ? `Nearest known substation is ${nearestSubstation.distanceMiles} mi away (${nearestSubstation.nearestFeatureLabel}${nearestSubstation.maxVoltageKv ? `, up to ${nearestSubstation.maxVoltageKv} kV` : ""}) — location only, not a statement of available headroom.`
          : "No known substation location found near this site in the source dataset.",
        "Substation and feeder headroom are not published data. Transmission-line and substation proximity indicate access to the grid, not available capacity.",
        "A formal interconnection study by the transmission owner / serving utility is required to determine actual available capacity.",
      ],
    },
    gridDemandPressure: {
      label: "Existing grid demand pressure (county population density)",
      value: densityRecord
        ? { countyName: county?.name ?? densityRecord.name, densityPerSqMi: densityRecord.densityPerSqMi }
        : null,
      confidence: densityRecord ? "estimated" : "unknown",
      source: NATIONAL_SOURCES.censusCountyDensity,
      demandPressureLabel,
      caveats: densityRecord
        ? [
            `${densityRecord.name}, ${densityRecord.state} has roughly ${Math.round(densityRecord.densityPerSqMi).toLocaleString()} people/sq mi — ${demandPressureLabel.toLowerCase()} existing residential/commercial demand likely already sharing capacity on the local transmission and distribution system.`,
            "A proxy for competing local load, not measured substation/feeder headroom — a nearby high-voltage line does not guarantee available capacity in a dense county.",
          ]
        : ["County could not be determined for this location — demand-pressure context is unavailable."],
    },
    likelyAction: {
      label: "Likely next step",
      value:
        mwLoad >= 20
          ? `Utility/${bundle.interconnectionAuthorityLabel} interconnection study likely required given facility size.`
          : "Utility service inquiry recommended; interconnection study may still apply.",
      confidence: "estimated",
      source: bundle.transmissionSource,
    },
  };
}
