import type { Feature, FeatureCollection, Geometry } from "geojson";
import type { DistanceResult, PowerAnalysis, ScenarioConfig } from "@/lib/types";
import { WA_LAYER_FETCHERS } from "@/lib/gis/layerFetchers";
import { bboxAroundMiles, milesBetween, nearestFeature, nearestFeatureWhere, polygonContaining } from "@/lib/spatial/geo";
import { WA_SOURCES } from "@/states/washington/sources";
import { NEARBY_GENERATION_RADIUS_MI, VOLTAGE_TIERS } from "@/lib/constants/assumptions";

interface TransmissionProps {
  XRefCd?: string;
  OperatingLineNm?: string;
  VoltageMeas?: number;
}

function toDistanceResult(
  result: { feature: Feature<Geometry, TransmissionProps> | null; distanceMiles: number | null },
  source = WA_SOURCES.bpaTransmission
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
  const { lng, lat, mwLoad } = scenario;

  const transmissionBbox = bboxAroundMiles(lng, lat, 35);
  const territoryBbox = bboxAroundMiles(lng, lat, 20);
  const generationBbox = bboxAroundMiles(lng, lat, NEARBY_GENERATION_RADIUS_MI);

  const [transmissionFc, territoryFc, generationFc] = await Promise.all([
    WA_LAYER_FETCHERS["transmission-lines"]!(transmissionBbox) as Promise<FeatureCollection<Geometry, TransmissionProps>>,
    WA_LAYER_FETCHERS["utility-territories"]!(territoryBbox) as Promise<
      FeatureCollection<Geometry, { Name?: string }>
    >,
    WA_LAYER_FETCHERS["power-plants"]!(generationBbox) as Promise<
      FeatureCollection<Geometry, { plantName?: string; fuel?: string; nameplateMw?: number }>
    >,
  ]);

  const nearestAny = toDistanceResult(nearestFeature(lng, lat, transmissionFc));
  const nearest115 = toDistanceResult(
    nearestFeatureWhere(lng, lat, transmissionFc, (p) => (p.VoltageMeas ?? 0) >= VOLTAGE_TIERS.mid)
  );
  const nearest230 = toDistanceResult(
    nearestFeatureWhere(lng, lat, transmissionFc, (p) => (p.VoltageMeas ?? 0) >= VOLTAGE_TIERS.high)
  );
  const nearest500 = toDistanceResult(
    nearestFeatureWhere(lng, lat, transmissionFc, (p) => (p.VoltageMeas ?? 0) >= VOLTAGE_TIERS.extraHigh)
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
      source: WA_SOURCES.waUtilityTerritories,
      caveats: [
        "Boundary is informational, compiled by WA Ecology/UTC — not an official service-territory determination.",
      ],
    },
    nearbyGeneration: {
      label: `Generation capacity within ${NEARBY_GENERATION_RADIUS_MI} mi`,
      value: eiaConfigured ? { totalMw, count: plants.length, plants: plants.slice(0, 15) } : null,
      confidence: eiaConfigured ? "fact" : "unknown",
      source: WA_SOURCES.eia,
      caveats: eiaConfigured
        ? ["Reflects EIA-reported nameplate capacity, not real-time output or available headroom."]
        : ["EIA_API_KEY is not configured on the server — nearby generation capacity is unavailable."],
    },
    gridCapacity: {
      label: "Interconnection / substation capacity",
      value: "Unknown",
      confidence: "unknown",
      source: WA_SOURCES.bpaTransmission,
      caveats: [
        "Substation and feeder headroom are not published data. Transmission-line proximity indicates access to the grid, not available capacity.",
        "A formal interconnection study by the transmission owner / serving utility is required to determine actual available capacity.",
      ],
    },
    likelyAction: {
      label: "Likely next step",
      value:
        mwLoad >= 20
          ? "Utility/BPA interconnection study likely required given facility size."
          : "Utility service inquiry recommended; interconnection study may still apply.",
      confidence: "estimated",
      source: WA_SOURCES.bpaTransmission,
    },
  };
}
