import type { CoolingTechnology, NoiseAnalysis, NoiseClassification, PowerAnalysis, ResidentialDensityLabel, ScenarioConfig, SourceMeta } from "@/lib/types";
import { getState } from "@/states/registry";
import { getCountyDensitiesForState } from "@/lib/gis/nationalFetchers";
import { NATIONAL_SOURCES } from "@/lib/gis/nationalSources";
import { COOLING_TECH_OPTIONS } from "@/lib/constants/options";
import {
  COOLING_NOISE_POTENTIAL,
  NOISE_METHODOLOGY_DISCLAIMER,
  NOISE_SIGNIFICANT_THRESHOLD,
  RESIDENTIAL_DENSITY_SCORE_BANDS,
  RESIDENTIAL_EXPOSURE_WEIGHTS,
  RESIDENTIAL_PROXIMITY_DISTANCE_BANDS,
} from "@/lib/constants/noise";

const NOISE_SOURCE: SourceMeta = {
  id: "noise-screening-model",
  name: "Screening-level noise-impact heuristic (cooling technology + residential exposure)",
  url: "",
  methodology:
    "Combines a relative 1-10 mechanical noise-potential weight for the selected cooling technology with a 0-10 residential exposure score (county-level population density, percentile-ranked within the same state, blended with a proximity estimate). NOT an acoustics-engineering model and NOT a prediction of measured dBA levels — see the in-app disclaimer.",
};

/** Baseline 1-10 mechanical noise-potential weight for a cooling technology. Not a measured dBA value — see src/lib/constants/noise.ts. */
export function getCoolingNoisePotential(coolingType: CoolingTechnology): number {
  return COOLING_NOISE_POTENTIAL[coolingType] ?? COOLING_NOISE_POTENTIAL.chilled_water_air_cooled_chiller;
}

function coolingLabelFor(coolingType: CoolingTechnology): string {
  return COOLING_TECH_OPTIONS.find((o) => o.value === coolingType)?.label ?? coolingType;
}

export function getResidentialDensityLabel(score: number | null): ResidentialDensityLabel {
  if (score == null) return "Unknown";
  const band = RESIDENTIAL_DENSITY_SCORE_BANDS.find((b) => score <= b.max);
  return band?.label ?? "Very High";
}

/**
 * 0-10 residential density score, from this county's percentile rank among
 * every county's population density IN THE SAME STATE — deliberately
 * relative rather than one fixed nationwide density cutoff, so e.g. a
 * "dense" county in Wyoming and a "dense" county in New Jersey are each
 * judged against their own state's range instead of the same absolute
 * threshold.
 */
export function calculateResidentialDensityScore(
  densityPerSqMi: number | null,
  stateAbbreviation: string | null
): number | null {
  if (densityPerSqMi == null) return null;
  const stateDensities = getCountyDensitiesForState(stateAbbreviation);
  if (stateDensities.length === 0) return null;

  const atOrBelow = stateDensities.filter((d) => d <= densityPerSqMi).length;
  const percentile = (atOrBelow / stateDensities.length) * 100;
  return Math.round((percentile / 10) * 10) / 10; // 0-10, one decimal
}

/**
 * 0-10 residential proximity score. Uses a real distance band when
 * `distanceMiles` is known; this app has no residential-parcel/address-point
 * dataset integrated yet, so in practice `distanceMiles` is always null and
 * this falls back to the residential density score, explicitly flagged via
 * `isEstimateFromDensity` so the UI never silently presents it as a measured
 * distance.
 */
export function calculateResidentialProximityScore(
  distanceMiles: number | null,
  residentialDensityScore: number | null
): { score: number | null; isEstimateFromDensity: boolean; distanceMiles: number | null } {
  if (distanceMiles != null) {
    const band = RESIDENTIAL_PROXIMITY_DISTANCE_BANDS.find((b) => distanceMiles <= b.maxMiles);
    return { score: band?.score ?? 1, isEstimateFromDensity: false, distanceMiles };
  }
  return { score: residentialDensityScore, isEstimateFromDensity: true, distanceMiles: null };
}

/** 0-10 blended exposure: density weighted higher than proximity (see RESIDENTIAL_EXPOSURE_WEIGHTS). */
export function calculateResidentialExposure(densityScore: number | null, proximityScore: number | null): number | null {
  if (densityScore == null || proximityScore == null) return null;
  return densityScore * RESIDENTIAL_EXPOSURE_WEIGHTS.density + proximityScore * RESIDENTIAL_EXPOSURE_WEIGHTS.proximity;
}

/** 0-100 = (coolingNoisePotential/10) × (residentialExposure/10) × 100, rounded to the nearest whole number. */
export function calculateNoiseImpact(coolingNoisePotential: number, residentialExposure: number | null): number | null {
  if (residentialExposure == null) return null;
  return Math.round((coolingNoisePotential / 10) * (residentialExposure / 10) * 100);
}

export function getNoiseClassification(noiseImpactScore: number | null): NoiseClassification {
  if (noiseImpactScore == null) return "unknown";
  if (noiseImpactScore >= 75) return "high";
  if (noiseImpactScore >= 50) return "significant";
  if (noiseImpactScore >= 25) return "moderate";
  return "low";
}

