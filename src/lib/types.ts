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
  /** Which StateDefinition's analysis pipeline this scenario runs against (registry.ts `id`, e.g. "washington"). */
  stateId: string;
  label: string;
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

export interface PowerAnalysis {
  facilityRequirementMw: number;
  nearestTransmission: DistanceResult & { voltageKv: number | null };
  nearest115kv: DistanceResult & { voltageKv: number | null };
  nearest230kv: DistanceResult & { voltageKv: number | null };
  nearest500kv: DistanceResult & { voltageKv: number | null };
  utilityTerritory: Metric<string | null>;
  nearbyGeneration: Metric<
    { totalMw: number; count: number; plants: { name: string; mw: number; fuel: string; miles: number }[] } | null
  >;
  gridCapacity: Metric<string>;
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
  utilityLargeLoadContact: Metric<string | null>;
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

export interface LandAnalysis {
  femaFloodZone: Metric<string | null>;
  elevationFt: Metric<number | null>;
  nearestMajorRoadMiles: Metric<number | null>;
  populationWithin5mi: Metric<number | null>;
  environmentalConstraints: Metric<string[]>;
  estimatedAcreage: Metric<number>;
  naturalHazards: Metric<string[]>;
}

export interface DevelopmentEstimate {
  acreage: Metric<number>;
  constructionCostUsd: Metric<[number, number]>;
  timelineYears: Metric<[number, number]>;
  potentialIncentives: Metric<string[]>;
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
