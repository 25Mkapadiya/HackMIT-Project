import type { FeatureCollection, Geometry } from "geojson";
import type { ScenarioConfig, WaterAnalysis } from "@/lib/types";
import { WA_LAYER_FETCHERS } from "@/lib/gis/layerFetchers";
import { bboxAroundMiles, featuresWithinRadius, nearestFeature, polygonContaining } from "@/lib/spatial/geo";
import { WA_SOURCES } from "@/states/washington/sources";
import {
  ASSUMED_PUE,
  COOLING_TECH_TO_WUE_KEY,
  GALLONS_PER_LITER,
  WUE_L_PER_KWH,
} from "@/lib/constants/assumptions";

export async function computeWaterAnalysis(scenario: ScenarioConfig): Promise<WaterAnalysis> {
  const { lng, lat, mwLoad, coolingTechnology } = scenario;

  const waterBbox = bboxAroundMiles(lng, lat, 15);
  const rightsBbox = bboxAroundMiles(lng, lat, 10);
  const droughtBbox = bboxAroundMiles(lng, lat, 20);

  const [riversFc, waterbodiesFc, rightsFc, droughtFc] = await Promise.all([
    WA_LAYER_FETCHERS["hydrography-rivers"]!(waterBbox) as Promise<FeatureCollection<Geometry, { GNIS_Name?: string }>>,
    WA_LAYER_FETCHERS["hydrography-waterbodies"]!(waterBbox) as Promise<
      FeatureCollection<Geometry, { GNIS_Name?: string }>
    >,
    WA_LAYER_FETCHERS["water-diversions"]!(rightsBbox) as Promise<FeatureCollection<Geometry, Record<string, unknown>>>,
    WA_LAYER_FETCHERS["drought-areas"]!(droughtBbox) as Promise<FeatureCollection<Geometry, Record<string, unknown>>>,
  ]);

  const combinedWater: FeatureCollection<Geometry, { GNIS_Name?: string }> = {
    type: "FeatureCollection",
    features: [...riversFc.features, ...waterbodiesFc.features],
  };
  const nearestWater = nearestFeature(lng, lat, combinedWater);

  const rightsNearby = featuresWithinRadius(lng, lat, rightsFc, 10);
  const inDrought = polygonContaining(lng, lat, droughtFc) != null;

  let waterStress: "Low" | "Medium" | "High" | "Unknown" = "Low";
  if (inDrought) waterStress = "High";
  else if (rightsNearby.length >= 15) waterStress = "Medium";

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
      source: WA_SOURCES.usgsNhdFlowline,
    },
    nearbyWaterRightsCount: {
      label: "Water right diversions within 10 mi",
      value: rightsNearby.length,
      confidence: "fact",
      source: WA_SOURCES.waWaterDiversions,
      caveats: ["Count of mapped diversion points, not a measure of remaining unallocated water."],
    },
    droughtStatus: {
      label: "Drought declaration status",
      value: inDrought ? "Within a declared drought area" : "No active declared drought area at this location",
      confidence: "fact",
      source: WA_SOURCES.waDroughtAreas,
    },
    waterStressLabel: {
      label: "Water stress (proxy)",
      value: waterStress,
      confidence: "proxy",
      source: WA_SOURCES.waDroughtAreas,
      caveats: [
        "Heuristic proxy from drought-declaration status and mapped water-right density — not a basin water-balance or availability study.",
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
