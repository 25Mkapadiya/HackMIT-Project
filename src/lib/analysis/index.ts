import type { ScenarioAnalysis, ScenarioConfig } from "@/lib/types";
import { computePowerAnalysis } from "./power";
import { computeFiberAnalysis } from "./fiber";
import { computeRegulationAnalysis } from "./regulation";
import { computeEfficiencyAnalysis } from "./efficiency";
import { computeWaterAnalysis } from "./water";
import { computeClimateAnalysis } from "./climate";
import { computeLandAnalysis } from "./land";
import { computeNoiseAnalysis } from "./noise";
import { computeDevelopmentEstimate } from "./development";
import { synthesizeGaps } from "./gaps";

/**
 * Runs the full site analysis, respecting the ACTUAL data dependencies
 * instead of one long sequential chain (which made every scenario wait on
 * every upstream API in turn — 5-7s+ end to end in testing, most of it idle
 * network wait, not real work):
 *
 *   - POWER, FIBER, WATER, CLIMATE, and LAND have no dependency on each
 *     other, so all five start immediately, in the background, together.
 *   - REGULATION (needs power.utilityTerritory) and EFFICIENCY (needs
 *     power's population-density lookup for a site-specific PUE) only
 *     depend on POWER, so they start the moment POWER resolves — they do
 *     NOT wait for FIBER/WATER/CLIMATE/LAND to finish too.
 *   - NOISE is synchronous (no network call) and only needs POWER, so it's
 *     computed last, for free.
 *   - FIBER/WATER/CLIMATE/LAND are awaited last, by which point they've
 *     likely already finished in the background.
 *
 * This changes WHEN each step's work happens, never WHAT it computes —
 * every function call and its inputs are identical to the sequential
 * version, so results are unchanged. A per-analysis run makes at most a
 * handful of concurrent calls (nowhere near the "Show All" nationwide
 * layer-loading path's scale), so any incidental overlap in upstream data
 * (e.g. efficiency's and water's own drought/water-rights lookups, or
 * water's and climate's own climate-stats lookups) costs at most one extra
 * duplicate request per run — see the comment on computeWaterStressContext
 * in water.ts and fetchClimateStats in climate.ts. Deliberately NOT deduped via the
 * shared cache (src/lib/cache/memoryCache.ts is a plain resolved-value TTL
 * cache, not a request coalescer) — an in-flight-request-sharing version of
 * that cache was tried and reverted after it measurably stalled the "Show
 * All" reveal (hundreds of concurrent layer fetches at once); this simpler,
 * lower-volume duplicate is the safer tradeoff.
 */
export async function runScenarioAnalysis(scenario: ScenarioConfig): Promise<ScenarioAnalysis> {
  const fiberPromise = computeFiberAnalysis(scenario);
  const waterPromise = computeWaterAnalysis(scenario);
  const climatePromise = computeClimateAnalysis(scenario);
  const landPromise = computeLandAnalysis(scenario);

  const power = await computePowerAnalysis(scenario);

  const [regulation, efficiency] = await Promise.all([
    computeRegulationAnalysis(scenario, power.utilityTerritory.value),
    computeEfficiencyAnalysis(scenario, power),
  ]);
  const noise = computeNoiseAnalysis(scenario, power);

  const [fiber, water, climate, land] = await Promise.all([fiberPromise, waterPromise, climatePromise, landPromise]);

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
    climate,
    land,
    noise,
    development,
    gaps,
  };
}
