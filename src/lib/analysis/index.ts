import type { ScenarioAnalysis, ScenarioConfig } from "@/lib/types";
import { computePowerAnalysis } from "./power";
import { computeFiberAnalysis } from "./fiber";
import { computeRegulationAnalysis } from "./regulation";
import { computeWaterAnalysis } from "./water";
import { computeLandAnalysis } from "./land";
import { computeDevelopmentEstimate } from "./development";
import { synthesizeGaps } from "./gaps";
import { getAnalysisContext } from "./contextRegistry";

/**
 * Runs the full site analysis SEQUENTIALLY, in the product-specified order:
 * POWER -> FIBER -> REGULATION -> WATER -> LAND.
 * Regulation reuses the utility territory already resolved by the power step
 * rather than re-fetching it, which is the one place a later step depends on
 * an earlier one; every other step is independent and could be parallelized
 * later without changing results.
 *
 * Every step reads its GIS fetchers/source metadata from the StateAnalysisContext
 * resolved for scenario.stateId — this function itself has no state-specific
 * knowledge, so adding a state means adding a context, not touching this file.
 */
export async function runScenarioAnalysis(scenario: ScenarioConfig): Promise<ScenarioAnalysis> {
  const ctx = getAnalysisContext(scenario.stateId);

  const power = await computePowerAnalysis(scenario, ctx);
  const fiber = await computeFiberAnalysis(scenario, ctx);
  const regulation = await computeRegulationAnalysis(scenario, power.utilityTerritory.value, ctx);
  const water = await computeWaterAnalysis(scenario, ctx);
  const land = await computeLandAnalysis(scenario, ctx);

  const development = await computeDevelopmentEstimate(scenario, land, ctx);
  const gaps = synthesizeGaps(power, fiber, regulation, water, land, ctx);

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
