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
  /**
   * Only meaningfully a *choice* for cooling technologies whose
   * COOLING_TECH_OPTIONS entry has fixedLoopType: null (currently just
   * direct-to-chip liquid cooling) — every other technology has a physically
   * fixed loop type (e.g. an evaporative cooling tower is always open, a
   * chiller plant is always closed) and the store keeps this field in sync
   * with that fixed value whenever coolingTechnology changes. There is no
   * separate coolingMedium field: which medium (air/water) rejects heat is
   * implied by coolingTechnology — see getCoolingTechOption().
   */
  loopType: LoopType;
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
  land: LandAnalysis;
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
