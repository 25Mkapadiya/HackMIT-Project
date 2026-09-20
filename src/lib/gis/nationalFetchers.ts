import type { Feature, FeatureCollection, Geometry, MultiPolygon, Point, Polygon } from "geojson";
import { queryArcGisGeoJSON, type Bbox } from "./arcgis";
import { cached, TTL } from "@/lib/cache/memoryCache";
import * as turf from "@turf/turf";
import { NATIONAL_SOURCES } from "./nationalSources";
import countyPopulationDensityData from "./data/countyPopulationDensity.json";
import { VOLTAGE_TIERS } from "@/lib/constants/assumptions";

const UA = "Mozilla/5.0 (compatible; DataCenterSitingPlatform/1.0; +https://vercel.com)";

function inBbox(lng: number, lat: number, bbox: Bbox): boolean {
  return lng >= bbox[0] && lng <= bbox[2] && lat >= bbox[1] && lat <= bbox[3];
}

/** Same generalization heuristic as layerFetchers.ts — see that file for rationale. */
function generalizationFor(bbox: Bbox): number {
  const width = bbox[2] - bbox[0];
  return Math.max(0.00005, width / 600);
}

// ---------------------------------------------------------------- WATER (nationwide)

export async function fetchNhdFlowline(bbox: Bbox) {
  return queryArcGisGeoJSON(NATIONAL_SOURCES.usgsNhdFlowline.url, { bbox, outFields: "GNIS_Name,FType" }, TTL.ONE_DAY);
}

export async function fetchNhdWaterbody(bbox: Bbox) {
  return queryArcGisGeoJSON(NATIONAL_SOURCES.usgsNhdWaterbody.url, { bbox, outFields: "GNIS_Name,FType" }, TTL.ONE_DAY);
}

interface NwisTimeSeries {
  sourceInfo: {
    siteName: string;
    siteCode: { value: string }[];
    geoLocation: { geogLocation: { latitude: number; longitude: number } };
  };
  variable: { variableName: string; unit: { unitCode: string } };
  values: { value: { value: string; dateTime: string }[] }[];
}

export async function fetchUsgsGauges(bbox: Bbox, stateAbbr: string): Promise<FeatureCollection<Point>> {
  const url = `https://waterservices.usgs.gov/nwis/iv/?format=json&stateCd=${stateAbbr}&siteType=ST&parameterCd=00060&siteStatus=active`;
  const data = await cached(`usgs-gauges-${stateAbbr.toLowerCase()}`, TTL.FIFTEEN_MINUTES, async () => {
    const res = await fetch(url, { headers: { "User-Agent": UA }, cache: "no-store" });
    if (!res.ok) throw new Error(`USGS NWIS query failed (${res.status})`);
    return (await res.json()) as { value: { timeSeries: NwisTimeSeries[] } };
  });

  const features: Feature<Point>[] = [];
  for (const ts of data.value.timeSeries) {
    const lat = ts.sourceInfo.geoLocation.geogLocation.latitude;
    const lng = ts.sourceInfo.geoLocation.geogLocation.longitude;
    if (!inBbox(lng, lat, bbox)) continue;
    const latest = ts.values[0]?.value[ts.values[0]?.value.length - 1];
    features.push({
      type: "Feature",
      geometry: { type: "Point", coordinates: [lng, lat] },
      properties: {
        siteName: ts.sourceInfo.siteName,
        siteCode: ts.sourceInfo.siteCode[0]?.value ?? null,
        variable: ts.variable.variableName,
        unit: ts.variable.unit.unitCode,
        latestValue: latest?.value ?? null,
        latestDateTime: latest?.dateTime ?? null,
      },
    });
  }
  return { type: "FeatureCollection", features };
}

/** Nationwide weekly drought classification (D0-D4) — see NATIONAL_SOURCES.usDroughtMonitor. */
export async function fetchUsDroughtMonitor(bbox: Bbox) {
  return queryArcGisGeoJSON(
    NATIONAL_SOURCES.usDroughtMonitor.url,
    { bbox, outFields: "DM" },
    TTL.ONE_DAY
  );
}

