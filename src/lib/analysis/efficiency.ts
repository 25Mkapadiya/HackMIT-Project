import type { EfficiencyAnalysis, PowerAnalysis, PueFactor, ScenarioConfig, SourceMeta } from "@/lib/types";
import {
  BASE_PUE_BY_COOLING_TECH,
  PUE_DENSITY_ADJUSTMENT,
  PUE_GRID_PROXIMITY_ADJUSTMENT,
  PUE_WATER_STRESS_CONSTRAINT_DELTA,
  TRANSMISSION_PROXIMITY_BANDS,
} from "@/lib/constants/assumptions";
import { computeWaterStressContext } from "./water";

const EFFICIENCY_SOURCE: SourceMeta = {
  id: "pue-industry-benchmark-model",
  name: "Modeled PUE from published industry benchmarks (Uptime Institute + cooling-technology figures)",
  url: "https://uptimeinstitute.com/",
  license: "Derived from publicly reported industry survey/benchmark figures",
  refreshFrequency: "Manually reviewed against current published benchmarks",
  methodology:
    "Base PUE for the scenario's selected cooling technology (published industry ranges), plus a directional adjustment for local population-density 'grid demand pressure' — reflecting the documented gap between hyperscale, single-tenant facilities (~1.1-1.2 PUE, easier to site on cheap contiguous rural/exurban land) and smaller/multi-tenant facilities more common in land-constrained dense counties (~1.5-1.8 PUE, per Uptime Institute's 2025 Global Data Center Survey, which put the industry-wide weighted average at ~1.54) — plus a directional adjustment for distance to the nearest known substation or high-voltage transmission line (short, direct interconnections avoid the on-site step-up infrastructure and long tie-line builds associated with less-optimized designs) — plus a water-stress cooling-constraint adjustment where evaporative cooling is chosen somewhere both water-stressed and land-constrained. This is a transparent heuristic model, NOT a measured statistical correlation: no public dataset joins per-facility PUE to county-level population data or interconnection distance.",
};

type GridProximityLabel = "Very Close" | "Close" | "Moderate" | "Far" | "Unknown";

/** Closest known grid tie-in point — nearest substation or nearest 115kV/230kV/500kV transmission line, whichever is nearer. */
function nearestGridInfrastructureMiles(power: PowerAnalysis): number | null {
  const candidates = [
    power.nearestSubstation.distanceMiles,
    power.nearest115kv.distanceMiles,
    power.nearest230kv.distanceMiles,
    power.nearest500kv.distanceMiles,
  ].filter((d): d is number => d != null);
  return candidates.length > 0 ? Math.min(...candidates) : null;
}

function gridProximityLabelFor(distanceMiles: number | null): GridProximityLabel {
  if (distanceMiles == null) return "Unknown";
  if (distanceMiles <= TRANSMISSION_PROXIMITY_BANDS.veryClose) return "Very Close";
  if (distanceMiles <= TRANSMISSION_PROXIMITY_BANDS.close) return "Close";
  if (distanceMiles <= TRANSMISSION_PROXIMITY_BANDS.moderate) return "Moderate";
  return "Far";
}

/**
 * Estimates this scenario's PUE from published industry benchmarks, adjusted
 * for the site's local population-density "grid demand pressure", its
 * distance to the nearest known substation/high-voltage transmission line,
 * and a water-stress cooling constraint. Only depends on `power` (reuses its
 * density and grid-distance lookups — no extra network calls); water.ts
 * computes its own technology-specific water model independently and does
 * not need this estimate, so the two can run concurrently (see
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

  const gridDistanceMiles = nearestGridInfrastructureMiles(power);
  const gridProximityLabel = gridProximityLabelFor(gridDistanceMiles);
  const gridProximityDelta = PUE_GRID_PROXIMITY_ADJUSTMENT[gridProximityLabel] ?? 0;

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
    {
      label: `Grid interconnection proximity — ${gridProximityLabel}${
        gridDistanceMiles != null ? ` (${gridDistanceMiles.toFixed(1)} mi)` : ""
      }`,
      deltaPue: gridProximityDelta,
      rationale:
        gridDistanceMiles == null
          ? "No known substation or high-voltage transmission line was found near this site in the source dataset — interconnection distance is unavailable, so no adjustment was applied."
          : gridProximityDelta > 0
          ? "A longer run to the nearest known substation or high-voltage transmission line typically means a longer utility- or developer-funded tie line and more owned step-up/step-down infrastructure inside the facility boundary — conditions associated with smaller or staged builds that run higher PUE."
          : "Sited close to a known substation or high-voltage transmission line — a short, direct interconnection is the siting pattern hyperscale operators favor, supporting the larger, purpose-built designs that achieve the best published PUE figures.",
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
        "Directional, industry-benchmark-based model — not a measured statistical correlation between population density, grid interconnection distance, and PUE. No public dataset joins per-facility PUE to county population data or substation/transmission proximity.",
        "Grid proximity is measured to the nearest known substation or 115kV+ transmission line in the source dataset (location only, not confirmed interconnection headroom) — see PowerAnalysis.nearestSubstation / nearest115kv / nearest230kv / nearest500kv.",
        "Climate (not modeled here) is typically the single largest real driver of achievable PUE. A mechanical/electrical design study is required for an actual PUE commitment.",
      ],
    },
  };
}
