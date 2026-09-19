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

export interface GridHub {
  name: string;
  state: string;
  lat: number;
  lon: number;
  tier: 1 | 2;
}

export type Interconnect = "grid-tied" | "self-generated";

export interface Weights {
  grid: number;
  carbon: number;
  land: number;
  demand: number;
}

export interface ScenarioInputs {
  loadMW: number;
  interconnect: Interconnect;
  weights: Weights;
}

export type Tier = "good" | "caution" | "major" | "bad";

export interface TierInfo {
  label: string;
  cls: Tier;
}

export interface CountyScore {
  fips: string;
  name: string;
  statePostal: string | null;
  blocked: boolean;
  score: number;
  tier: TierInfo;
  breakdown: {
    grid: number;
    carbon: number;
    land: number;
    demand: number;
  };
  nearestHub: { name: string; distanceKm: number } | null;
  notes: string[];
}
