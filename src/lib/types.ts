/**
 * Core domain types shared across states, layers, analysis, and UI.
 * Keeping these state-agnostic is what lets Washington-specific logic
 * live entirely under src/states/washington without leaking into the app shell.
 */

export type LayerCategory =
  | "power"
  | "water"
  | "connectivity"
  | "environment"
  | "community"
  | "existing_infrastructure";

export type GeometryKind = "point" | "line" | "polygon" | "raster";

/** How trustworthy/derived a displayed value is. Drives badge color + copy everywhere. */
export type Confidence = "fact" | "estimated" | "proxy" | "unknown";

export interface SourceMeta {
  id: string;
  name: string;
  url: string;
  license?: string;
  refreshFrequency?: string;
  /** Short note on how the data was produced/queried. Shown in provenance UI. */
  methodology?: string;
  asOf?: string;
}

export interface LayerDefinition {
  id: string;
  name: string;
  shortName?: string;
  category: LayerCategory;
  geometryType: GeometryKind;
  source: SourceMeta;
  confidence: Confidence;
  description: string;
  defaultVisible?: boolean;
  /** Legend swatch color, or a function-derived scale described in `legend`. */
  color?: string;
  legend?: LegendEntry[];
  /** API route (relative) this layer fetches its GeoJSON from. */
  endpoint?: string;
  minZoom?: number;
  maxZoom?: number;
}

export interface LegendEntry {
  label: string;
  color: string;
  /** Optional dash/line-width hint for line layers */
  lineWidth?: number;
  swatch?: "line" | "fill" | "circle";
}

export type CoolingTechnology =
  | "air_cooled_dx"
  | "chilled_water_air_cooled_chiller"
  | "cooling_tower_evaporative"
  | "closed_loop_liquid"
  | "immersion";

export type LoopType = "closed_loop" | "open_loop";
export type CoolingMedium = "air_cooled" | "water_cooled";

export interface RedundancyAssumption {
  tier: "N" | "N+1" | "2N";
  label: string;
}

export interface ScenarioConfig {
  id: string;
  label: string;
  /** Which StateDefinition's GIS sources/fetchers to run analysis against. */
  stateId: string;
  lng: number;
  lat: number;
  mwLoad: number;
  buildings: number;
  coolingTechnology: CoolingTechnology;
  loopType: LoopType;
  coolingMedium: CoolingMedium;
  acreageOverride?: number;
  redundancy: RedundancyAssumption["tier"];
  createdAt: string;
}

export interface Metric<T = string | number | null> {
  label: string;
  value: T;
  unit?: string;
  confidence: Confidence;
  source: SourceMeta | SourceMeta[];
  caveats?: string[];
  methodologyNote?: string;
}

export interface DistanceResult {
  distanceMiles: number | null;
  nearestFeatureLabel: string | null;
  confidence: Confidence;
  source: SourceMeta;
}

export type DemandPressureLabel = "Low" | "Moderate" | "High" | "Very High" | "Unknown";

export interface PowerAnalysis {
  facilityRequirementMw: number;
  nearestTransmission: DistanceResult & { voltageKv: number | null };
  nearest115kv: DistanceResult & { voltageKv: number | null };
  nearest230kv: DistanceResult & { voltageKv: number | null };
  nearest500kv: DistanceResult & { voltageKv: number | null };
  /**
   * Nearest known electric substation (HIFLD legacy nationwide extract — see
   * NATIONAL_SOURCES.hifldSubstations). Location only, not a statement of
   * interconnection headroom — see gridCapacity, which stays UNKNOWN regardless.
   */
  nearestSubstation: DistanceResult & {
    maxVoltageKv: number | null;
    lineCount: number | null;
    /** Substation coordinates, when found — lets the map draw a proximity connector line to the site. */
    lng: number | null;
    lat: number | null;
  };
  utilityTerritory: Metric<string | null>;
  nearbyGeneration: Metric<
    { totalMw: number; count: number; plants: { name: string; mw: number; fuel: string; miles: number }[] } | null
  >;
  gridCapacity: Metric<string>;
  /**
   * County-level population density near the site (Census PEP + Gazetteer, see
   * scripts/county_population_density.py), used as a proxy for how much existing
   * residential/commercial load is already drawing on the same transmission and
   * distribution infrastructure — denser counties tend to leave less available
   * headroom on a given line for a new large load, even at a high voltage tier.
   * Not a substitute for a formal interconnection study.
   */
  gridDemandPressure: Metric<{ countyName: string | null; densityPerSqMi: number | null } | null> & {
    demandPressureLabel: DemandPressureLabel;
  };
  likelyAction: Metric<string>;
}

export interface FiberAnalysis {
  broadbandContext: Metric<string | null>;
  nearestIxp: DistanceResult;
  longHaulFiberAvailability: Metric<string>;
}

export interface RegulationAnalysis {
  utilityTerritory: Metric<string | null>;
  county: Metric<string | null>;
  permittingNote: Metric<string>;
}

