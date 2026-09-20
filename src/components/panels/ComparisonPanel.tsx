"use client";

import { Fragment } from "react";
import { useAppStore } from "@/store/useAppStore";
import type { ScenarioAnalysis } from "@/lib/types";

// Known low-to-high severity scales used across the analysis, so a categorical
// label like "High" water stress can still be ranked against another site's
// "Low" the same way a numeric distance can — without inventing a composite score.
const SEVERITY_RANK: Record<string, number> = {
  Low: 0,
  Moderate: 1,
  Medium: 1,
  High: 2,
  "Very High": 3,
};

function cell(value: string | number | null | undefined, isBest: boolean) {
  return (
    <span className={`text-[12px] font-mono ${isBest ? "text-emerald-300 font-semibold" : "text-ink-100"}`}>
      {value ?? "—"}
      {isBest && <span className="ml-1 text-[9px] font-sans font-bold tracking-wide text-emerald-400">BEST</span>}
    </span>
  );
}

interface Row {
  label: string;
  get: (a: ScenarioAnalysis) => { value: string | number | null; confidence: "fact" | "estimated" | "proxy" | "unknown" };
  /** Only set for metrics where "better" is objectively unambiguous — never for context-dependent ones like population or acreage. */
  rank?: (a: ScenarioAnalysis) => number | null;
  better?: "lower" | "higher";
}

const distanceRank = (miles: number | null) => miles;
const severityRank = (label: string | null | undefined) => (label != null ? SEVERITY_RANK[label] ?? null : null);

