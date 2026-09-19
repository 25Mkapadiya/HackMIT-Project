import type { FeatureCollection, Geometry } from "geojson";
import type { ScenarioConfig, WaterAnalysis } from "@/lib/types";
import { bboxAroundMiles, featuresWithinRadius, nearestFeature, polygonContaining } from "@/lib/spatial/geo";
import {
  ASSUMED_PUE,
  COOLING_TECH_TO_WUE_KEY,
  GALLONS_PER_LITER,
  WUE_L_PER_KWH,
} from "@/lib/constants/assumptions";
import { fetchLayer, getSource, type StateAnalysisContext } from "./context";

export async function computeWaterAnalysis(scenario: ScenarioConfig, ctx: StateAnalysisContext): Promise<WaterAnalysis> {
  const { lng, lat, mwLoad, coolingTechnology } = scenario;
  const nhdSource = getSource(ctx, "usgsNhdFlowline");
  const waterRightsSource = getSource(ctx, "waterRights");
  const droughtSource = getSource(ctx, "drought");
  const hasDroughtLayer = Boolean(ctx.fetchers["drought-areas"]);
  const hasWaterRightsLayer = Boolean(ctx.fetchers["water-diversions"]);

  const waterBbox = bboxAroundMiles(lng, lat, 15);
  const rightsBbox = bboxAroundMiles(lng, lat, 10);
  const droughtBbox = bboxAroundMiles(lng, lat, 20);

  const [riversFc, waterbodiesFc, rightsFc, droughtFc] = await Promise.all([
    fetchLayer<{ GNIS_Name?: string }>(ctx, "hydrography-rivers", waterBbox),
    fetchLayer<{ GNIS_Name?: string }>(ctx, "hydrography-waterbodies", waterBbox),
    fetchLayer<Record<string, unknown>>(ctx, "water-diversions", rightsBbox),
    fetchLayer<Record<string, unknown>>(ctx, "drought-areas", droughtBbox),
  ]);

  const combinedWater: FeatureCollection<Geometry, { GNIS_Name?: string }> = {
    type: "FeatureCollection",
    features: [...riversFc.features, ...waterbodiesFc.features],
  };
  const nearestWater = nearestFeature(lng, lat, combinedWater);

  const rightsNearby = featuresWithinRadius(lng, lat, rightsFc, 10);
  const inDrought = hasDroughtLayer ? polygonContaining(lng, lat, droughtFc) != null : null;

  let waterStress: "Low" | "Medium" | "High" | "Unknown" = hasDroughtLayer ? "Low" : "Unknown";
  if (inDrought) waterStress = "High";
  else if (hasWaterRightsLayer && rightsNearby.length >= 15) waterStress = "Medium";

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
      source: nhdSource,
    },
    nearbyWaterRightsCount: {
      label: "Water right / appropriation points within 10 mi",
      value: hasWaterRightsLayer ? rightsNearby.length : null,
      confidence: hasWaterRightsLayer ? "fact" : "unknown",
      source: waterRightsSource,
      caveats: hasWaterRightsLayer
        ? ["Count of mapped diversion/appropriation points, not a measure of remaining unallocated water."]
        : [`No public water-rights/appropriation dataset is integrated for ${ctx.stateCode} yet.`],
    },
    droughtStatus: {
      label: "Drought declaration status",
      value: hasDroughtLayer
        ? inDrought
          ? "Within a declared drought area"
          : "No active declared drought area at this location"
        : "Unknown — no drought-declaration layer integrated for this state",
      confidence: hasDroughtLayer ? "fact" : "unknown",
      source: droughtSource,
    },
    waterStressLabel: {
      label: "Water stress (proxy)",
      value: waterStress,
      confidence: hasDroughtLayer ? "proxy" : "unknown",
      source: droughtSource,
      caveats: hasDroughtLayer
        ? [
            "Heuristic proxy from drought-declaration status and mapped water-right density — not a basin water-balance or availability study.",
          ]
        : [`No drought/water-stress dataset is integrated for ${ctx.stateCode} yet — utility/basin inquiry required.`],
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
