import type { FeatureCollection, Geometry } from "geojson";
import type { ScenarioConfig, WaterAnalysis } from "@/lib/types";
import { getFetcher, getStateGisBundle } from "@/lib/gis/stateGis";
import { NATIONAL_SOURCES } from "@/lib/gis/nationalSources";
import { bboxAroundMiles, featuresWithinRadius, nearestFeature, polygonContaining } from "@/lib/spatial/geo";
import { COOLING_TECH_TO_WUE_KEY, GALLONS_PER_LITER, WUE_L_PER_KWH } from "@/lib/constants/assumptions";

/** D0 (abnormally dry) through D4 (exceptional drought) — US Drought Monitor classification labels. */
const USDM_LABELS = [
  "D0 – Abnormally dry",
  "D1 – Moderate drought",
  "D2 – Severe drought",
  "D3 – Extreme drought",
  "D4 – Exceptional drought",
];

/**
 * Data-shape-driven, not state-name-driven: a drought layer that carries a
 * numeric DM property (US Drought Monitor's D0-D4 severity scale, used by
 * Oklahoma and any future state that reuses it) gets interpreted as a
 * severity level; a boolean declared-area layer (Washington's Ecology
 * drought-areas layer) falls back to the original in/out-of-drought-area logic.
 */
function deriveWaterStress(
  droughtFeature: { properties?: { DM?: number } } | null,
  rightsNearbyCount: number
): { waterStress: "Low" | "Medium" | "High" | "Unknown"; droughtStatusText: string } {
  const dm = droughtFeature?.properties?.DM;
  if (typeof dm === "number") {
    return {
      droughtStatusText: USDM_LABELS[dm] ?? `D${dm}`,
      waterStress: dm >= 3 ? "High" : dm >= 1 ? "Medium" : "Low",
    };
  }
  const inDrought = droughtFeature != null;
  return {
    droughtStatusText: inDrought ? "Within a declared drought area" : "No active declared drought area at this location",
    waterStress: inDrought ? "High" : rightsNearbyCount >= 15 ? "Medium" : "Low",
  };
}

/**
 * Lightweight water-stress-only lookup (drought + nearby water-right density),
 * split out from the full water analysis so efficiency.ts can factor water
 * stress into its estimated-PUE model without waiting on (or duplicating) the
 * full water analysis, which itself needs that estimated PUE for its
 * consumption/withdrawal figures. Re-fetches the same drought/rights data
 * computeWaterAnalysis fetches — both hit the same per-bbox ArcGIS cache
 * entry (see arcgis.ts), so this never costs a second network round trip.
 */
export async function computeWaterStressContext(
  scenario: ScenarioConfig
): Promise<{ waterStress: "Low" | "Medium" | "High" | "Unknown" }> {
  const { lng, lat, stateId } = scenario;
  const rightsBbox = bboxAroundMiles(lng, lat, 10);
  const droughtBbox = bboxAroundMiles(lng, lat, 20);

  const [rightsFc, droughtFc] = await Promise.all([
    getFetcher(stateId, "water-diversions")(rightsBbox) as Promise<FeatureCollection<Geometry, Record<string, unknown>>>,
    getFetcher(stateId, "drought-areas")(droughtBbox) as Promise<FeatureCollection<Geometry, { DM?: number }>>,
  ]);

  const rightsNearby = featuresWithinRadius(lng, lat, rightsFc, 10);
  const droughtFeature = polygonContaining(lng, lat, droughtFc);
  const { waterStress } = deriveWaterStress(droughtFeature, rightsNearby.length);
  return { waterStress };
}