export function generateNoiseExplanation({
  coolingLabel,
  coolingNoisePotential,
  residentialExposure,
  classification,
}: {
  coolingLabel: string;
  coolingNoisePotential: number;
  residentialExposure: number | null;
  classification: NoiseClassification;
}): string {
  if (residentialExposure == null) {
    return "Residential density data is unavailable for this location, so noise impact cannot be reliably estimated — treat this as an open item rather than a cleared one.";
  }

  const lowerLabel = coolingLabel.toLowerCase();
  const highNoiseCooling = coolingNoisePotential >= 7;
  const lowNoiseCooling = coolingNoisePotential <= 3;
  const highExposure = residentialExposure >= 6.5;
  const lowExposure = residentialExposure <= 3;

  if (lowNoiseCooling) {
    return highExposure
      ? `${coolingLabel} has relatively low external cooling noise potential, reducing noise sensitivity even with nearby residential development.`
      : `${coolingLabel} has relatively low external cooling noise potential, and the limited nearby residential development further reduces noise sensitivity.`;
  }

  if (highNoiseCooling) {
    return highExposure
      ? `Noise impact is ${classification} because ${lowerLabel} has relatively high mechanical noise potential and the site is close to dense residential development.`
      : lowExposure
        ? "Although the selected cooling system has relatively high noise potential, limited nearby residential development substantially reduces community noise exposure."
        : `${coolingLabel} has relatively high mechanical noise potential; moderate nearby residential development keeps this a ${classification} rather than high concern.`;
  }

  // Moderate cooling noise potential (4-6).
  return highExposure
    ? `${coolingLabel} has moderate mechanical noise potential, and nearby residential development increases the likelihood of a noticeable community impact.`
    : `${coolingLabel} has moderate mechanical noise potential, but limited nearby residential development keeps community noise exposure relatively low.`;
}

export function computeNoiseAnalysis(scenario: ScenarioConfig, power: PowerAnalysis): NoiseAnalysis {
  const coolingLabel = coolingLabelFor(scenario.coolingTechnology);
  const coolingNoisePotential = getCoolingNoisePotential(scenario.coolingTechnology);

  const densityPerSqMi = power.gridDemandPressure.value?.densityPerSqMi ?? null;
  const stateAbbreviation = getState(scenario.stateId)?.abbreviation ?? null;
  const densityScore = calculateResidentialDensityScore(densityPerSqMi, stateAbbreviation);
  const densityLabel = getResidentialDensityLabel(densityScore);

  const proximity = calculateResidentialProximityScore(null, densityScore);
  const residentialExposure = calculateResidentialExposure(densityScore, proximity.score);
  const noiseImpactScore = calculateNoiseImpact(coolingNoisePotential, residentialExposure);
  const classification = getNoiseClassification(noiseImpactScore);
  const isNoiseSignificant = noiseImpactScore == null ? null : noiseImpactScore >= NOISE_SIGNIFICANT_THRESHOLD;
  const explanation = generateNoiseExplanation({ coolingLabel, coolingNoisePotential, residentialExposure, classification });

  const countyName = power.gridDemandPressure.value?.countyName ?? null;
  const densityCaveats = [
    countyName
      ? `Percentile rank of ${countyName}'s population density among counties in ${stateAbbreviation ?? "its state"} — not a fixed nationwide cutoff.`
      : "County-level population density could not be determined for this location.",
    NOISE_METHODOLOGY_DISCLAIMER,
  ];

  return {
    available: densityScore != null,
    coolingNoisePotential: {
      label: "Cooling system noise potential",
      value: coolingNoisePotential,
      confidence: "estimated",
      source: NOISE_SOURCE,
      methodologyNote: "Relative 1-10 screening weight for the selected cooling technology — not a measured dBA value.",
    },
    residentialDensityScore: {
      label: "Residential density score",
      value: densityScore,
      confidence: densityScore != null ? "estimated" : "unknown",
      source: NATIONAL_SOURCES.censusCountyDensity,
      caveats: densityCaveats,
      densityLabel,
    },
    residentialProximityScore: {
      label: "Residential proximity score",
      value: proximity.score,
      confidence: proximity.score != null ? "estimated" : "unknown",
      source: NATIONAL_SOURCES.censusCountyDensity,
      caveats: proximity.isEstimateFromDensity
        ? ["No residential-parcel/address-point distance dataset is integrated yet — this reuses the residential density score as a labeled estimate, not a measured distance."]
        : undefined,
      isEstimateFromDensity: proximity.isEstimateFromDensity,
      distanceMiles: proximity.distanceMiles,
    },
    residentialExposure: {
      label: "Residential exposure",
      value: residentialExposure,
      confidence: residentialExposure != null ? "estimated" : "unknown",
      source: NATIONAL_SOURCES.censusCountyDensity,
      methodologyNote: `Density score × ${RESIDENTIAL_EXPOSURE_WEIGHTS.density} + proximity score × ${RESIDENTIAL_EXPOSURE_WEIGHTS.proximity} (density weighted higher — the same equipment beside a dense neighborhood creates substantially more potential community impact than beside an isolated site).`,
    },
    noiseImpactScore: {
      label: "Noise impact score",
      value: noiseImpactScore,
      confidence: noiseImpactScore != null ? "estimated" : "unknown",
      source: NOISE_SOURCE,
      caveats: [NOISE_METHODOLOGY_DISCLAIMER],
    },
    classification,
    isNoiseSignificant,
    explanation,
  };
}
