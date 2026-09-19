"use client";

import { useAppStore } from "@/store/useAppStore";
import { WASHINGTON } from "@/states/washington";

export default function TopBar() {
  const proposeMode = useAppStore((s) => s.proposeMode);
  const setProposeMode = useAppStore((s) => s.setProposeMode);
  const comparisonIds = useAppStore((s) => s.comparisonIds);
  const setComparisonOpen = useAppStore((s) => s.setComparisonOpen);
  const comparisonOpen = useAppStore((s) => s.comparisonOpen);

  return (
    <div className="absolute top-0 left-0 right-0 z-30 flex items-center justify-between gap-4 px-4 h-14 glass-panel border-b border-base-700">
      <div className="flex items-center gap-3 min-w-0">
        <div className="flex items-center gap-2">
          <div className="h-7 w-7 rounded-md bg-gradient-to-br from-accent-power to-accent-proposed flex items-center justify-center text-[13px] font-bold text-base-950">
            G
          </div>
          <div className="leading-tight">
            <div className="text-[13px] font-semibold text-ink-100 tracking-tight">Grid &amp; Ground</div>
            <div className="text-[9.5px] text-ink-500 tracking-wide -mt-0.5">Data Center Siting Intelligence</div>
          </div>
        </div>
        <div className="hidden sm:flex items-center gap-1.5 ml-3 pl-3 border-l border-base-700 text-[11px] text-ink-300">
          <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
          {WASHINGTON.name}
          <span className="text-ink-700">·</span>
          <span className="text-ink-500">More states coming soon</span>
        </div>
      </div>

      <div className="flex items-center gap-2 shrink-0">
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
          className={`text-[12.5px] font-semibold px-4 py-1.5 rounded-md transition-all ${
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
