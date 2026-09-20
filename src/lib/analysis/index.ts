import type { ScenarioAnalysis, ScenarioConfig } from "@/lib/types";
import { computePowerAnalysis } from "./power";
import { computeFiberAnalysis } from "./fiber";
import { computeRegulationAnalysis } from "./regulation";
import { computeEfficiencyAnalysis } from "./efficiency";
import { computeWaterAnalysis } from "./water";
import { computeLandAnalysis } from "./land";
import { computeDevelopmentEstimate } from "./development";
import { synthesizeGaps } from "./gaps";

/**
 * Runs the full site analysis SEQUENTIALLY, in the product-specified order:
 * POWER -> FIBER -> REGULATION -> EFFICIENCY -> WATER -> LAND.
 * Regulation reuses the utility territory already resolved by the power step,
 * and efficiency reuses power's population-density lookup (no extra Census
 * geocoder call) to model a site-specific PUE — which water then uses for its
 * consumption/withdrawal figures instead of a flat assumed PUE. Every other
 * step is independent and could be parallelized later without changing results.
 */
export async function runScenarioAnalysis(scenario: ScenarioConfig): Promise<ScenarioAnalysis> {
  const power = await computePowerAnalysis(scenario);
  const fiber = await computeFiberAnalysis(scenario);
  const regulation = await computeRegulationAnalysis(scenario, power.utilityTerritory.value);
  const efficiency = await computeEfficiencyAnalysis(scenario, power);
  const water = await computeWaterAnalysis(scenario, efficiency.estimatedPue.value);
  const land = await computeLandAnalysis(scenario);

  const development = computeDevelopmentEstimate(scenario, land);
  const gaps = synthesizeGaps(power, fiber, regulation, water, land);

  return {
    scenarioId: scenario.id,
    generatedAt: new Date().toISOString(),
    power,
    fiber,
    regulation,
    efficiency,
    water,
    land,
    development,
    gaps,
  };
}
