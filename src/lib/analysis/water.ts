import type { FeatureCollection, Geometry } from "geojson";
import type { ScenarioConfig, WaterAnalysis } from "@/lib/types";
import { getFetcher, getStateGisBundle } from "@/lib/gis/stateGis";
import { NATIONAL_SOURCES } from "@/lib/gis/nationalSources";
import { bboxAroundMiles, featuresWithinRadius, nearestFeature, polygonContaining } from "@/lib/spatial/geo";
import { COOLING_TECH_TO_WUE_KEY, COOLING_TOWER_CYCLES_OF_CONCENTRATION, GALLONS_PER_LITER, WUE_L_PER_KWH } from "@/lib/constants/assumptions";

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

  const wueKey = COOLING_TECH_TO_WUE_KEY[coolingTechnology] ?? "us_average";
  const wue = WUE_L_PER_KWH[wueKey] ?? WUE_L_PER_KWH.us_average;

  // WUE is site water use per kWh of IT-equipment energy, not total facility energy.
  // Multiplying by PUE here would overstate water use by the PUE factor.
  const itLoadKw = mwLoad * 1000;
  const itEnergyKwhPerDay = itLoadKw * 24;
  const siteWaterUseLitersPerDay = itEnergyKwhPerDay * wue.value;
  const withdrawalGalPerDay = siteWaterUseLitersPerDay * GALLONS_PER_LITER;

  // For evaporative towers, a portion of make-up water exits as blowdown.
  // DOE defines cycles of concentration approximately as make-up / blowdown.
  const isEvaporative = coolingTechnology === "cooling_tower_evaporative";
  const blowdownGalPerDay = isEvaporative
    ? withdrawalGalPerDay / COOLING_TOWER_CYCLES_OF_CONCENTRATION
    : 0;
  const consumptionGalPerDay = isEvaporative
    ? Math.max(0, withdrawalGalPerDay - blowdownGalPerDay)
    : withdrawalGalPerDay;

  return {
    estimatedConsumptionGalPerDay: {
      label: "Estimated water consumption",
      value: Math.round(consumptionGalPerDay),
      unit: "gal/day",
      confidence: "estimated",
      source: {
        id: "wue-model",
        name: "WUE-based cooling water model",
        url: "",
        methodology: isEvaporative
          ? `${mwLoad} MW IT load × 24h × ${wue.value} L/kWh site WUE (${wue.label}), converted to gallons, then subtracting modeled blowdown at ${COOLING_TOWER_CYCLES_OF_CONCENTRATION} cycles of concentration to estimate consumptive loss.`
          : `${mwLoad} MW IT load × 24h × ${wue.value} L/kWh site WUE (${wue.label}), converted to gallons.`,
      },
      caveats: [
        "Model estimate from published WUE reference coefficients, not a site-specific engineering study.",
        isEvaporative
          ? `Cooling-tower consumption assumes ${COOLING_TOWER_CYCLES_OF_CONCENTRATION} cycles of concentration; actual cycles depend on make-up water chemistry and treatment.`
          : "Routine cooling-process water only; domestic water, humidification, fire systems, initial loop fill, and maintenance losses are excluded.",
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
        methodology: "Site water use is calculated directly from WUE × IT-equipment energy. For evaporative cooling this represents cooling-tower make-up water; dry-rejection technologies are modeled with effectively zero routine cooling-process draw.",
      },
      caveats: isEvaporative
        ? [`At ${COOLING_TOWER_CYCLES_OF_CONCENTRATION} cycles of concentration, roughly ${Math.round(100 / COOLING_TOWER_CYCLES_OF_CONCENTRATION)}% of make-up water is modeled as blowdown rather than consumptive loss.`]
        : ["Routine cooling-process water only; this is not total facility potable-water demand."],
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
