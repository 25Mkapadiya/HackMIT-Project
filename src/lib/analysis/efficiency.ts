import type { EfficiencyAnalysis, PowerAnalysis, PueFactor, ScenarioConfig, SourceMeta } from "@/lib/types";
import {
  BASE_PUE_BY_COOLING_TECH,
  PUE_DENSITY_ADJUSTMENT,
  PUE_WATER_STRESS_CONSTRAINT_DELTA,
} from "@/lib/constants/assumptions";
import { computeWaterStressContext } from "./water";

const EFFICIENCY_SOURCE: SourceMeta = {
  id: "pue-industry-benchmark-model",
  name: "Modeled PUE from published industry benchmarks (Uptime Institute + cooling-technology figures)",
  url: "https://uptimeinstitute.com/",
  license: "Derived from publicly reported industry survey/benchmark figures",
  refreshFrequency: "Manually reviewed against current published benchmarks",
  methodology:
    "Base PUE for the scenario's selected cooling technology (published industry ranges), plus a directional adjustment for local population-density 'grid demand pressure' — reflecting the documented gap between hyperscale, single-tenant facilities (~1.1-1.2 PUE, easier to site on cheap contiguous rural/exurban land) and smaller/multi-tenant facilities more common in land-constrained dense counties (~1.5-1.8 PUE, per Uptime Institute's 2025 Global Data Center Survey, which put the industry-wide weighted average at ~1.54) — plus a water-stress cooling-constraint adjustment where evaporative cooling is chosen somewhere both water-stressed and land-constrained. This is a transparent heuristic model, NOT a measured statistical correlation: no public dataset joins per-facility PUE to county-level population data.",
};

/**
 * Estimates this scenario's PUE from published industry benchmarks, adjusted
 * for the site's local population-density "grid demand pressure" (already
 * computed in power.ts) and a water-stress cooling constraint. Only depends
 * on `power` (reuses its density lookup — no extra Census geocoder call);
 * water.ts computes its own technology-specific water model independently
 * and does not need this estimate, so the two can run concurrently (see
 * runScenarioAnalysis in analysis/index.ts).
 */
export async function computeEfficiencyAnalysis(
  scenario: ScenarioConfig,
  power: PowerAnalysis
): Promise<EfficiencyAnalysis> {
  const base =
    BASE_PUE_BY_COOLING_TECH[scenario.coolingTechnology] ?? BASE_PUE_BY_COOLING_TECH.chilled_water_air_cooled_chiller!;
  const demandPressureLabel = power.gridDemandPressure.demandPressureLabel;
  const densityDelta = PUE_DENSITY_ADJUSTMENT[demandPressureLabel] ?? 0;

  const { waterStress } = await computeWaterStressContext(scenario);
  const isEvaporative = scenario.coolingTechnology === "cooling_tower_evaporative";
  const isDenseDemand = demandPressureLabel === "High" || demandPressureLabel === "Very High";
  const isWaterConstrained = waterStress === "High" || waterStress === "Medium";
  const waterConstraintApplies = isEvaporative && isDenseDemand && isWaterConstrained;

  const factors: PueFactor[] = [
    {
      label: `Base — ${base.label}`,
      deltaPue: base.value,
      rationale: base.description,
    },
    {
      label: `Local demand pressure — ${demandPressureLabel}`,
      deltaPue: densityDelta,
      rationale:
        densityDelta > 0
          ? "Denser counties leave less land/power headroom for a single large-scale build, nudging design toward smaller/multi-tenant facilities, which run measurably higher PUE industry-wide."
          : "Low local demand pressure — land and power headroom here typically support the larger, single-tenant designs that achieve the best published PUE figures.",
    },
  ];
  if (waterConstraintApplies) {
    factors.push({
      label: "Water-stress cooling constraint",
      deltaPue: PUE_WATER_STRESS_CONSTRAINT_DELTA,
      rationale:
        "Evaporative cooling was selected, but this site is both water-stressed and in a high-demand-pressure county — a real risk of being value-engineered into an air-cooled fallback, which runs a higher PUE than the evaporative baseline.",
    });
  }

  const estimatedPueValue = Math.round(factors.reduce((sum, f) => sum + f.deltaPue, 0) * 100) / 100;

  return {
    estimatedPue: {
      label: "Estimated PUE (Power Usage Effectiveness)",
      value: estimatedPueValue,
      confidence: "estimated",
      source: EFFICIENCY_SOURCE,
      factors,
      caveats: [
        "Directional, industry-benchmark-based model — not a measured statistical correlation between population density and PUE. No public dataset joins per-facility PUE to county population data.",
        "Climate (not modeled here) is typically the single largest real driver of achievable PUE. A mechanical/electrical design study is required for an actual PUE commitment.",
      ],
    },
  };
}
