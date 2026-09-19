import distance from "@turf/distance";
import { point } from "@turf/helpers";
import carbonIntensity from "../data/carbon-intensity.json";
import gridHubsRaw from "../data/grid-hubs.json";
import stateNotes from "../data/state-notes.json";
import type {
  CountyFeature,
  CountyScore,
  GridHub,
  ScenarioInputs,
  TierInfo,
} from "./types";

const gridHubs = gridHubsRaw as GridHub[];

const CARBON = carbonIntensity as unknown as Record<string, number>;
const carbonValues = Object.entries(CARBON).filter(([k]) => !k.startsWith("_"));
const CARBON_MIN = Math.min(...carbonValues.map(([, v]) => v));
const CARBON_MAX = Math.max(...carbonValues.map(([, v]) => v));

// National min/max county land area (km^2), used to normalize the land
// availability factor on a log scale (areas span ~3 orders of magnitude,
// from small New England counties to Alaska boroughs).
const LAND_LOG_MIN = Math.log(20);
const LAND_LOG_MAX = Math.log(50000);

export function tierFor(score: number): TierInfo {
  if (score >= 75) return { label: "Buildable now", cls: "good" };
  if (score >= 50) return { label: "Minor upgrade", cls: "caution" };
  if (score >= 25) return { label: "Major upgrade", cls: "major" };
  return { label: "Try a nearby site", cls: "bad" };
}

function clamp(n: number, lo = 0, hi = 100) {
  return Math.max(lo, Math.min(hi, n));
}

// Counties within this real great-circle distance of a tier-1 hub are
// flagged "substation-adjacent" on the map, mirroring the original demo's
// ring marker on its named substation tiles.
const SUBSTATION_ADJACENT_KM = 25;

function nearestHub(lon: number, lat: number) {
  const from = point([lon, lat]);
  let best: { hub: GridHub; distanceKm: number; effectiveKm: number } | null = null;
  let nearestTier1Km = Infinity;
  for (const hub of gridHubs) {
    const d = distance(from, point([hub.lon, hub.lat]), { units: "kilometers" });
    if (hub.tier === 1 && d < nearestTier1Km) nearestTier1Km = d;
    // A tier-2 hub represents a thinner slice of transmission density than a
    // tier-1 metro/energy corridor, so treat it as effectively farther away.
    const effective = hub.tier === 1 ? d : d * 1.4;
    if (!best || effective < best.effectiveKm) {
      best = { hub, distanceKm: d, effectiveKm: effective };
    }
  }
  return {
    ...best!,
    substationAdjacent: nearestTier1Km <= SUBSTATION_ADJACENT_KM,
  };
}

function gridProximityScore(effectiveKm: number): number {
  return clamp(100 - effectiveKm * 0.35);
}

function demandHeadroomScore(effectiveKm: number): number {
  // Peaks a moderate distance from a major hub: close enough for a feasible
  // interconnection, far enough to avoid competing with existing dense load.
  return clamp(100 - Math.abs(effectiveKm - 40) * 1.15);
}

function carbonScore(statePostal: string | null): number {
  const intensity = statePostal ? CARBON[statePostal] : undefined;
  if (intensity === undefined) return 50;
  return clamp(100 - ((intensity - CARBON_MIN) / (CARBON_MAX - CARBON_MIN)) * 100);
}

function landScoreFor(areaKm2: number, effectiveKm: number): number {
  const logArea = Math.log(Math.max(areaKm2, 1));
  const normalized = clamp(
    ((logArea - LAND_LOG_MIN) / (LAND_LOG_MAX - LAND_LOG_MIN)) * 100
  );
  // Urban-core penalty: sites immediately adjacent to a major hub are
  // typically land-constrained and face more community/permitting friction.
  const densityPenalty = effectiveKm < 8 ? 20 : 0;
  return clamp(normalized - densityPenalty);
}

function normalizeWeights(w: ScenarioInputs["weights"]) {
  const total = w.grid + w.carbon + w.land + w.demand;
  if (total <= 0) return { grid: 0.25, carbon: 0.25, land: 0.25, demand: 0.25 };
  return {
    grid: w.grid / total,
    carbon: w.carbon / total,
    land: w.land / total,
    demand: w.demand / total,
  };
}

function bareCountyName(name: string): string {
  return name.replace(/ County$/, "").replace(/ Parish$/, "");
}

