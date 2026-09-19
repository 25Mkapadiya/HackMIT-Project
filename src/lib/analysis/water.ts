import type { FeatureCollection, Geometry } from "geojson";
import type { ScenarioConfig, WaterAnalysis } from "@/lib/types";
import { getFetcher, getStateGisBundle, noDatasetSource } from "@/lib/gis/stateGis";
import { bboxAroundMiles, featuresWithinRadius, nearestFeature, polygonContaining } from "@/lib/spatial/geo";
import {
  ASSUMED_PUE,
  COOLING_TECH_TO_WUE_KEY,
  GALLONS_PER_LITER,
  WUE_L_PER_KWH,
} from "@/lib/constants/assumptions";

/** D0 (abnormally dry) through D4 (exceptional drought) — US Drought Monitor classification labels. */
const USDM_LABELS = [
  "D0 – Abnormally dry",
  "D1 – Moderate drought",
  "D2 – Severe drought",
  "D3 – Extreme drought",
  "D4 – Exceptional drought",
];

export async function computeWaterAnalysis(scenario: ScenarioConfig): Promise<WaterAnalysis> {
  const { lng, lat, mwLoad, coolingTechnology, stateId } = scenario;
  const bundle = getStateGisBundle(stateId);

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

  // Data-shape-driven, not state-name-driven: a drought layer that carries a
  // numeric DM property (US Drought Monitor's D0-D4 severity scale, used by
  // Oklahoma and any future state that reuses it) gets interpreted as a
  // severity level; a boolean declared-area layer (Washington's Ecology
  // drought-areas layer) falls back to the original in/out-of-drought-area logic.
  let waterStress: "Low" | "Medium" | "High" | "Unknown" = "Low";
  let droughtStatusText: string;
  const dm = droughtFeature?.properties?.DM;
  if (typeof dm === "number") {
    droughtStatusText = USDM_LABELS[dm] ?? `D${dm}`;
    waterStress = dm >= 3 ? "High" : dm >= 1 ? "Medium" : "Low";
  } else {
    const inDrought = droughtFeature != null;
    droughtStatusText = inDrought ? "Within a declared drought area" : "No active declared drought area at this location";
    waterStress = inDrought ? "High" : rightsNearby.length >= 15 ? "Medium" : "Low";
  }

  const wueKey = COOLING_TECH_TO_WUE_KEY[coolingTechnology] ?? "us_average";
  const wue = WUE_L_PER_KWH[wueKey] ?? WUE_L_PER_KWH.us_average;

  const facilityLoadKw = mwLoad * 1000 * ASSUMED_PUE;
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
        methodology: `PUE ${ASSUMED_PUE} × ${mwLoad} MW IT load × 24h × ${wue.value} L/kWh (${wue.label}), converted to gallons.`,
      },
      caveats: [
        "Model estimate from published WUE reference coefficients, not a site-specific engineering study.",
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
      source: bundle.hydrographySource,
    },
    nearbyWaterRightsCount: bundle.waterRightsSource
      ? {
          label: "Water right diversions within 10 mi",
          value: rightsNearby.length,
          confidence: "fact",
          source: bundle.waterRightsSource,
          caveats: ["Count of mapped diversion/well points, not a measure of remaining unallocated water."],
        }
      : {
          label: "Water right / appropriation points within 10 mi",
          value: null,
          confidence: "unknown",
          source: noDatasetSource("water-rights/appropriation-permit"),
          caveats: [`No public water-rights/appropriation-permit dataset is integrated for ${bundle.stateCode} yet.`],
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