export async function computeWaterAnalysis(scenario: ScenarioConfig, estimatedPue: number): Promise<WaterAnalysis> {
  const { lng, lat, mwLoad, coolingTechnology, stateId } = scenario;
  const bundle = getStateGisBundle(stateId);
  const hasWaterRightsLayer = Boolean(bundle.fetchers["water-diversions"]);

  const waterBbox = bboxAroundMiles(lng, lat, 15);
  const rightsBbox = bboxAroundMiles(lng, lat, 10);
  const droughtBbox = bboxAroundMiles(lng, lat, 20);

  const [riversFc, waterbodiesFc, rightsFc, droughtFc] = await Promise.all([
    getFetcher(stateId, "hydrography-rivers")(waterBbox) as Promise<FeatureCollection<Geometry, { GNIS_Name?: string }>>,
    getFetcher(stateId, "hydrography-waterbodies")(waterBbox) as Promise<
      FeatureCollection<Geometry, { GNIS_Name?: string }>
    >,
    getFetcher(stateId, "water-diversions")(rightsBbox) as Promise<FeatureCollection<Geometry, Record<string, unknown>>>,
    getFetcher(stateId, "drought-areas")(droughtBbox) as Promise<FeatureCollection<Geometry, { DM?: number }>>,
  ]);

  const combinedWater: FeatureCollection<Geometry, { GNIS_Name?: string }> = {
    type: "FeatureCollection",
    features: [...riversFc.features, ...waterbodiesFc.features],
  };
  const nearestWater = nearestFeature(lng, lat, combinedWater);

  const rightsNearby = featuresWithinRadius(lng, lat, rightsFc, 10);
  const droughtFeature = polygonContaining(lng, lat, droughtFc);
  const { waterStress, droughtStatusText } = deriveWaterStress(droughtFeature, rightsNearby.length);

  const wueKey = COOLING_TECH_TO_WUE_KEY[coolingTechnology] ?? "us_average";
  const wue = WUE_L_PER_KWH[wueKey] ?? WUE_L_PER_KWH.us_average;

  const facilityLoadKw = mwLoad * 1000 * estimatedPue;
  const kwhPerDay = facilityLoadKw * 24;
  const litersPerDay = kwhPerDay * wue.value;
  const gallonsPerDay = litersPerDay * GALLONS_PER_LITER;
  const isOpenLoop = scenario.loopType === "open_loop";
  const withdrawalGalPerDay = isOpenLoop ? gallonsPerDay * 2.2 : gallonsPerDay * 1.1;

  return {
    estimatedConsumptionGalPerDay: {
      label: "Estimated water consumption",
      value: Math.round(gallonsPerDay),
      unit: "gal/day",
      confidence: "estimated",
      source: {
        id: "wue-model",
        name: "WUE-based cooling water model",
        url: "",
        methodology: `Estimated PUE ${estimatedPue} × ${mwLoad} MW IT load × 24h × ${wue.value} L/kWh (${wue.label}), converted to gallons.`,
      },
      caveats: [
        "Model estimate from published WUE reference coefficients, not a site-specific engineering study.",
        "Uses this scenario's modeled PUE estimate (see the Efficiency section), itself a directional industry-benchmark model, not a measured figure.",
        "Actual consumption depends on climate, chiller design, and operating setpoints.",
      ],
    },
    estimatedWithdrawalGalPerDay: {
      label: "Estimated water withdrawal",
      value: Math.round(withdrawalGalPerDay),
      unit: "gal/day",
      confidence: "estimated",
      source: {
        id: "wue-model",
        name: "WUE-based cooling water model",
        url: "",
        methodology: "Withdrawal approximated as a multiple of consumption depending on open- vs closed-loop design.",
      },
      caveats: ["Withdrawal exceeds consumption because not all withdrawn water is evaporated/lost."],
    },
    nearestWaterBody: {
      distanceMiles: nearestWater.distanceMiles,
      nearestFeatureLabel: nearestWater.feature?.properties?.GNIS_Name ?? (nearestWater.feature ? "Unnamed waterway" : null),
      confidence: nearestWater.feature ? "fact" : "unknown",
      source: NATIONAL_SOURCES.usgsNhdFlowline,
    },
    nearbyWaterRightsCount: {
      label: "Water right diversions within 10 mi",
      value: hasWaterRightsLayer ? rightsNearby.length : null,
      confidence: hasWaterRightsLayer ? "fact" : "unknown",
      source: bundle.waterRightsSource,
      caveats: hasWaterRightsLayer
        ? ["Count of mapped diversion/well points, not a measure of remaining unallocated water."]
        : [
            "No verified point-level water-right/withdrawal-permit GIS layer is integrated for this state. A missing layer must not be interpreted as zero nearby users or unrestricted water availability.",
          ],
    },
    droughtStatus: {
      label: "Drought status",
      value: droughtStatusText,
      confidence: "fact",
      source: bundle.droughtSource,
    },
    waterStressLabel: {
      label: "Water stress (proxy)",
      value: waterStress,
      confidence: "proxy",
      source: bundle.droughtSource,
      caveats: [
        "Heuristic proxy from drought status and mapped water-right density — not a basin water-balance or availability study.",
      ],
    },
    wueAssumption: {
      label: `WUE assumption (${wue.label})`,
      value: wue.value,
      unit: "L/kWh",
      confidence: "estimated",
      source: {
        id: "wue-reference",
        name: "Industry-published WUE reference values",
        url: "",
        methodology: wue.description,
      },
    },
  };
}