const notes_ = stateNotes as Record<
  string,
  {
    sb6Threshold?: boolean;
    gridTiedPauseNote?: string;
    counties?: Record<string, { status: string; reason: string }>;
  }
>;

/** Geography-derived factors that don't depend on scenario/weight state. */
export interface CountyFactors {
  fips: string;
  name: string;
  statePostal: string | null;
  grid: number;
  carbon: number;
  land: number;
  demand: number;
  nearestHub: { name: string; distanceKm: number };
  substationAdjacent: boolean;
  blocked: boolean;
  blockedReason: string | null;
  paused: boolean;
  pausedReason: string | null;
}

export function computeCountyFactors(feature: CountyFeature): CountyFactors {
  const { fips, name, statePostal, areaKm2, centroid } = feature.properties;
  const [lon, lat] = centroid;
  const hub = nearestHub(lon, lat);
  const effectiveKm = hub.effectiveKm;

  let blocked = false;
  let blockedReason: string | null = null;
  let paused = false;
  let pausedReason: string | null = null;

  const stateRule = statePostal ? notes_[statePostal] : undefined;
  const countyRule = stateRule?.counties?.[bareCountyName(name)];
  if (countyRule?.status === "blocked") {
    blocked = true;
    blockedReason = countyRule.reason;
  } else if (countyRule?.status === "paused") {
    paused = true;
    pausedReason = countyRule.reason;
  }

  return {
    fips,
    name,
    statePostal,
    grid: gridProximityScore(effectiveKm),
    carbon: carbonScore(statePostal),
    land: landScoreFor(areaKm2, effectiveKm),
    demand: demandHeadroomScore(effectiveKm),
    nearestHub: { name: hub.hub.name, distanceKm: Math.round(hub.distanceKm) },
    substationAdjacent: hub.substationAdjacent,
    blocked,
    blockedReason,
    paused,
    pausedReason,
  };
}

export function scoreFromFactors(
  factors: CountyFactors,
  inputs: ScenarioInputs
): CountyScore {
  const w = normalizeWeights(inputs.weights);
  let score = Math.round(
    factors.grid * w.grid +
      factors.carbon * w.carbon +
      factors.land * w.land +
      factors.demand * w.demand
  );

  const notes: string[] = [];

  if (factors.paused && factors.pausedReason) {
    score = Math.min(score, 55);
    notes.push(`${factors.pausedReason} Score capped pending local reopening.`);
  }

  const stateRule = factors.statePostal ? notes_[factors.statePostal] : undefined;
  if (stateRule && factors.statePostal === "TX") {
    if (inputs.interconnect === "grid-tied" && score >= 75) {
      score -= 15;
      notes.push(
        stateRule.gridTiedPauseNote ??
          "State grid-tied interconnection pause in effect."
      );
    }
    if (inputs.interconnect === "self-generated") {
      notes.push(
        "Self-generated facilities are exempt from the statewide grid-tied interconnection pause."
      );
    }
    if (inputs.loadMW >= 75) {
      notes.push(
        "SB6 (2025): loads ≥75MW are subject to statewide interconnection/curtailment rules."
      );
    }
  }

  score = clamp(score);

  const breakdown = {
    grid: factors.grid,
    carbon: factors.carbon,
    land: factors.land,
    demand: factors.demand,
  };

  if (factors.blocked) {
    return {
      fips: factors.fips,
      name: factors.name,
      statePostal: factors.statePostal,
      blocked: true,
      paused: false,
      substationAdjacent: factors.substationAdjacent,
      score: 0,
      tier: { label: "Blocked", cls: "bad" },
      breakdown,
      nearestHub: factors.nearestHub,
      notes: factors.blockedReason ? [factors.blockedReason] : [],
    };
  }

  return {
    fips: factors.fips,
    name: factors.name,
    statePostal: factors.statePostal,
    blocked: false,
    paused: factors.paused,
    substationAdjacent: factors.substationAdjacent,
    score,
    tier: tierFor(score),
    breakdown,
    nearestHub: factors.nearestHub,
    notes,
  };
}

export function scoreCounty(
  feature: CountyFeature,
  inputs: ScenarioInputs
): CountyScore {
  return scoreFromFactors(computeCountyFactors(feature), inputs);
}

export const DEFAULT_WEIGHTS = { grid: 35, carbon: 25, land: 20, demand: 20 };
