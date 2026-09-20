import type { FeatureCollection, Geometry } from "geojson";
import type { ScenarioConfig, WaterAnalysis } from "@/lib/types";
import { getFetcher, getStateGisBundle } from "@/lib/gis/stateGis";
import { NATIONAL_SOURCES } from "@/lib/gis/nationalSources";
import { bboxAroundMiles, featuresWithinRadius, nearestFeature, polygonContaining } from "@/lib/spatial/geo";
import { CDD65_US_REFERENCE, CLOSED_LOOP_ANNUAL_MAKEUP_FRACTION, CLOSED_LOOP_GALLONS_PER_TON, CLOSED_LOOP_REFRESH_INTERVAL_YEARS, COOLING_TOWER_CYCLES_OF_CONCENTRATION, COOLING_TOWER_MAKEUP_GAL_PER_TON_DAY_AT_4_COC, EMPIRICAL_EVAPORATIVE_WUE_L_PER_KWH, GALLONS_PER_LITER, KW_PER_REFRIGERATION_TON } from "@/lib/constants/assumptions";
import { computeClimateWaterMultiplier } from "./climate";

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
 * stress into its estimated-PUE model without waiting on the full water
 * analysis. Re-fetches the same drought/rights data computeWaterAnalysis
 * fetches; both hit the same per-bbox ArcGIS URL cache key (see arcgis.ts),
 * so once either call has completed once for a given location, the other
 * resolves from cache. The two calls do run concurrently as of
 * runScenarioAnalysis (analysis/index.ts), so on a genuinely new location
 * they can occasionally both miss the cache and each fire one real request
 * — a small, bounded, same-process duplicate, not a correctness issue.
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

  const [riversFc, waterbodiesFc, rightsFc, droughtFc, climateAdjustment] = await Promise.all([
    getFetcher(stateId, "hydrography-rivers")(waterBbox) as Promise<FeatureCollection<Geometry, { GNIS_Name?: string }>>,
    getFetcher(stateId, "hydrography-waterbodies")(waterBbox) as Promise<
      FeatureCollection<Geometry, { GNIS_Name?: string }>
    >,
    getFetcher(stateId, "water-diversions")(rightsBbox) as Promise<FeatureCollection<Geometry, Record<string, unknown>>>,
    getFetcher(stateId, "drought-areas")(droughtBbox) as Promise<FeatureCollection<Geometry, { DM?: number }>>,
    computeClimateWaterMultiplier(scenario),
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
  // Only the routine makeup (seal/fitting losses, plus the light adiabatic
  // pre-cooling assist many air-cooled chiller plants run on hot days to keep
  // the condenser coil's entering air within the compressor's rated range —
  // see the "optional adiabatic assist" caveat below) scales with local
  // climate; the scheduled full-loop refresh is a fixed maintenance interval,
  // not a climate-driven draw, so it's left unscaled.
  const closedLoopVolumeGal = refrigerationTons * CLOSED_LOOP_GALLONS_PER_TON;
  const closedLoopRoutineMakeupGalPerYear =
    closedLoopVolumeGal * CLOSED_LOOP_ANNUAL_MAKEUP_FRACTION * climateAdjustment.multiplier;
  const closedLoopRefreshGalPerYear =
    closedLoopVolumeGal / CLOSED_LOOP_REFRESH_INTERVAL_YEARS;
  const closedLoopAnnualizedGalPerDay =
    (closedLoopRoutineMakeupGalPerYear + closedLoopRefreshGalPerYear) / 365;

  // Annual-average evaporative operating estimate uses an empirical US
  // operator benchmark rather than assuming the cooling tower is at full
  // mechanical load 24/7/365. Microsoft reports FY25 Americas WUE = 0.34 L/kWh.
  // That benchmark is itself a blended average across Microsoft's Americas
  // fleet's climates, so it's scaled by this site's own cooling-degree-day
  // burden relative to the national reference (see climate.ts) rather than
  // applied as one flat nationwide number.
  const itEnergyKwhPerDay = itLoadKw * 24;
  const evaporativeConsumptionGalPerDay =
    itEnergyKwhPerDay *
    EMPIRICAL_EVAPORATIVE_WUE_L_PER_KWH.primary *
    GALLONS_PER_LITER *
    climateAdjustment.multiplier;

  // Keep the DOE tower calculation as a transparent peak/design upper bound,
  // scaled by the same climate multiplier.
  const evaporativePeakMakeupGalPerDay =
    refrigerationTons * COOLING_TOWER_MAKEUP_GAL_PER_TON_DAY_AT_4_COC * climateAdjustment.multiplier;
  const evaporativePeakBlowdownGalPerDay =
    evaporativePeakMakeupGalPerDay / COOLING_TOWER_CYCLES_OF_CONCENTRATION;

  // Withdrawal is not displayed as a precise value for the empirical WUE model:
  // provider definitions differ and WUE is the better directly reported metric.
  const evaporativeMakeupGalPerDay = evaporativeConsumptionGalPerDay;

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
        name: "Empirical US data-center WUE benchmark",
        url: "https://datacenters.microsoft.com/sustainability/efficiency/",
        methodology:
          `Primary operating estimate uses Microsoft FY25 Americas WUE ${EMPIRICAL_EVAPORATIVE_WUE_L_PER_KWH.primary} L/kWh applied to IT energy, scaled by a ${climateAdjustment.multiplier}x local-climate adjustment (this site's cooling-degree-day burden vs. the national reference — see climateWaterAdjustment). Observed operator context: Meta 2024 ${EMPIRICAL_EVAPORATIVE_WUE_L_PER_KWH.low} L/kWh and Google 2024 ${EMPIRICAL_EVAPORATIVE_WUE_L_PER_KWH.high} L/kWh. DOE full-load cooling-tower math is retained only as a peak/design upper bound (~${Math.round(evaporativePeakMakeupGalPerDay).toLocaleString()} gal/day makeup at this load).`,
      }
    : isClosedChilledWater
      ? {
          id: "ashrae-closed-hydronic-loop",
          name: "ASHRAE closed hydronic loop guidance",
          url: "https://handbook.ashrae.org/Handbooks/A23/SI/A23_Ch50/a23_ch50_si.aspx",
          methodology:
            `ASHRAE describes closed hydronic loops as typically requiring less than 5% makeup/year; the model uses 5%/year (scaled ${climateAdjustment.multiplier}x for this site's local climate — see climateWaterAdjustment) plus one full-loop refresh every 3 years, annualized.`,
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
            `Displayed value is an annual-average operating benchmark using Microsoft FY25 Americas WUE (${EMPIRICAL_EVAPORATIVE_WUE_L_PER_KWH.primary} L/kWh), not a full-load cooling-tower maximum.`,
            `Observed operator WUE spans roughly ${EMPIRICAL_EVAPORATIVE_WUE_L_PER_KWH.low}-${EMPIRICAL_EVAPORATIVE_WUE_L_PER_KWH.high} L/kWh across Meta, Microsoft, and Google; actual site use varies substantially by climate, utilization, economizer hours, and cooling design.`,
            climateAdjustment.annualAvgTempF != null
              ? `Local climate adjustment applied: ${climateAdjustment.multiplier}x, from a ${climateAdjustment.annualAvgTempF}°F site average temperature (${climateAdjustment.coolingDegreeDays65} CDD65/yr) — see climateWaterAdjustment.`
              : "Local climate data was unavailable for this site — no climate adjustment was applied (1.0x).",
          ]
        : isClosedChilledWater
          ? [
              `Estimated loop inventory: ~${Math.round(closedLoopVolumeGal).toLocaleString()} gal at ${CLOSED_LOOP_GALLONS_PER_TON} gal/ton.`,
              `Annualized average includes ${Math.round(CLOSED_LOOP_ANNUAL_MAKEUP_FRACTION * 100)}% routine makeup/year (scaled ${climateAdjustment.multiplier}x for local climate — hotter sites run harder and lean more on optional adiabatic pre-cooling assist) plus one full-loop refresh every ${CLOSED_LOOP_REFRESH_INTERVAL_YEARS} years, which is a fixed maintenance interval and is not climate-scaled; actual additions occur intermittently.`,
              climateAdjustment.annualAvgTempF != null
                ? `Local climate adjustment applied: ${climateAdjustment.multiplier}x, from a ${climateAdjustment.annualAvgTempF}°F site average temperature (${climateAdjustment.coolingDegreeDays65} CDD65/yr) — see climateWaterAdjustment.`
                : "Local climate data was unavailable for this site — no climate adjustment was applied (1.0x).",
            ]
          : [
              "ASHRAE describes dry closed-loop heat rejection as virtually zero-water for cooling. This excludes domestic water, humidification, fire systems, commissioning fills, leaks, and optional adiabatic assist.",
              "Dry heat rejection draws no cooling-process water regardless of climate, so no climate adjustment applies here.",
            ],
    },
    estimatedWithdrawalGalPerDay: {
      label: isEvaporative ? "Cooling-water withdrawal / makeup" : "Annualized cooling-water supply",
      value: isEvaporative ? null : Math.round(withdrawalGalPerDay),
      unit: "gal/day",
      confidence: "estimated",
      source: waterModelSource,
      caveats: isEvaporative
        ? [
            `Not shown as a single precise number because operator WUE reports water use, while site withdrawal/makeup accounting varies by system boundary and return flows. DOE peak-design context: ~${Math.round(evaporativePeakMakeupGalPerDay).toLocaleString()} gal/day makeup and ~${Math.round(evaporativePeakBlowdownGalPerDay).toLocaleString()} gal/day blowdown at full cooling-tower load.`,
          ]
        : isClosedChilledWater
          ? ["Annualized average; actual closed-loop makeup/refill occurs during maintenance or small loss events, not as a steady withdrawal."]
          : ["No routine cooling-water withdrawal is modeled for dry heat rejection."],
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
      label: `Water model — ${waterModelLabel}`,
      value: isEvaporative
        ? Math.round(EMPIRICAL_EVAPORATIVE_WUE_L_PER_KWH.primary * climateAdjustment.multiplier * 100) / 100
        : isClosedChilledWater
          ? Math.round(CLOSED_LOOP_ANNUAL_MAKEUP_FRACTION * 100 * climateAdjustment.multiplier * 100) / 100
          : 0,
      unit: isEvaporative ? "L/kWh WUE" : isClosedChilledWater ? "% makeup/yr" : "gal/day routine",
      confidence: "estimated",
      source: waterModelSource,
    },
    climateWaterAdjustment: {
      label: "Local climate water-use adjustment",
      value: climateAdjustment.multiplier,
      unit: "× baseline",
      confidence: climateAdjustment.annualAvgTempF != null ? "estimated" : "unknown",
      source: NATIONAL_SOURCES.openMeteoArchive,
      caveats:
        climateAdjustment.annualAvgTempF != null
          ? [
              `Based on a ${climateAdjustment.annualAvgTempF}°F average site temperature and ${climateAdjustment.coolingDegreeDays65} cooling degree days (base 65°F) per year vs. a ~${CDD65_US_REFERENCE} CDD65/yr national reference.`,
              "Directional heuristic — hotter/more cooling-intensive climates run evaporative cooling tower and closed-loop chiller makeup harder; not a measured per-facility correlation. Applied to the evaporative-consumption and closed chilled-water routine-makeup estimates above; dry heat-rejection technologies (air-cooled DX, direct-to-chip, immersion) draw no cooling-process water regardless of climate, so they're unaffected.",
            ]
          : ["Could not reach the climate data source for this location — no adjustment applied (1.0x)."],
    },
  };
}
