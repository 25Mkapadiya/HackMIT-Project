import type { Feature, FeatureCollection, Geometry } from "geojson";

export interface CountyProps {
  fips: string;
  stateFips: string;
  statePostal: string | null;
  name: string;
  areaKm2: number;
  centroid: [number, number];
}

export interface StateProps {
  fips: string;
  name: string;
  postal: string | null;
}

export type CountyFeature = Feature<Geometry, CountyProps>;
export type CountyCollection = FeatureCollection<Geometry, CountyProps>;
export type StateFeature = Feature<Geometry, StateProps>;
export type StateCollection = FeatureCollection<Geometry, StateProps>;

export interface PowerPlantProps {
  plant_code: number;
  name: string;
  state: string;
  county: string | null;
  utility: string | null;
  balancing_authority: string | null;
  nameplate_mw: number;
  max_grid_voltage_kv: number | null;
  technologies: string[];
}

export type PowerPlantFeature = Feature<Geometry, PowerPlantProps>;
export type PowerPlantCollection = FeatureCollection<Geometry, PowerPlantProps>;

export type Interconnect = "grid-tied" | "self-generated";
export type Cooling = "air" | "evaporative" | "liquid";

export interface ScenarioInputs {
  loadMW: number;
  interconnect: Interconnect;
  cooling: Cooling;
}

export type Tier = "good" | "caution" | "major" | "bad";

export interface TierInfo {
  label: string;
  cls: Tier;
}

/** A plain-language note, optionally carrying glossary term keys the UI
 * renders as inline "ⓘ term" chips next to the sentence that uses them. */
export interface Note {
  text: string;
  terms: string[];
}

export interface GateResult {
  key: "power" | "fiber" | "regulatory" | "water" | "land";
  label: string;
  pass: boolean;
  blocked: boolean;
  score?: number;
  capScore?: number;
  reason?: Note;
  notes: Note[];
  galPerDay?: number;
}

/** Result of running a lat/lng through the full sequential gate pipeline. */
export interface SiteEvaluation {
  lat: number;
  lng: number;
  countyFips: string | null;
  statePostal: string | null;
  name: string;
  blocked: boolean;
  blockingGate?: string;
  reason?: Note;
  score: number;
  tier: TierInfo;
  gates: GateResult[];
}

export interface Placement {
  id: string;
  stateFips: string;
  lat: number;
  lng: number;
  name: string;
  loadMW: number;
  interconnect: Interconnect;
  cooling: Cooling;
  score: number;
  tier: Tier;
  galPerDay: number;
}

export interface StateMeters {
  headroom: number;
  water: number;
  approval: number;
}
