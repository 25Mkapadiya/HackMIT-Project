"use client";

import { useState } from "react";
import { useAppStore } from "@/store/useAppStore";
import { getState } from "@/states/registry";

function LegendSwatch({ color, kind, lineWidth }: { color: string; kind?: "line" | "fill" | "circle"; lineWidth?: number }) {
  if (kind === "circle")
    return <span className="inline-block h-2.5 w-2.5 rounded-full shrink-0" style={{ background: color }} />;
  if (kind === "fill")
    return <span className="inline-block h-2.5 w-4 rounded-[2px] shrink-0" style={{ background: color, opacity: 0.55 }} />;
  return (
    <span
      className="inline-block w-4 shrink-0 rounded-full"
      style={{ background: color, height: Math.max(2, (lineWidth ?? 2) * 0.8) }}
    />
  );
}

export default function Legend() {
  const layerVisibility = useAppStore((s) => s.layerVisibility);
  const activeStateId = useAppStore((s) => s.activeStateId);
  const [collapsed, setCollapsed] = useState(false);

  const stateLayers = getState(activeStateId)?.layers ?? [];
  const visibleLayers = stateLayers.filter((l) => layerVisibility[l.id] && l.legend?.length);
  if (visibleLayers.length === 0) return null;

  return (
    <div
      className="absolute left-4 z-10 glass-panel rounded-lg border border-base-700 shadow-panel px-3 py-2.5 max-w-[220px] animate-fade-in"
      style={{ bottom: 44 }}
    >
      <button
        onClick={() => setCollapsed((c) => !c)}
        className="w-full flex items-center justify-between text-[10px] font-semibold tracking-[0.08em] uppercase text-ink-500 mb-1.5"
      >
        Legend
        <span>{collapsed ? "▸" : "▾"}</span>
      </button>
      {!collapsed && (
        <div className="space-y-2 max-h-[38vh] overflow-y-auto no-scrollbar pr-1">
          {visibleLayers.map((l) => (
            <div key={l.id}>
              <div className="text-[10px] text-ink-300 font-medium mb-0.5">{l.shortName ?? l.name}</div>
              <div className="space-y-0.5">
                {l.legend!.map((entry, i) => (
                  <div key={i} className="flex items-center gap-1.5">
                    <LegendSwatch color={entry.color} kind={entry.swatch} lineWidth={entry.lineWidth} />
                    <span className="text-[10px] text-ink-500">{entry.label}</span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