// ---------------------------------------------------------- CONNECTIVITY (nationwide)

interface PeeringDbFacility {
  id: number;
  name: string;
  city: string;
  state: string;
  latitude: number | null;
  longitude: number | null;
  website: string | null;
}

export async function fetchColocationFacilities(bbox: Bbox, stateAbbr: string): Promise<FeatureCollection<Point>> {
  const data = await cached(`peeringdb-fac-${stateAbbr.toLowerCase()}`, TTL.ONE_DAY, async () => {
    const res = await fetch(`https://www.peeringdb.com/api/fac?country=US&state=${stateAbbr}`, {
      headers: { "User-Agent": UA, Accept: "application/json" },
      cache: "no-store",
    });
    if (!res.ok) throw new Error(`PeeringDB query failed (${res.status})`);
    return (await res.json()) as { data: PeeringDbFacility[] };
  });

  const features: Feature<Point>[] = data.data
    .filter((f) => f.latitude != null && f.longitude != null && inBbox(f.longitude, f.latitude, bbox))
    .map((f) => ({
      type: "Feature",
      geometry: { type: "Point", coordinates: [f.longitude as number, f.latitude as number] },
      properties: { name: f.name, city: f.city, website: f.website },
    }));
  return { type: "FeatureCollection", features };
}

// ----------------------------------------------------------- ENVIRONMENT (nationwide)

export async function fetchFemaFloodZones(bbox: Bbox) {
  return queryArcGisGeoJSON(
    NATIONAL_SOURCES.femaNfhl.url,
    { bbox, outFields: "FLD_ZONE,ZONE_SUBTY,SFHA_TF", maxAllowableOffset: generalizationFor(bbox) },
    TTL.ONE_DAY
  );
}

// ------------------------------------------------------------- COMMUNITY (nationwide)

export async function fetchPopulationTracts(bbox: Bbox) {
  return queryArcGisGeoJSON(
    NATIONAL_SOURCES.censusTiger.url + "/8",
    { bbox, outFields: "GEOID,NAME,BASENAME,STATE,COUNTY,TRACT", maxAllowableOffset: generalizationFor(bbox) },
    TTL.ONE_DAY
  );
}

export interface CountyDensityRecord {
  name: string;
  state: string;
  population: number;
  landAreaSqMi: number;
  densityPerSqMi: number;
}

interface CountyDensityDataset {
  vintage: number;
  asOf: string;
  counties: Record<string, CountyDensityRecord>;
}

const COUNTY_DENSITY = countyPopulationDensityData as CountyDensityDataset;

export function getCountyDensityRecord(geoid: string | null | undefined): CountyDensityRecord | null {
  if (!geoid) return null;
  return COUNTY_DENSITY.counties[geoid] ?? null;
}

export const COUNTY_DENSITY_VINTAGE = { year: COUNTY_DENSITY.vintage, asOf: COUNTY_DENSITY.asOf };

/** Shared raw county-boundary fetch — same params every caller uses, so they hit one cache entry. */
async function fetchCountyPolygonsForBbox(bbox: Bbox) {
  return queryArcGisGeoJSON<{ GEOID?: string; NAME?: string; STATE?: string }>(
    NATIONAL_SOURCES.censusTiger.url + "/82",
    { bbox, outFields: "GEOID,NAME,STATE", maxAllowableOffset: generalizationFor(bbox) },
    TTL.ONE_DAY
  );
}

/**
 * County polygons (live TIGERweb, layer 82 in tigerWMS_Current) with population
 * density joined in by GEOID from the precomputed Gazetteer+PEP dataset (see
 * scripts/county_population_density.py). Boundaries are always live/current;
 * only the density figures are a static annual snapshot.
 */
