"use client";

import { useEffect, useMemo, useRef, useState } from "react";
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
  const [stateQuery, setStateQuery] = useState("");
  const [stateSearchOpen, setStateSearchOpen] = useState(false);
  const stateSearchRef = useRef<HTMLDivElement>(null);

  const activeState = getState(activeStateId);
  const implementedStates = getEnabledStates();
  const subtitle = showAllStates
    ? `Showing all ${implementedStates.length} implemented states`
    : activeState?.enabled
      ? "Data Center Siting Intelligence"
      : `${activeState?.name ?? "Selected state"} — coming soon, showing Washington's live analysis`;

  const filteredStates = useMemo(() => {
    const query = stateQuery.trim().toLowerCase();
    if (!query) return STATE_REGISTRY;

    return STATE_REGISTRY.filter((state) => {
      const stateName = state.name.toLowerCase();
      const stateId = state.id.toLowerCase();
      return stateName.includes(query) || stateId.includes(query);
    });
  }, [stateQuery]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (stateSearchRef.current && !stateSearchRef.current.contains(event.target as Node)) {
        setStateSearchOpen(false);
        setStateQuery("");
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const chooseState = (stateId: string) => {
    setActiveStateId(stateId);
    setStateQuery("");
    setStateSearchOpen(false);
  };

  return (
    <div className="absolute top-0 left-0 right-0 z-30 flex items-center justify-between gap-4 px-4 h-14 glass-panel border-b border-base-700">
      <div className="flex items-center gap-3 min-w-0">
        <div className="flex items-center gap-2">
          <div className="h-7 w-7 rounded-md bg-gradient-to-br from-accent-power to-accent-proposed flex items-center justify-center text-[13px] font-bold text-base-950">
            G
          </div>
          <div className="leading-tight">
            <div className="text-[13px] font-semibold text-ink-100 tracking-tight">GEO: Graphical Energy Outcomes</div>
            <div className="text-[9.5px] text-ink-500 tracking-wide -mt-0.5 truncate max-w-[240px]">{subtitle}</div>
          </div>
        </div>

        <div
          ref={stateSearchRef}
          className="relative hidden sm:block ml-3 pl-3 border-l border-base-700"
        >
          <div
            className={`flex items-center gap-2 h-8 w-[210px] rounded-md border px-2.5 transition-colors ${
              stateSearchOpen
                ? "border-base-500 bg-base-900"
                : "border-base-700 bg-base-900/70 hover:border-base-600"
            }`}
          >
            <svg
              viewBox="0 0 24 24"
              aria-hidden="true"
              className="h-3.5 w-3.5 shrink-0 text-ink-500"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <circle cx="11" cy="11" r="7" />
              <path d="m20 20-3.5-3.5" />
            </svg>
            <input
              value={stateSearchOpen ? stateQuery : ""}
              onFocus={() => setStateSearchOpen(true)}
              onChange={(e) => {
                setStateQuery(e.target.value);
                setStateSearchOpen(true);
              }}
              onKeyDown={(e) => {
                if (e.key === "Enter" && filteredStates.length > 0) {
                  e.preventDefault();
                  chooseState(filteredStates[0]!.id);
                } else if (e.key === "Escape") {
                  setStateSearchOpen(false);
                  setStateQuery("");
                  e.currentTarget.blur();
                }
              }}
              placeholder={activeState?.name ?? "Search states"}
              aria-label="Search by state"
              aria-expanded={stateSearchOpen}
              className="min-w-0 flex-1 bg-transparent text-[11px] text-ink-100 placeholder:text-ink-300 focus:outline-none"
            />
            <span
              className={`h-1.5 w-1.5 shrink-0 rounded-full ${
                showAllStates || activeState?.enabled ? "bg-emerald-400" : "bg-amber-400"
              }`}
              title={activeState?.enabled ? "State data available" : "State data coming soon"}
            />
          </div>

          {stateSearchOpen && (
            <div className="absolute left-3 top-[38px] w-[210px] max-h-72 overflow-y-auto rounded-md border border-base-700 bg-base-900 shadow-2xl">
              {filteredStates.length > 0 ? (
                filteredStates.map((state) => (
                  <button
                    key={state.id}
                    type="button"
                    onMouseDown={(e) => e.preventDefault()}
                    onClick={() => chooseState(state.id)}
                    className={`flex w-full items-center justify-between gap-3 px-3 py-2 text-left text-[11px] transition-colors hover:bg-base-800 ${
                      state.id === activeStateId ? "bg-base-800 text-ink-100" : "text-ink-300"
                    }`}
                  >
                    <span className="truncate">{state.name}</span>
                    <span
                      className={`shrink-0 text-[9px] ${
                        state.enabled ? "text-emerald-400" : "text-ink-600"
                      }`}
                    >
                      {state.enabled ? "Live" : "Coming soon"}
                    </span>
                  </button>
                ))
              ) : (
                <div className="px-3 py-3 text-[11px] text-ink-500">
                  No states match “{stateQuery}”
                </div>
              )}
            </div>
          )}
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
