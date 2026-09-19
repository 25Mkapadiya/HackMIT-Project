"use client";

import DraggablePanel from "@/components/ui/DraggablePanel";
import ScenarioConfigForm from "./ScenarioConfigForm";
import ImpactResults from "./ImpactResults";
import { useAppStore } from "@/store/useAppStore";

export default function ScenarioPanel({ collapsed, onToggleCollapse }: { collapsed: boolean; onToggleCollapse: () => void }) {
  const scenarios = useAppStore((s) => s.scenarios);
  const activeScenarioId = useAppStore((s) => s.activeScenarioId);
  const setActiveScenario = useAppStore((s) => s.setActiveScenario);
  const updateScenario = useAppStore((s) => s.updateScenario);
  const removeScenario = useAppStore((s) => s.removeScenario);
  const runAnalysis = useAppStore((s) => s.runAnalysis);
  const analysisByScenario = useAppStore((s) => s.analysisByScenario);
  const comparisonIds = useAppStore((s) => s.comparisonIds);
  const toggleComparisonId = useAppStore((s) => s.toggleComparisonId);
  const setComparisonOpen = useAppStore((s) => s.setComparisonOpen);
  const proposeMode = useAppStore((s) => s.proposeMode);

  const active = scenarios.find((s) => s.id === activeScenarioId) ?? null;
  const analysisState = active ? analysisByScenario[active.id] : undefined;

  if (scenarios.length === 0) {
    return (
      <DraggablePanel
        title="Proposed Site"
        defaultPosition={{ x: 16, y: 84 }}
        anchor="right"
        width={300}
        collapsed={collapsed}
        onToggleCollapse={onToggleCollapse}
        headerAccent="#ff5470"
      >
        <div className="px-4 py-6 text-center">
          <div className="text-[12.5px] text-ink-300 leading-relaxed">
            {proposeMode
              ? "Click anywhere on the map to place a hypothetical data center."
              : "Click \"Propose Data Center\" above, then click a location on the map to begin a scenario."}
          </div>
        </div>
      </DraggablePanel>
    );
  }

  return (
    <DraggablePanel
      title={active ? `${active.label} · Scenario` : "Proposed Site"}
      defaultPosition={{ x: 16, y: 84 }}
      anchor="right"
      width={368}
      collapsed={collapsed}
      onToggleCollapse={onToggleCollapse}
      headerAccent="#ff5470"
    >
      {/* site tabs */}
      <div className="flex items-center gap-1.5 px-3 pt-2.5 pb-1 overflow-x-auto no-scrollbar">
        {scenarios.map((s) => (
          <button
            key={s.id}
            onClick={() => setActiveScenario(s.id)}
            className={`shrink-0 flex items-center gap-1.5 rounded-full pl-2.5 pr-1.5 py-1 text-[11px] border transition-colors ${
              s.id === activeScenarioId
                ? "border-accent-proposed/60 bg-accent-proposed/10 text-accent-proposed"
                : "border-base-700 text-ink-500 hover:text-ink-100"
            }`}
          >
            {s.label}
            <span
              role="button"
              onClick={(e) => {
                e.stopPropagation();
                removeScenario(s.id);
              }}
              className="hover:text-rose-400 px-1"
            >
              ×
            </span>
          </button>
        ))}
      </div>

      {active && (
        <div>
          <div className="px-3.5 pt-2 pb-3 border-b border-base-800">
            <ScenarioConfigForm scenario={active} onChange={(patch) => updateScenario(active.id, patch)} />

            <div className="flex items-center gap-2 mt-3.5">
              <button
                onClick={() => runAnalysis(active.id)}
                disabled={analysisState?.status === "loading"}
                className="flex-1 bg-accent-proposed text-white text-[12px] font-semibold py-2 rounded-md hover:brightness-110 disabled:opacity-60 transition-all"
              >
                {analysisState?.status === "loading" ? "Analyzing…" : "Run Site Analysis"}
              </button>
              <label className="flex items-center gap-1.5 text-[10.5px] text-ink-500 px-1 select-none">
                <input
                  type="checkbox"
                  checked={comparisonIds.includes(active.id)}
                  onChange={() => {
                    toggleComparisonId(active.id);
                    // Only auto-open the comparison view once it's actually meaningful (2+ sites).
                    if (!comparisonIds.includes(active.id) && comparisonIds.length >= 1) setComparisonOpen(true);
                  }}
                />
                Compare
              </label>
            </div>
          </div>

          {analysisState?.status === "error" && (
            <div className="px-3.5 py-4 text-[12px] text-rose-300">
              Analysis failed: {analysisState.message}. Upstream data sources may be temporarily unavailable — try again.
            </div>
          )}
          {analysisState?.status === "ready" && <ImpactResults analysis={analysisState.data} />}
        </div>
      )}
    </DraggablePanel>
  );
}
