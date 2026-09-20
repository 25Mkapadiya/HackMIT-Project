/**
 * Screening-level noise-impact model constants. Every number here is a
 * RELATIVE weight used to flag whether noise is worth a resident's/reviewer's
 * attention early in siting — NOT a measured or predicted dBA level, and NOT
 * an acoustics-engineering result. See src/lib/analysis/noise.ts for how
 * these combine into a score. Adjust the model by editing this file only.
 */
import type { CoolingTechnology } from "@/lib/types";

/**
 * Relative mechanical noise-potential score (1-10) by cooling technology.
 * Cooling towers and air-cooled chillers run large, continuous fan/pump
 * arrays that are the dominant source of external data-center noise;
 * closed-loop liquid and immersion systems remove heat mostly inside the
 * building envelope with far less (or no) large external fan plant.
 */
export const COOLING_NOISE_POTENTIAL: Record<CoolingTechnology, number> = {
  immersion: 2,
  closed_loop_liquid: 3,
  air_cooled_dx: 6,
  chilled_water_air_cooled_chiller: 7,
  cooling_tower_evaporative: 8,
};

/** Weights for blending residential density and proximity into one 0-10 "exposure" score. Density is weighted higher: a noisy plant next to a dense neighborhood matters far more than the same plant in isolation. */
export const RESIDENTIAL_EXPOSURE_WEIGHTS = {
  density: 0.65,
  proximity: 0.35,
};

/**
 * Distance bands (miles) -> 0-10 proximity score, used only when a real
 * residential-proximity distance is available. This app has no
 * residential-parcel/address-point dataset integrated yet, so this path is
 * currently unused in practice — calculateResidentialProximityScore falls
 * back to the density-based estimate below whenever distanceMiles is null.
 */
export const RESIDENTIAL_PROXIMITY_DISTANCE_BANDS: { maxMiles: number; score: number }[] = [
  { maxMiles: 0.25, score: 10 },
  { maxMiles: 0.5, score: 8 },
  { maxMiles: 1, score: 5 },
  { maxMiles: 2, score: 3 },
  { maxMiles: Infinity, score: 1 },
];

/** 0-24 LOW, 25-49 MODERATE, 50-74 SIGNIFICANT, 75-100 HIGH. */
export const NOISE_IMPACT_THRESHOLDS = {
  low: 0,
  moderate: 25,
  significant: 50,
  high: 75,
};

/** noiseImpactScore >= this is reported as "Significant" noise concern. */
export const NOISE_SIGNIFICANT_THRESHOLD = 50;

/** Score-band labels for the 0-10 residential density score (not the same scale as gridDemandPressure's Low/Moderate/High/Very High, which uses fixed nationwide density cutoffs rather than a state-relative percentile). */
export const RESIDENTIAL_DENSITY_SCORE_BANDS: { max: number; label: "None" | "Low" | "Moderate" | "High" | "Very High" }[] = [
  { max: 2, label: "None" },
  { max: 4, label: "Low" },
  { max: 6, label: "Moderate" },
  { max: 8, label: "High" },
  { max: 10, label: "Very High" },
];

export const NOISE_METHODOLOGY_DISCLAIMER =
  "Noise Impact is a screening-level estimate based on cooling technology and surrounding residential exposure. Actual sound levels depend on equipment specifications, facility design, barriers, operating conditions, and local noise regulations.";
