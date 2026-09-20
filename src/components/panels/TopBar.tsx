"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useAppStore } from "@/store/useAppStore";
import { STATE_REGISTRY, getState, getShowAllStates } from "@/states/registry";

export default function TopBar() {
  const proposeMode = useAppStore((s) => s.proposeMode);
  const setProposeMode = useAppStore((s) => s.setProposeMode);
  const scenarios = useAppStore((s) => s.scenarios);
  const comparisonIds = useAppStore((s) => s.comparisonIds);
  const setComparisonIds = useAppStore((s) => s.setComparisonIds);
  const setComparisonOpen = useAppStore((s) => s.setComparisonOpen);
  const graphOpen = useAppStore((s) => s.graphOpen);
  const setGraphOpen = useAppStore((s) => s.setGraphOpen);
  const activeStateId = useAppStore((s) => s.activeStateId);
  const setActiveStateId = useAppStore((s) => s.setActiveStateId);
  const showAllStates = useAppStore((s) => s.showAllStates);
  const setShowAllStates = useAppStore((s) => s.setShowAllStates);
  const [stateQuery, setStateQuery] = useState("");
  const [stateSearchOpen, setStateSearchOpen] = useState(false);
  const stateSearchRef = useRef<HTMLDivElement>(null);

  const activeState = getState(activeStateId);
  const implementedStates = getShowAllStates();
  const subtitle = showAllStates
    ? `Showing all ${implementedStates.length} implemented states`
    : activeState?.enabled
      ? ""
      : `${activeState?.name ?? "Selected state"} — coming soon, showing Washington's live analysis`;

  const sortedStates = useMemo(
    () => [...STATE_REGISTRY].sort((a, b) => a.name.localeCompare(b.name)),
    []
  );

  // With no query typed, the dropdown still opens (via the chevron or focus)
  // showing every state so it doubles as a scrollable "browse all 50" list.
  const filteredStates = useMemo(() => {
    const query = stateQuery.trim().toLowerCase();
    if (!query) return sortedStates;

    return sortedStates.filter((state) => {
      const stateName = state.name.toLowerCase();
      const stateId = state.id.toLowerCase();
      return stateName.includes(query) || stateId.includes(query);
    });
  }, [stateQuery, sortedStates]);

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

  const openComparison = () => {
    if (comparisonIds.length < 2) setComparisonIds(scenarios.map((s) => s.id));
    setComparisonOpen(true);
  };

  return (
    <div className="absolute top-0 left-0 right-0 z-30 grid grid-cols-[1fr_auto_1fr] items-center gap-4 px-4 h-14 glass-panel border-b border-base-700">
      <div className="flex items-center gap-3 min-w-0">
        <div className="flex items-center gap-2">
          <div className="shrink-0 rounded-md bg-white px-1.5 py-1">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/logo-full.png" alt="GEO: Graphical Energy Outcomes" className="h-6 w-auto block" />
          </div>
          {subtitle && (
            <div className="text-[9.5px] text-ink-500 tracking-wide truncate max-w-[220px]">{subtitle}</div>
          )}
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
              placeholder="Search states..."
              aria-label="Search by state"
              className="min-w-0 flex-1 bg-transparent text-[11px] text-ink-100 placeholder:text-ink-300 focus:outline-none"
            />
            <span
              className={`h-1.5 w-1.5 shrink-0 rounded-full ${
                showAllStates || activeState?.enabled ? "bg-emerald-400" : "bg-amber-400"
              }`}
              title={activeState?.enabled ? "State data available" : "State data coming soon"}
            />
            <button
              type="button"
              onMouseDown={(e) => e.preventDefault()}
              onClick={() => setStateSearchOpen((open) => !open)}
              aria-label="Browse all states"
              aria-expanded={stateSearchOpen}
              className="shrink-0 text-ink-300 hover:text-ink-100 transition-colors p-0.5 -mr-0.5 rounded hover:bg-base-800"
            >
              <svg
                viewBox="0 0 24 24"
                aria-hidden="true"
                className={`h-4 w-4 transition-transform ${stateSearchOpen ? "rotate-180" : ""}`}
                fill="none"
                stroke="currentColor"
                strokeWidth="3"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="m6 9 6 6 6-6" />
              </svg>
            </button>
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

      <div className="justify-self-center flex items-center gap-2">
        <button
          onClick={() => setProposeMode(!proposeMode)}
          disabled={!showAllStates && !activeState?.enabled}
          className={`text-[14px] font-semibold px-6 py-2.5 rounded-md transition-all disabled:opacity-40 disabled:cursor-not-allowed ${
            proposeMode
              ? "bg-accent-proposed text-white shadow-[0_0_0_3px_rgba(255,84,112,0.25)]"
              : "bg-ink-100 text-base-950 hover:brightness-95"
          }`}
        >
          {proposeMode ? "Click the map to place site…" : "+ Propose Data Center"}
        </button>
        <button
          onClick={() => setGraphOpen(!graphOpen)}
          className={`text-[14px] font-semibold px-4 py-2.5 rounded-md border transition-all ${
            graphOpen
              ? "border-accent-power/60 bg-accent-power/15 text-accent-power"
              : "border-base-600 text-ink-200 hover:bg-base-800 hover:text-ink-100"
          }`}
          title="Graph one EU data-centre variable against another"
        >
          Graph Data
        </button>
      </div>

      <div className="flex items-center justify-end gap-2 shrink-0">
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
        <button
          onClick={openComparison}
          disabled={scenarios.length < 2}
          title={
            scenarios.length < 2
              ? "Propose 2+ sites to compare placements"
              : "Compare proposed sites side by side to judge the best placement"
          }
          className="text-[12px] font-medium px-3 py-1.5 rounded-md border border-base-600 text-ink-100 hover:bg-base-800 transition-colors disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-transparent"
        >
          Compare Sites{scenarios.length >= 2 ? ` (${scenarios.length})` : ""}
        </button>
      </div>
    </div>
  );
}
