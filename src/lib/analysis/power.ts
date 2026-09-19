import type { Feature, FeatureCollection, Geometry } from "geojson";
import type { DistanceResult, PowerAnalysis, ScenarioConfig, SourceMeta } from "@/lib/types";
import { getFetcher, getStateGisBundle } from "@/lib/gis/stateGis";
import { NATIONAL_SOURCES } from "@/lib/gis/nationalSources";
import { bboxAroundMiles, milesBetween, nearestFeature, nearestFeatureWhere, polygonContaining } from "@/lib/spatial/geo";
import { NEARBY_GENERATION_RADIUS_MI, VOLTAGE_TIERS } from "@/lib/constants/assumptions";

interface TransmissionProps {
  XRefCd?: string;
  OperatingLineNm?: string;
  VoltageMeas?: number;
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

  const [transmissionFc, territoryFc, generationFc] = await Promise.all([
    getFetcher(stateId, "transmission-lines")(transmissionBbox) as Promise<FeatureCollection<Geometry, TransmissionProps>>,
    getFetcher(stateId, "utility-territories")(territoryBbox) as Promise<
      FeatureCollection<Geometry, { Name?: string }>
    >,
    getFetcher(stateId, "power-plants")(generationBbox) as Promise<
      FeatureCollection<Geometry, { plantName?: string; fuel?: string; nameplateMw?: number }>
    >,
  ]);

  const nearestAny = toDistanceResult(nearestFeature(lng, lat, transmissionFc), bundle.transmissionSource);
  const nearest115 = toDistanceResult(
    nearestFeatureWhere(lng, lat, transmissionFc, (p) => (p.VoltageMeas ?? 0) >= VOLTAGE_TIERS.mid),
    bundle.transmissionSource
  );
  const nearest230 = toDistanceResult(
    nearestFeatureWhere(lng, lat, transmissionFc, (p) => (p.VoltageMeas ?? 0) >= VOLTAGE_TIERS.high),
    bundle.transmissionSource
  );
  const nearest500 = toDistanceResult(
    nearestFeatureWhere(lng, lat, transmissionFc, (p) => (p.VoltageMeas ?? 0) >= VOLTAGE_TIERS.extraHigh),
    bundle.transmissionSource
  );

  const territory = polygonContaining(lng, lat, territoryFc);

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
        "Substation and feeder headroom are not published data. Transmission-line proximity indicates access to the grid, not available capacity.",
        "A formal interconnection study by the transmission owner / serving utility is required to determine actual available capacity.",
      ],
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