const ROWS: { section: string; color: string; note?: string; rows: Row[] }[] = [
  {
    section: "Power",
    color: "#f2b93b",
    rows: [
      { label: "Facility load", get: (a) => ({ value: `${a.power.facilityRequirementMw} MW`, confidence: "fact" }) },
      {
        label: "Nearest transmission",
        get: (a) => ({
          value: a.power.nearestTransmission.distanceMiles != null ? `${a.power.nearestTransmission.distanceMiles} mi` : null,
          confidence: a.power.nearestTransmission.confidence,
        }),
        rank: (a) => distanceRank(a.power.nearestTransmission.distanceMiles),
        better: "lower",
      },
      {
        label: "Nearest ≥230 kV",
        get: (a) => ({
          value: a.power.nearest230kv.distanceMiles != null ? `${a.power.nearest230kv.distanceMiles} mi` : null,
          confidence: a.power.nearest230kv.confidence,
        }),
        rank: (a) => distanceRank(a.power.nearest230kv.distanceMiles),
        better: "lower",
      },
      {
        label: "Nearest substation",
        get: (a) => ({
          value: a.power.nearestSubstation.distanceMiles != null ? `${a.power.nearestSubstation.distanceMiles} mi` : null,
          confidence: a.power.nearestSubstation.confidence,
        }),
        rank: (a) => distanceRank(a.power.nearestSubstation.distanceMiles),
        better: "lower",
      },
      {
        label: "Grid demand pressure",
        get: (a) => ({ value: a.power.gridDemandPressure.demandPressureLabel, confidence: a.power.gridDemandPressure.confidence }),
        rank: (a) => severityRank(a.power.gridDemandPressure.demandPressureLabel),
        better: "lower",
      },
      { label: "Utility territory", get: (a) => ({ value: a.power.utilityTerritory.value, confidence: a.power.utilityTerritory.confidence }) },
      {
        label: "Nearby generation",
        get: (a) => ({
          value: a.power.nearbyGeneration.value ? `${Math.round(a.power.nearbyGeneration.value.totalMw)} MW` : null,
          confidence: a.power.nearbyGeneration.confidence,
        }),
        rank: (a) => a.power.nearbyGeneration.value?.totalMw ?? null,
        better: "higher",
      },
    ],
  },
  {
    section: "Efficiency",
    color: "#e0a84a",
    note: "Modeled from cooling technology + local grid demand pressure — a heuristic, not a measured PUE.",
    rows: [
      {
        label: "Estimated PUE",
        get: (a) => ({ value: a.efficiency.estimatedPue.value.toFixed(2), confidence: a.efficiency.estimatedPue.confidence }),
        rank: (a) => a.efficiency.estimatedPue.value,
        better: "lower",
      },
      {
        label: "Water-stress cooling risk",
        get: (a) => ({
          value: a.efficiency.estimatedPue.factors.some((f) => f.label.startsWith("Water-stress")) ? "Flagged" : "None",
          confidence: "estimated",
        }),
      },
    ],
  },
  {
    section: "Water",
    color: "#3ba9f2",
    rows: [
      {
        label: "Est. consumption",
        get: (a) => ({
          value: a.water.estimatedConsumptionGalPerDay.value != null ? `${a.water.estimatedConsumptionGalPerDay.value.toLocaleString()} gal/day` : null,
          confidence: a.water.estimatedConsumptionGalPerDay.confidence,
        }),
        rank: (a) => a.water.estimatedConsumptionGalPerDay.value,
        better: "lower",
      },
      {
        label: "Est. withdrawal",
        get: (a) => ({
          value: a.water.estimatedWithdrawalGalPerDay.value != null ? `${a.water.estimatedWithdrawalGalPerDay.value.toLocaleString()} gal/day` : null,
          confidence: a.water.estimatedWithdrawalGalPerDay.confidence,
        }),
        rank: (a) => a.water.estimatedWithdrawalGalPerDay.value,
        better: "lower",
      },
      {
        label: "Water stress",
        get: (a) => ({ value: a.water.waterStressLabel.value, confidence: a.water.waterStressLabel.confidence }),
        rank: (a) => severityRank(a.water.waterStressLabel.value),
        better: "lower",
      },
      { label: "Drought status", get: (a) => ({ value: a.water.droughtStatus.value, confidence: a.water.droughtStatus.confidence }) },
      {
        label: "Nearest water body",
        get: (a) => ({
          value: a.water.nearestWaterBody.distanceMiles != null ? `${a.water.nearestWaterBody.distanceMiles} mi` : null,
          confidence: a.water.nearestWaterBody.confidence,
        }),
      },
    ],
  },
  {
    section: "Environment / Community",
    color: "#3bf2a0",
    rows: [
      {
        label: "Noise impact",
        get: (a) => ({
          value:
            a.noise.noiseImpactScore.value != null
              ? `${a.noise.noiseImpactScore.value}/100 (${a.noise.classification})`
              : null,
          confidence: a.noise.noiseImpactScore.confidence,
        }),
        rank: (a) => a.noise.noiseImpactScore.value,
        better: "lower",
      },
      { label: "FEMA flood zone", get: (a) => ({ value: a.land.femaFloodZone.value, confidence: a.land.femaFloodZone.confidence }) },
      {
        label: "Environmental constraints flagged",
        get: (a) => ({ value: a.land.environmentalConstraints.value.length, confidence: a.land.environmentalConstraints.confidence }),
        rank: (a) => a.land.environmentalConstraints.value.length,
        better: "lower",
      },
      {
        label: "Population within 5 mi",
        get: (a) => ({
          value: a.land.populationWithin5mi.value != null ? a.land.populationWithin5mi.value.toLocaleString() : null,
          confidence: a.land.populationWithin5mi.confidence,
        }),
      },
      {
        label: "Nearest state highway",
        get: (a) => ({
          value: a.land.nearestMajorRoadMiles.value != null ? `${a.land.nearestMajorRoadMiles.value} mi` : null,
          confidence: a.land.nearestMajorRoadMiles.confidence,
        }),
      },
      { label: "County", get: (a) => ({ value: a.regulation.county.value, confidence: a.regulation.county.confidence }) },
    ],
  },
  {
    section: "Connectivity",
    color: "#9b6ef2",
    rows: [
      {
        label: "Nearest colo/IX facility",
        get: (a) => ({
          value: a.fiber.nearestIxp.distanceMiles != null ? `${a.fiber.nearestIxp.distanceMiles} mi` : null,
          confidence: a.fiber.nearestIxp.confidence,
        }),
        rank: (a) => distanceRank(a.fiber.nearestIxp.distanceMiles),
        better: "lower",
      },
    ],
  },
  {
    section: "Development",
    color: "#c9d3e0",
    rows: [
      { label: "Est. site area", get: (a) => ({ value: `${a.development.acreage.value.toLocaleString()} sq ft`, confidence: a.development.acreage.confidence }) },
      {
        label: "Infra. gaps flagged",
        get: (a) => ({ value: a.gaps.length, confidence: "fact" }),
        rank: (a) => a.gaps.length,
        better: "lower",
      },
    ],
  },
];

