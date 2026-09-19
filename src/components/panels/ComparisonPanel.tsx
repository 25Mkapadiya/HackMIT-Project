"use client";

import { Fragment } from "react";
import { useAppStore } from "@/store/useAppStore";
import ConfidenceBadge from "@/components/ui/ConfidenceBadge";
import type { ScenarioAnalysis } from "@/lib/types";

function cell(value: string | number | null | undefined, confidence?: "fact" | "estimated" | "proxy" | "unknown") {
  return (
    <div className="flex flex-col gap-1">
      <span className="text-[12px] text-ink-100 font-mono">{value ?? "—"}</span>
      {confidence && <ConfidenceBadge confidence={confidence} />}
    </div>
  );
}

interface Row {
  label: string;
  get: (a: ScenarioAnalysis) => { value: string | number | null; confidence: "fact" | "estimated" | "proxy" | "unknown" };
}

const ROWS: { section: string; color: string; rows: Row[] }[] = [
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
      },
      {
        label: "Nearest ≥230 kV",
        get: (a) => ({
          value: a.power.nearest230kv.distanceMiles != null ? `${a.power.nearest230kv.distanceMiles} mi` : null,
          confidence: a.power.nearest230kv.confidence,
        }),
      },
      { label: "Utility territory", get: (a) => ({ value: a.power.utilityTerritory.value, confidence: a.power.utilityTerritory.confidence }) },
      {
        label: "Nearby generation",
        get: (a) => ({
          value: a.power.nearbyGeneration.value ? `${Math.round(a.power.nearbyGeneration.value.totalMw)} MW` : null,
          confidence: a.power.nearbyGeneration.confidence,
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
      },
      {
        label: "Nearest water body",
        get: (a) => ({
          value: a.water.nearestWaterBody.distanceMiles != null ? `${a.water.nearestWaterBody.distanceMiles} mi` : null,
          confidence: a.water.nearestWaterBody.confidence,
        }),
      },
      { label: "Water stress (proxy)", get: (a) => ({ value: a.water.waterStressLabel.value, confidence: a.water.waterStressLabel.confidence }) },
      { label: "Drought status", get: (a) => ({ value: a.water.droughtStatus.value, confidence: a.water.droughtStatus.confidence }) },
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
      },
    ],
  },
  {
    section: "Environment / Community",
    color: "#3bf2a0",
    rows: [
      { label: "FEMA flood zone", get: (a) => ({ value: a.land.femaFloodZone.value, confidence: a.land.femaFloodZone.confidence }) },
      {
        label: "Nearest state highway",
        get: (a) => ({
          value: a.land.nearestMajorRoadMiles.value != null ? `${a.land.nearestMajorRoadMiles.value} mi` : null,
          confidence: a.land.nearestMajorRoadMiles.confidence,
        }),
      },
      {
        label: "Population within 5 mi",
        get: (a) => ({
          value: a.land.populationWithin5mi.value != null ? a.land.populationWithin5mi.value.toLocaleString() : null,
          confidence: a.land.populationWithin5mi.confidence,
        }),
      },
      { label: "County", get: (a) => ({ value: a.regulation.county.value, confidence: a.regulation.county.confidence }) },
    ],
  },
  {
    section: "Development",
    color: "#c9d3e0",
    rows: [
      { label: "Est. acreage", get: (a) => ({ value: `${a.development.acreage.value} ac`, confidence: a.development.acreage.confidence }) },
      { label: "Infra. gaps flagged", get: (a) => ({ value: a.gaps.length, confidence: "fact" }) },
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
    <div className="absolute inset-0 z-40 bg-base-950/70 backdrop-blur-sm flex items-center justify-center p-6 animate-fade-in">
      <div className="glass-panel border border-base-700 rounded-xl shadow-panel w-full max-w-5xl max-h-[85vh] overflow-hidden flex flex-col">
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-base-700">
          <div>
            <div className="text-[13px] font-semibold text-ink-100">Site Comparison</div>
            <div className="text-[10.5px] text-ink-500">Same factual metrics, side by side. No composite score — interpret the tradeoffs yourself.</div>
          </div>
          <button onClick={() => setComparisonOpen(false)} className="text-ink-500 hover:text-ink-100 text-lg leading-none px-2">
            ×
          </button>
        </div>
        <div className="overflow-auto px-5 py-4">
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
                    </td>
                  </tr>
                  {section.rows.map((row) => (
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
                        const { value, confidence } = row.get(state.data);
                        return (
                          <td key={s.id} className="py-2 pr-6">
                            {cell(value, confidence)}
                          </td>
                        );
                      })}
                    </tr>
                  ))}
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