export async function fetchCountyPopulationDensity(bbox: Bbox): Promise<FeatureCollection<Geometry, Record<string, unknown>>> {
  const fc = await fetchCountyPolygonsForBbox(bbox);
  return {
    type: "FeatureCollection",
    features: fc.features.map((f) => {
      const geoid = f.properties?.GEOID ?? null;
      const record = getCountyDensityRecord(geoid);
      return {
        ...f,
        properties: {
          GEOID: geoid,
          CountyName: record?.name ?? f.properties?.NAME ?? null,
          State: record?.state ?? null,
          Population: record?.population ?? null,
          LandAreaSqMi: record?.landAreaSqMi ?? null,
          PopulationDensityPerSqMi: record?.densityPerSqMi ?? null,
        },
      };
    }),
  };
}

/**
 * Tags each line feature with the population density of the county it passes
 * through (a representative point on the line, via turf.pointOnFeature —
 * cheap and stable for both LineString and MultiLineString). This is what lets
 * the map draw transmission lines with a "demand pressure" halo (see
 * layerStyles.ts) instead of only showing population density as a separate,
 * disconnected background layer — the whole point being to visually connect
 * the two datasets, not just place them side by side.
 */
export async function tagLinesWithCountyDensity<P extends Record<string, unknown>>(
  fc: FeatureCollection<Geometry, P>,
  bbox: Bbox
): Promise<FeatureCollection<Geometry, P & { PopulationDensityPerSqMi: number | null }>> {
  const countyFc = await fetchCountyPolygonsForBbox(bbox);
  return {
    type: "FeatureCollection",
    features: fc.features.map((f) => {
      let density: number | null = null;
      if (f.geometry) {
        try {
          const pt = turf.pointOnFeature(f as Feature<Geometry>);
          for (const county of countyFc.features) {
            if (!county.geometry) continue;
            if (turf.booleanPointInPolygon(pt, county as Feature<Polygon | MultiPolygon>)) {
              density = getCountyDensityRecord(county.properties?.GEOID ?? null)?.densityPerSqMi ?? null;
              break;
            }
          }
        } catch {
          density = null;
        }
      }
      return { ...f, properties: { ...f.properties, PopulationDensityPerSqMi: density } };
    }),
  };
}

// ------------------------------------------------------------------ POWER (nationwide)

export async function fetchEiaPowerPlants(bbox: Bbox, stateAbbr: string): Promise<FeatureCollection<Point>> {
  const apiKey = process.env.EIA_API_KEY;
  if (!apiKey) {
    return { type: "FeatureCollection", features: [] };
  }
  const url = `https://api.eia.gov/v2/electricity/operating-generator-capacity/data/?api_key=${apiKey}&frequency=monthly&data[]=nameplate-capacity-mw&facets[stateid][]=${stateAbbr}&sort[0][column]=period&sort[0][direction]=desc&length=500`;
  try {
    const data = await cached(`eia-generators-${stateAbbr.toLowerCase()}`, TTL.ONE_DAY, async () => {
      const res = await fetch(url, { cache: "no-store" });
      if (!res.ok) throw new Error(`EIA query failed (${res.status})`);
      return res.json();
    });
    const rows: any[] = data?.response?.data ?? [];
    const features: Feature<Point>[] = rows
      .filter((r) => typeof r.latitude === "number" && typeof r.longitude === "number")
      .filter((r) => inBbox(r.longitude, r.latitude, bbox))
      .map((r) => ({
        type: "Feature",
        geometry: { type: "Point", coordinates: [r.longitude, r.latitude] },
        properties: {
          plantName: r["plantName"] ?? r["plant-name"] ?? "Unknown",
          fuel: r["energy-source-desc"] ?? r["technology"] ?? "Unknown",
          nameplateMw: r["nameplate-capacity-mw"] ?? null,
        },
      }));
    return { type: "FeatureCollection", features };
  } catch {
    return { type: "FeatureCollection", features: [] };
  }
}

interface HifldTransmissionRaw {
  owner?: string;
  voltage?: number | string;
  volt_class?: string;
  type?: string;
  status?: string;
  id?: string;
  source?: string;
}