export default function ComparisonPanel() {
  const comparisonOpen = useAppStore((s) => s.comparisonOpen);
  const setComparisonOpen = useAppStore((s) => s.setComparisonOpen);
  const comparisonIds = useAppStore((s) => s.comparisonIds);
  const scenarios = useAppStore((s) => s.scenarios);
  const analysisByScenario = useAppStore((s) => s.analysisByScenario);
  const runAnalysis = useAppStore((s) => s.runAnalysis);

  if (!comparisonOpen) return null;

  const sites = comparisonIds.map((id) => scenarios.find((s) => s.id === id)).filter(Boolean) as typeof scenarios;

  return (
    <div className="absolute inset-0 z-40 bg-base-950/70 backdrop-blur-sm flex items-center justify-center p-2.5 sm:p-6 animate-fade-in">
      <div className="glass-panel border border-base-700 rounded-xl shadow-panel w-full max-w-5xl max-h-[90vh] sm:max-h-[85vh] overflow-hidden flex flex-col">
        <div className="flex items-center justify-between gap-2 px-3 sm:px-5 py-3 sm:py-3.5 border-b border-base-700">
          <div className="min-w-0">
            <div className="text-[13px] font-semibold text-ink-100">Site Comparison</div>
            <div className="hidden sm:block text-[10.5px] text-ink-500">
              <span className="text-emerald-400 font-semibold">BEST</span> flags the objectively better value per row (lower distance/PUE/water use/etc.) — still no single composite score, since real tradeoffs (e.g. cost vs. efficiency) depend on your priorities.
            </div>
          </div>
          <button onClick={() => setComparisonOpen(false)} className="shrink-0 text-ink-500 hover:text-ink-100 text-lg leading-none px-2">
            ×
          </button>
        </div>
        <div className="overflow-auto px-3 sm:px-5 py-3 sm:py-4">
          <table className="w-full border-collapse min-w-[560px]">
            <thead>
              <tr>
                <th className="text-left text-[10px] uppercase tracking-[0.08em] text-ink-500 pb-2 pr-4 sticky left-0 bg-transparent">
                  Metric
                </th>
                {sites.map((s) => (
                  <th key={s.id} className="text-left text-[12px] font-semibold text-accent-proposed pb-2 pr-6 min-w-[150px]">
                    {s.label}
                    <div className="text-[9.5px] text-ink-500 font-normal">
                      {s.lat.toFixed(3)}, {s.lng.toFixed(3)} · {s.mwLoad} MW
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {ROWS.map((section) => (
                <Fragment key={section.section}>
                  <tr>
                    <td colSpan={sites.length + 1} className="pt-4 pb-1">
                      <span className="text-[10.5px] font-bold uppercase tracking-[0.08em]" style={{ color: section.color }}>
                        {section.section}
                      </span>
                      {section.note && <span className="ml-2 text-[9.5px] font-normal normal-case text-ink-600">{section.note}</span>}
                    </td>
                  </tr>
                  {section.rows.map((row) => {
                    const ranked = row.rank
                      ? sites
                          .map((s) => {
                            const state = analysisByScenario[s.id];
                            if (!state || state.status !== "ready") return null;
                            const value = row.rank!(state.data);
                            return value == null ? null : { id: s.id, value };
                          })
                          .filter((x): x is { id: string; value: number } => x !== null)
                      : [];
                    const bestValue =
                      ranked.length >= 2
                        ? row.better === "higher"
                          ? Math.max(...ranked.map((r) => r.value))
                          : Math.min(...ranked.map((r) => r.value))
                        : null;

                    return (
                      <tr key={row.label} className="border-b border-base-800/60">
                        <td className="text-[11.5px] text-ink-300 py-2 pr-4 whitespace-nowrap sticky left-0">{row.label}</td>
                        {sites.map((s) => {
                          const state = analysisByScenario[s.id];
                          if (!state || state.status !== "ready") {
                            return (
                              <td key={s.id} className="py-2 pr-6 text-[11px] text-ink-700">
                                —
                              </td>
                            );
                          }
                          const { value } = row.get(state.data);
                          const isBest = bestValue != null && ranked.find((r) => r.id === s.id)?.value === bestValue;
                          return (
                            <td key={s.id} className="py-2 pr-6">
                              {cell(value, isBest)}
                            </td>
                          );
                        })}
                      </tr>
                    );
                  })}
                </Fragment>
              ))}
            </tbody>
          </table>

          {sites.some((s) => analysisByScenario[s.id]?.status !== "ready") && (
            <div className="mt-4 flex flex-wrap gap-2">
              {sites
                .filter((s) => analysisByScenario[s.id]?.status !== "ready")
                .map((s) => (
                  <button
                    key={s.id}
                    onClick={() => runAnalysis(s.id)}
                    className="text-[11px] px-3 py-1.5 rounded-md border border-base-600 text-ink-100 hover:bg-base-800"
                  >
                    Run analysis for {s.label}
                  </button>
                ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
