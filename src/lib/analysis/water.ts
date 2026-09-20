import type { FeatureCollection, Geometry } from "geojson";
import type { ScenarioConfig, WaterAnalysis } from "@/lib/types";
import { getFetcher, getStateGisBundle } from "@/lib/gis/stateGis";
import { NATIONAL_SOURCES } from "@/lib/gis/nationalSources";
import { bboxAroundMiles, featuresWithinRadius, nearestFeature, polygonContaining } from "@/lib/spatial/geo";
import { CLOSED_LOOP_ANNUAL_MAKEUP_FRACTION, CLOSED_LOOP_GALLONS_PER_TON, CLOSED_LOOP_REFRESH_INTERVAL_YEARS, COOLING_TOWER_CYCLES_OF_CONCENTRATION, COOLING_TOWER_MAKEUP_GAL_PER_TON_DAY_AT_4_COC, KW_PER_REFRIGERATION_TON } from "@/lib/constants/assumptions";

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

export async function computeWaterAnalysis(scenario: ScenarioConfig): Promise<WaterAnalysis> {
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

  const isAirCooledDx = coolingTechnology === "air_cooled_dx";
  const isClosedChilledWater = coolingTechnology === "chilled_water_air_cooled_chiller";
  const isEvaporative = coolingTechnology === "cooling_tower_evaporative";
  const isClosedLoopLiquid = coolingTechnology === "closed_loop_liquid";
  const isImmersion = coolingTechnology === "immersion";

  // Nearly all IT electrical power becomes heat that the cooling system must reject.
  const itLoadKw = mwLoad * 1000;
  const refrigerationTons = itLoadKw / KW_PER_REFRIGERATION_TON;

  // Closed chilled-water loop: annualize conservative makeup + periodic service refill.
  const closedLoopVolumeGal = refrigerationTons * CLOSED_LOOP_GALLONS_PER_TON;
  const closedLoopRoutineMakeupGalPerYear =
    closedLoopVolumeGal * CLOSED_LOOP_ANNUAL_MAKEUP_FRACTION;
  const closedLoopRefreshGalPerYear =
    closedLoopVolumeGal / CLOSED_LOOP_REFRESH_INTERVAL_YEARS;
  const closedLoopAnnualizedGalPerDay =
    (closedLoopRoutineMakeupGalPerYear + closedLoopRefreshGalPerYear) / 365;

  // DOE FEMP cooling-tower table: 4,930 gal/day per 100 tons at 4 COC.
  const evaporativeMakeupGalPerDay =
    refrigerationTons * COOLING_TOWER_MAKEUP_GAL_PER_TON_DAY_AT_4_COC;
  const evaporativeBlowdownGalPerDay =
    evaporativeMakeupGalPerDay / COOLING_TOWER_CYCLES_OF_CONCENTRATION;
  const evaporativeConsumptionGalPerDay =
    Math.max(0, evaporativeMakeupGalPerDay - evaporativeBlowdownGalPerDay);

  // DX, direct-to-chip + dry cooler, and immersion + dry cooler intentionally
  // evaporate no cooling water in this model; routine cooling-process use is ~0.
  const withdrawalGalPerDay = isEvaporative
    ? evaporativeMakeupGalPerDay
    : isClosedChilledWater
      ? closedLoopAnnualizedGalPerDay
      : 0;

  const consumptionGalPerDay = isEvaporative
    ? evaporativeConsumptionGalPerDay
    : isClosedChilledWater
      ? closedLoopAnnualizedGalPerDay
      : 0;

  const waterModelLabel = isAirCooledDx
    ? "Air-cooled DX / dry heat rejection"
    : isClosedChilledWater
      ? "Closed chilled-water loop + air-cooled chiller"
      : isEvaporative
        ? "Evaporative cooling tower"
        : isClosedLoopLiquid
          ? "Direct-to-chip closed loop + dry cooler"
          : isImmersion
            ? "Immersion cooling + dry cooler"
            : "Cooling water model";

  const waterModelSource = isEvaporative
    ? {
        id: "doe-cooling-tower-water",
        name: "U.S. DOE FEMP cooling-tower water-use method",
        url: "https://www.energy.gov/cmei/femp/estimating-methods-determining-end-use-water-consumption",
        methodology:
          "DOE FEMP lists 4,930 gal/day for a 100-ton cooling tower at 4 cycles of concentration and 24-hour full-load operation; the model scales that published factor with refrigeration tonnage.",
      }
    : isClosedChilledWater
      ? {
          id: "ashrae-closed-hydronic-loop",
          name: "ASHRAE closed hydronic loop guidance",
          url: "https://handbook.ashrae.org/Handbooks/A23/SI/A23_Ch50/a23_ch50_si.aspx",
          methodology:
            "ASHRAE describes closed hydronic loops as typically requiring less than 5% makeup/year; the model uses 5%/year plus one full-loop refresh every 3 years, annualized.",
        }
      : {
          id: "ashrae-dry-cooling",
          name: "ASHRAE AI Data Center Energy Performance Framework",
          url: "https://www.ashrae.org/technical-resources/ai-data-center-framework/integrated-design-principles",
          methodology:
            "Dry heat-rejection / closed-loop cooling is modeled with virtually zero routine cooling-process water because water is not intentionally evaporated.",
        };

  return {
    estimatedConsumptionGalPerDay: {
      label: isEvaporative ? "Estimated cooling-water consumption" : "Annualized cooling-process water",
      value: Math.round(consumptionGalPerDay),
      unit: "gal/day",
      confidence: "estimated",
      source: waterModelSource,
      caveats: isEvaporative
        ? [
            `DOE factor assumes 24/7 full-load operation at ${COOLING_TOWER_CYCLES_OF_CONCENTRATION} cycles of concentration; actual use varies with utilization, weather, economizer hours, and water chemistry.`,
            "Cooling towers intentionally evaporate water, so hyperscale evaporative systems can legitimately use hundreds of thousands to millions of gallons per day.",
          ]
        : isClosedChilledWater
          ? [
              `Estimated loop inventory: ~${Math.round(closedLoopVolumeGal).toLocaleString()} gal at ${CLOSED_LOOP_GALLONS_PER_TON} gal/ton.`,
              `Annualized average includes ${Math.round(CLOSED_LOOP_ANNUAL_MAKEUP_FRACTION * 100)}% routine makeup/year plus one full-loop refresh every ${CLOSED_LOOP_REFRESH_INTERVAL_YEARS} years; actual additions occur intermittently.`,
            ]
          : [
              "ASHRAE describes dry closed-loop heat rejection as virtually zero-water for cooling. This excludes domestic water, humidification, fire systems, commissioning fills, leaks, and optional adiabatic assist.",
            ],
    estimatedWithdrawalGalPerDay: {
      label: isEvaporative ? "Estimated cooling-water makeup" : "Annualized cooling-water supply",
      value: Math.round(withdrawalGalPerDay),
      unit: "gal/day",
      confidence: "estimated",
      source: waterModelSource,
      caveats: isEvaporative
        ? [
            `Makeup = evaporation + blowdown (+ minor drift). At ${COOLING_TOWER_CYCLES_OF_CONCENTRATION} cycles, modeled blowdown is ~${Math.round(100 / COOLING_TOWER_CYCLES_OF_CONCENTRATION)}% of makeup.`,
          ]
        : isClosedChilledWater
          ? ["Annualized average; actual closed-loop makeup/refill occurs during maintenance or small loss events, not as a steady withdrawal."]
          : ["No routine cooling-water withdrawal is modeled for dry heat rejection."],
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
      label: `Water model — ${waterModelLabel}`,
      value: isEvaporative
        ? COOLING_TOWER_MAKEUP_GAL_PER_TON_DAY_AT_4_COC
        : isClosedChilledWater
          ? CLOSED_LOOP_ANNUAL_MAKEUP_FRACTION * 100
          : 0,
      unit: isEvaporative ? "gal/ton-day" : isClosedChilledWater ? "% makeup/yr" : "gal/day routine",
      confidence: "estimated",
      source: waterModelSource,
    },
  };
}
