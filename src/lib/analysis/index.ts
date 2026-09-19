import type { ScenarioAnalysis, ScenarioConfig } from "@/lib/types";
import { computePowerAnalysis } from "./power";
import { computeFiberAnalysis } from "./fiber";
import { computeRegulationAnalysis } from "./regulation";
import { computeWaterAnalysis } from "./water";
import { computeLandAnalysis } from "./land";
import { computeDevelopmentEstimate } from "./development";
import { synthesizeGaps } from "./gaps";

/**
 * Runs the full site analysis SEQUENTIALLY, in the product-specified order:
 * POWER -> FIBER -> REGULATION -> WATER -> LAND.
 * Regulation reuses the utility territory already resolved by the power step
 * rather than re-fetching it, which is the one place a later step depends on
 * an earlier one; every other step is independent and could be parallelized
 * later without changing results.
 */
export async function runScenarioAnalysis(scenario: ScenarioConfig): Promise<ScenarioAnalysis> {
  const power = await computePowerAnalysis(scenario);
  const fiber = await computeFiberAnalysis(scenario);
  const regulation = await computeRegulationAnalysis(scenario, power.utilityTerritory.value);
  const water = await computeWaterAnalysis(scenario);
  const land = await computeLandAnalysis(scenario);

  const development = await computeDevelopmentEstimate(scenario, land);
  const gaps = synthesizeGaps(power, fiber, regulation, water, land);

  return {
    scenarioId: scenario.id,
    generatedAt: new Date().toISOString(),
    power,
    fiber,
    regulation,
    water,
    land,
    development,
    gaps,
  };
}
