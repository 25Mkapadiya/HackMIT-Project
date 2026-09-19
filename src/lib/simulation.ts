import waterStressRaw from "../data/water-stress.json";
import type { Cooling, Placement, StateMeters } from "./types";

const WATER_BASELINE = waterStressRaw as unknown as Record<string, number>;

/**
 * Per-facility drain on statewide resource meters, keyed by cooling type.
 * Ported from the original Texas demo's COOLING trade-off table.
 */
export const COOLING_TRADEOFFS: Record<
  Cooling,
  { headroom: number; water: number; approval: number }
> = {
  air: { headroom: 16, water: 2, approval: 5 },
  evaporative: { headroom: 9, water: 18, approval: 8 },
  liquid: { headroom: 7, water: 4, approval: 4 },
};

const COOLING_LABEL: Record<Cooling, string> = {
  air: "Air",
  evaporative: "Evaporative",
  liquid: "Liquid closed-loop",
};

export function coolingLabel(c: Cooling): string {
  return COOLING_LABEL[c];
}

/**
 * Illustrative starting-point meters for a state: grid headroom tracks this
 * app's own composite grid/demand scoring, water reserve comes from the
 * (approximate) water-stress reference table, and community approval is a
 * stand-in baseline — none of these are a live utility/ISO feed. See README.
 */
export function baselineMeters(
  statePostal: string | null,
  avgGridDemandScore: number
): StateMeters {
  const headroom = Math.round(35 + avgGridDemandScore * 0.55);
  const water = statePostal && WATER_BASELINE[statePostal] !== undefined
    ? WATER_BASELINE[statePostal]
    : 65;
  // Deterministic per-state variety (not random per render) as a stand-in
  // for a real community-sentiment baseline.
  let hash = 0;
  for (const ch of statePostal ?? "US") hash = (hash * 31 + ch.charCodeAt(0)) % 997;
  const approval = 62 + (hash % 20);
  return { headroom: clamp(headroom), water: clamp(water), approval: clamp(approval) };
}

function clamp(n: number, lo = 0, hi = 100) {
  return Math.max(lo, Math.min(hi, Math.round(n)));
}

/** Applies one placement's drain on top of the given meters. */
export function applyPlacement(meters: StateMeters, placement: Placement): StateMeters {
  const cooling = COOLING_TRADEOFFS[placement.cooling];
  const loadFactor = placement.loadMW / 150;
  const headroomDrain =
    cooling.headroom * loadFactor + (placement.interconnect === "grid-tied" ? 6 : 0);
  const waterDrain = cooling.water * loadFactor;
  const approvalDrain =
    cooling.approval +
    (placement.tier === "bad" ? 6 : 0) -
    (placement.interconnect === "self-generated" ? 3 : 0);

  return {
    headroom: clamp(meters.headroom - headroomDrain),
    water: clamp(meters.water - waterDrain),
    approval: clamp(meters.approval - approvalDrain),
  };
}

export function metersForState(
  statePostal: string | null,
  avgGridDemandScore: number,
  placements: Placement[]
): StateMeters {
  let meters = baselineMeters(statePostal, avgGridDemandScore);
  for (const p of placements) {
    meters = applyPlacement(meters, p);
  }
  return meters;
}
