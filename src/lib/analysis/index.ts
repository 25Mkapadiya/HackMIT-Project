import type { ScenarioAnalysis, ScenarioConfig } from "@/lib/types";
import { computePowerAnalysis } from "./power";
import { computeFiberAnalysis } from "./fiber";
import { computeRegulationAnalysis } from "./regulation";
import { computeEfficiencyAnalysis } from "./efficiency";
import { computeWaterAnalysis } from "./water";
import { computeLandAnalysis } from "./land";
import { computeNoiseAnalysis } from "./noise";
import { computeDevelopmentEstimate } from "./development";
import { synthesizeGaps } from "./gaps";

/**
 * Runs the full site analysis SEQUENTIALLY, in the product-specified order:
 * POWER -> FIBER -> REGULATION -> EFFICIENCY -> WATER -> LAND -> NOISE.
 * Regulation reuses the utility territory already resolved by the power step,
 * and efficiency reuses power's population-density lookup (no extra Census
 * geocoder call) to model a site-specific PUE. Water is calculated independently
 * from IT-equipment energy because WUE is defined per kWh of IT energy, not facility energy.
 * Noise is synchronous (no network call) — it reuses power's county
 * population-density lookup rather than fetching anything new. Every other
 * step is independent and could be parallelized later without changing results.
 */
export async function runScenarioAnalysis(scenario: ScenarioConfig): Promise<ScenarioAnalysis> {
  const power = await computePowerAnalysis(scenario);
  const fiber = await computeFiberAnalysis(scenario);
  const regulation = await computeRegulationAnalysis(scenario, power.utilityTerritory.value);
  const efficiency = await computeEfficiencyAnalysis(scenario, power);
  const water = await computeWaterAnalysis(scenario);
  const land = await computeLandAnalysis(scenario);
  const noise = computeNoiseAnalysis(scenario, power);

  const development = computeDevelopmentEstimate(scenario, land);
  const gaps = synthesizeGaps(power, fiber, regulation, water, land, noise);

  return {
    scenarioId: scenario.id,
    generatedAt: new Date().toISOString(),
    power,
    fiber,
    regulation,
    efficiency,
    water,
    land,
    noise,
    development,
    gaps,
  };
}