export interface WaterAnalysis {
  estimatedConsumptionGalPerDay: Metric<number | null>;
  estimatedWithdrawalGalPerDay: Metric<number | null>;
  nearestWaterBody: DistanceResult;
  nearbyWaterRightsCount: Metric<number | null>;
  droughtStatus: Metric<string>;
  waterStressLabel: Metric<"Low" | "Medium" | "High" | "Unknown">;
  wueAssumption: Metric<number>;
  /**
   * Multiplier applied to the evaporative water-use estimate above from local
   * climate (see ClimateAnalysis / src/lib/analysis/climate.ts) — 1.0 at the
   * national-reference cooling-degree-day baseline, higher in hotter/more
   * cooling-intensive climates, lower in cooler ones. Directional heuristic,
   * not a measured per-facility correlation.
   */
  climateWaterAdjustment: Metric<number>;
}

/**
 * Live point-queried site temperature/cooling-load context (Open-Meteo ERA5
 * reanalysis — see NATIONAL_SOURCES.openMeteoArchive and
 * src/lib/analysis/climate.ts), used to scale the evaporative-cooling water
 * estimate in WaterAnalysis.climateWaterAdjustment for the specific site's
 * climate rather than one flat nationwide assumption.
 */
export interface ClimateAnalysis {
  annualAvgTempF: Metric<number | null>;
  /** Base-65°F cooling degree days, summed over the lookback period and annualized. */
  coolingDegreeDays65: Metric<number | null>;
}

export interface PueFactor {
  label: string;
  /** This factor's contribution to the estimated PUE — the base cooling-tech figure for the first factor, a signed adjustment for the rest. */
  deltaPue: number;
  rationale: string;
}

/**
 * Modeled (not measured) estimate of Power Usage Effectiveness, built from
 * published industry benchmarks and adjusted for local population-density
 * "grid demand pressure" and water-stress cooling constraints. See
 * src/lib/analysis/efficiency.ts for the full methodology and citations —
 * no public dataset joins per-facility PUE to county population data, so this
 * is a transparent heuristic, never presented as a measured correlation.
 */
export interface EfficiencyAnalysis {
  estimatedPue: Metric<number> & { factors: PueFactor[] };
}

export interface LandAnalysis {
  femaFloodZone: Metric<string | null>;
  elevationFt: Metric<number | null>;
  nearestMajorRoadMiles: Metric<number | null>;
  populationWithin5mi: Metric<number | null>;
  environmentalConstraints: Metric<string[]>;
  estimatedAcreage: Metric<number>;
}

export interface DevelopmentEstimate {
  acreage: Metric<number>;
  constructionCostUsd: Metric<[number, number]>;
  timelineYears: Metric<[number, number]>;
}

/** 0-24 LOW, 25-49 MODERATE, 50-74 SIGNIFICANT, 75-100 HIGH; "unknown" when residential data is unavailable. */
export type NoiseClassification = "low" | "moderate" | "significant" | "high" | "unknown";

/** 0-2 essentially none, 3-4 low, 5-6 moderate, 7-8 high, 9-10 very high. */
export type ResidentialDensityLabel = "None" | "Low" | "Moderate" | "High" | "Very High" | "Unknown";

/**
 * Screening-level (NOT acoustics-engineering, NOT a dBA prediction) estimate
 * of whether a proposed facility's noise is likely to matter to nearby
 * residents — combining the selected cooling technology's relative noise
 * potential with how much residential development actually surrounds the
 * site. See src/lib/analysis/noise.ts for the full methodology.
 */
export interface NoiseAnalysis {
  /** False only when residential density data couldn't be resolved at all (e.g. county lookup failed). */
  available: boolean;
  /** 1-10 relative screening weight for the selected cooling technology — not a measured dBA value. */
  coolingNoisePotential: Metric<number>;
  /** 0-10, percentile-ranked against other counties in the same state (not one fixed nationwide cutoff). */
  residentialDensityScore: Metric<number | null> & { densityLabel: ResidentialDensityLabel };
  /** 0-10. Real distance-based when a residential-proximity dataset is available; otherwise an explicitly-labeled estimate reusing the density score. */
  residentialProximityScore: Metric<number | null> & { isEstimateFromDensity: boolean; distanceMiles: number | null };
  /** 0-10 weighted blend: density × 0.65 + proximity × 0.35. */
  residentialExposure: Metric<number | null>;
  /** 0-100 = (coolingNoisePotential/10) × (residentialExposure/10) × 100, rounded. */
  noiseImpactScore: Metric<number | null>;
  classification: NoiseClassification;
  isNoiseSignificant: boolean | null;
  /** Plain-language, dynamically generated explanation of the score — not boilerplate. */
  explanation: string;
}

export interface InfrastructureGap {
  category: LayerCategory | "power" | "water" | "fiber" | "land";
  severity: "info" | "watch" | "likely_required";
  summary: string;
  detail: string;
}

export interface ScenarioAnalysis {
  scenarioId: string;
  generatedAt: string;
  power: PowerAnalysis;
  fiber: FiberAnalysis;
  regulation: RegulationAnalysis;
  efficiency: EfficiencyAnalysis;
  water: WaterAnalysis;
  climate: ClimateAnalysis;
  land: LandAnalysis;
  noise: NoiseAnalysis;
  development: DevelopmentEstimate;
  gaps: InfrastructureGap[];
}

export interface StateDefinition {
  id: string;
  name: string;
  abbreviation: string;
  bounds: [[number, number], [number, number]]; // [[west, south], [east, north]]
  center: [number, number];
  defaultZoom: number;
  layers: LayerDefinition[];
  enabled: boolean;
}
