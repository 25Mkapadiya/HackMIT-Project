"use client";

import { useAppStore } from "@/store/useAppStore";
import { STATE_REGISTRY, getState, getEnabledStates } from "@/states/registry";

export default function TopBar() {
  const proposeMode = useAppStore((s) => s.proposeMode);
  const setProposeMode = useAppStore((s) => s.setProposeMode);
  const comparisonIds = useAppStore((s) => s.comparisonIds);
  const setComparisonOpen = useAppStore((s) => s.setComparisonOpen);
  const comparisonOpen = useAppStore((s) => s.comparisonOpen);
  const activeStateId = useAppStore((s) => s.activeStateId);
  const setActiveStateId = useAppStore((s) => s.setActiveStateId);
  const showAllStates = useAppStore((s) => s.showAllStates);
  const setShowAllStates = useAppStore((s) => s.setShowAllStates);

  const activeState = getState(activeStateId);
  const implementedStates = getEnabledStates();
  const subtitle = showAllStates
    ? `Showing all ${implementedStates.length} implemented states`
    : activeState?.enabled
      ? "Data Center Siting Intelligence"
      : `${activeState?.name ?? "Selected state"} — coming soon, showing Washington's live analysis`;

  return (
    <div className="absolute top-0 left-0 right-0 z-30 flex items-center justify-between gap-4 px-4 h-14 glass-panel border-b border-base-700">
      <div className="flex items-center gap-3 min-w-0">
        <div className="flex items-center gap-2">
          <div className="h-7 w-7 rounded-md bg-gradient-to-br from-accent-power to-accent-proposed flex items-center justify-center text-[13px] font-bold text-base-950">
            G
          </div>
          <div className="leading-tight">
            <div className="text-[13px] font-semibold text-ink-100 tracking-tight">Grid &amp; Ground</div>
            <div className="text-[9.5px] text-ink-500 tracking-wide -mt-0.5 truncate max-w-[240px]">{subtitle}</div>
          </div>
        </div>
        <div className="hidden sm:flex items-center gap-1.5 ml-3 pl-3 border-l border-base-700">
          <span className={`h-1.5 w-1.5 rounded-full ${showAllStates || activeState?.enabled ? "bg-emerald-400" : "bg-amber-400"}`} />
          <select
            value={activeStateId}
            onChange={(e) => setActiveStateId(e.target.value)}
            className="bg-transparent text-[11px] text-ink-300 hover:text-ink-100 focus:outline-none cursor-pointer"
          >
            {STATE_REGISTRY.map((s) => (
              <option key={s.id} value={s.id} className="bg-base-900 text-ink-100">
                {s.name}
                {s.enabled ? "" : " — coming soon"}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="flex items-center gap-2 shrink-0">
        <button
          onClick={() => setShowAllStates(!showAllStates)}
          className={`text-[12px] font-semibold px-3 py-1.5 rounded-md border transition-all ${
            showAllStates
              ? "border-emerald-400/60 bg-emerald-400/15 text-emerald-300"
              : "border-base-600 text-ink-200 hover:bg-base-800 hover:text-ink-100"
          }`}
          title="Display infrastructure data for every implemented state at once"
        >
          {showAllStates ? `Showing All (${implementedStates.length})` : `Show All (${implementedStates.length})`}
        </button>
        {comparisonIds.length >= 2 && (
          <button
            onClick={() => setComparisonOpen(!comparisonOpen)}
            className="text-[12px] font-medium px-3 py-1.5 rounded-md border border-base-600 text-ink-100 hover:bg-base-800 transition-colors"
          >
            Compare Sites ({comparisonIds.length})
          </button>
        )}
        <button
          onClick={() => setProposeMode(!proposeMode)}
          disabled={!showAllStates && !activeState?.enabled}
          className={`text-[12.5px] font-semibold px-4 py-1.5 rounded-md transition-all disabled:opacity-40 disabled:cursor-not-allowed ${
            proposeMode
              ? "bg-accent-proposed text-white shadow-[0_0_0_3px_rgba(255,84,112,0.25)]"
              : "bg-ink-100 text-base-950 hover:brightness-95"
          }`}
        >
          {proposeMode ? "Click the map to place site…" : "+ Propose Data Center"}
        </button>
      </div>
    </div>
  );
}