/**
 * HIFLD's nationwide transmission-line extract, normalized onto the SAME property
 * names Washington's BPA feed already uses (VoltageMeas / OperatingLineNm / XRefCd)
 * so the map's voltage-based styling (layerStyles.ts), the popup (popupContent.ts),
 * and the analysis engine (power.ts) all work unmodified regardless of which state's
 * fetcher produced the feature. See Step 6 in the integration brief this follows:
 * "The frontend should NOT need to understand each state's original field names."
 */
export async function fetchHifldTransmissionLines(bbox: Bbox): Promise<FeatureCollection<Geometry, Record<string, unknown>>> {
  const fc = await queryArcGisGeoJSON<HifldTransmissionRaw>(
    NATIONAL_SOURCES.hifldTransmission.url,
    { bbox, outFields: "owner,voltage,volt_class,type,status,id,source" },
    TTL.ONE_DAY
  );
  const normalized: FeatureCollection<Geometry, Record<string, unknown>> = {
    type: "FeatureCollection",
    features: fc.features.map((f) => {
      const p = f.properties ?? {};
      const rawVoltage = typeof p.voltage === "number" ? p.voltage : Number(p.voltage) || null;
      // HIFLD uses -999999 (and similar large negative sentinels) for "unknown
      // voltage" rather than a null value — treat any non-positive reading as
      // unknown so it never gets displayed or compared against as a real kV figure.
      const voltage = rawVoltage != null && rawVoltage > 0 ? rawVoltage : null;
      return {
        ...f,
        properties: {
          VoltageMeas: voltage,
          OperatingLineNm: p.owner ? `${p.owner}${p.type ? ` (${p.type})` : ""}` : null,
          XRefCd: p.id ?? null,
          Owner: p.owner ?? null,
          Status: p.status ?? null,
          Source: p.source ?? null,
        },
      };
    }),
  };
  return tagLinesWithCountyDensity(normalized, bbox);
}

/**
 * Splits a transmission-line FeatureCollection into "high" (>= VOLTAGE_TIERS.high,
 * i.e. 230kV+) and "low" (everything else, including unknown/unclassified voltage)
 * tiers — backs the two separately-toggleable map layers (see layerStyles.ts /
 * layers.ts), while power.ts still fetches the unfiltered "transmission-lines" set
 * for its nearest-115/230/500kV distance calculations.
 */
export function filterTransmissionByVoltageTier<P extends { VoltageMeas?: number | null }>(
  fc: FeatureCollection<Geometry, P>,
  tier: "high" | "low"
): FeatureCollection<Geometry, P> {
  return {
    type: "FeatureCollection",
    features: fc.features.filter((f) => {
      const kv = f.properties?.VoltageMeas ?? 0;
      return tier === "high" ? kv >= VOLTAGE_TIERS.high : kv < VOLTAGE_TIERS.high;
    }),
  };
}

export async function fetchHifldTransmissionLinesHigh(bbox: Bbox) {
  return filterTransmissionByVoltageTier(await fetchHifldTransmissionLines(bbox), "high");
}

export async function fetchHifldTransmissionLinesLow(bbox: Bbox) {
  return filterTransmissionByVoltageTier(await fetchHifldTransmissionLines(bbox), "low");
}

interface HifldSubstationRaw {
  NAME?: string;
  CITY?: string;
  STATE?: string;
  COUNTY?: string;
  TYPE?: string;
  STATUS?: string;
  LINES?: number;
  MAX_VOLT?: number;
  MIN_VOLT?: number;
  OWNERNSHIP?: string;
}

/** The source service splits substations across 8 point sub-layers by voltage tier — see NATIONAL_SOURCES.hifldSubstations. */
const HIFLD_SUBSTATION_SUBLAYER_IDS = [0, 1, 2, 3, 4, 5, 6, 7];

/**
 * Nationwide HIFLD substation points, merged from all 8 voltage-tier sub-layers
 * of the source service and normalized onto simple PascalCase property names
 * (Name/City/State/County/Type/Status/Lines/MaxVoltKv/MinVoltKv/Owner) used by
 * the map popup (popupContent.ts) and the power analysis engine (power.ts).
 * A sub-layer query failure degrades to "no features from that tier" rather
 * than failing the whole layer — most bboxes only touch one or two tiers anyway.
 */
export async function fetchHifldSubstations(bbox: Bbox): Promise<FeatureCollection<Geometry, Record<string, unknown>>> {
  const results = await Promise.all(
    HIFLD_SUBSTATION_SUBLAYER_IDS.map((id) =>
      queryArcGisGeoJSON<HifldSubstationRaw>(
        `${NATIONAL_SOURCES.hifldSubstations.url}/${id}`,
        { bbox, outFields: "NAME,CITY,STATE,COUNTY,TYPE,STATUS,LINES,MAX_VOLT,MIN_VOLT,OWNERNSHIP" },
        TTL.ONE_DAY
      ).catch(() => ({ type: "FeatureCollection", features: [] }) as FeatureCollection<Geometry, HifldSubstationRaw>)
    )
  );
  const features = results.flatMap((fc) =>
    fc.features.map((f) => {
      const p = f.properties ?? {};
      // Source uses 0/negative sentinels for "unknown voltage" on this dataset too.
      const maxVolt = typeof p.MAX_VOLT === "number" && p.MAX_VOLT > 0 ? p.MAX_VOLT : null;
      const minVolt = typeof p.MIN_VOLT === "number" && p.MIN_VOLT > 0 ? p.MIN_VOLT : null;
      return {
        ...f,
        properties: {
          // Many legacy HIFLD substation records carry a placeholder "UNKNOWN<id>" name.
          Name: p.NAME && !p.NAME.startsWith("UNKNOWN") ? p.NAME : null,
          City: p.CITY || null,
          State: p.STATE || null,
          County: p.COUNTY || null,
          Type: p.TYPE || null,
          Status: p.STATUS || null,
          Lines: p.LINES ?? null,
          MaxVoltKv: maxVolt,
          MinVoltKv: minVolt,
          Owner: p.OWNERNSHIP || null,
        },
      };
    })
  );
  return { type: "FeatureCollection", features };
}

/**
 * Service-territory layers contain nested/overlapping polygons (e.g. a municipal
 * utility inside a larger IOU territory). polygonContaining() returns the first
 * containing polygon, so order smallest-area first: the most specific serving
 * utility wins instead of whichever large background polygon comes back first.
 */
export function sortSmallestAreaFirst<T extends Feature<Geometry, any>>(features: T[]): T[] {
  const areaOf = (f: T): number => {
    try {
      return f.geometry ? turf.area(f as any) : Infinity;
    } catch {
      return Infinity;
    }
  };
  return features
    .map((f) => ({ f, a: areaOf(f) }))
    .sort((x, y) => x.a - y.a)
    .map((x) => x.f);
}

interface HifldTerritoryRaw {
  NAME?: string;
  STATE?: string;
  TYPE?: string;
}

/** Normalized onto WA's `Name` property so utility-territories works unmodified for any state. */
export async function fetchHifldUtilityTerritories(bbox: Bbox): Promise<FeatureCollection<Geometry, Record<string, unknown>>> {
  const fc = await queryArcGisGeoJSON<HifldTerritoryRaw>(
    NATIONAL_SOURCES.hifldUtilityTerritories.url,
    { bbox, outFields: "NAME,STATE,TYPE", maxAllowableOffset: generalizationFor(bbox) },
    TTL.ONE_DAY
  );
  return {
    type: "FeatureCollection",
    features: sortSmallestAreaFirst(
      fc.features.map((f) => ({
        ...f,
        properties: {
          Name: f.properties?.NAME ?? null,
          State: f.properties?.STATE ?? null,
          UtilityType: f.properties?.TYPE ?? null,
        },
      }))
    ),
  };
}
