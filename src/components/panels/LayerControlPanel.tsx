"use client";

import { useState } from "react";
import DraggablePanel from "@/components/ui/DraggablePanel";
import ConfidenceBadge from "@/components/ui/ConfidenceBadge";
import { useAppStore } from "@/store/useAppStore";
import { getState, getEnabledStates, DEFAULT_STATE_ID } from "@/states/registry";
import type { LayerCategory } from "@/lib/types";

const CATEGORY_META: Record<LayerCategory, { label: string; color: string }> = {
  power: { label: "Power", color: "#f2b93b" },
  water: { label: "Water", color: "#3ba9f2" },
  connectivity: { label: "Connectivity", color: "#9b6ef2" },
  environment: { label: "Environment", color: "#3bf2a0" },
  community: { label: "Community", color: "#f2703b" },
  existing_infrastructure: { label: "Existing Infrastructure", color: "#8fa3bf" },
};

const CATEGORY_ORDER: LayerCategory[] = [
  "power",
  "water",
  "connectivity",
  "environment",
  "community",
  "existing_infrastructure",
];

function Swatch({ color, kind }: { color: string; kind: "line" | "fill" | "circle" }) {
  if (kind === "circle") return <span className="inline-block h-2 w-2 rounded-full shrink-0" style={{ background: color }} />;
  if (kind === "line") return <span className="inline-block h-[2px] w-3 shrink-0" style={{ background: color }} />;
  return <span className="inline-block h-2 w-3 rounded-[2px] shrink-0" style={{ background: color, opacity: 0.6 }} />;
}

function Toggle({ checked, onChange }: { checked: boolean; onChange: () => void }) {
  return (
    <button
      role="switch"
      aria-checked={checked}
      onClick={onChange}
      className={`relative h-4.5 w-8 shrink-0 rounded-full transition-colors ${
        checked ? "bg-emerald-500/70" : "bg-base-700"
      }`}
      style={{ height: 18 }}
    >
      <span
        className="absolute top-0.5 h-3.5 w-3.5 rounded-full bg-white transition-transform"
        style={{ left: 2, transform: checked ? "translateX(14px)" : "translateX(0)" }}
      />
    </button>
  );
}

export default function LayerControlPanel({ collapsed, onToggleCollapse }: { collapsed: boolean; onToggleCollapse: () => void }) {
  const layerVisibility = useAppStore((s) => s.layerVisibility);
  const toggleLayer = useAppStore((s) => s.toggleLayer);
  const activeStateId = useAppStore((s) => s.activeStateId);
  const showAllStates = useAppStore((s) => s.showAllStates);
  const activeLayers = showAllStates
    ? Array.from(
        new Map(
          getEnabledStates()
            .flatMap((state) => state.layers)
            .map((layer) => [layer.id, layer] as const)
        ).values()
      )
    : getState(activeStateId)?.layers ?? getState(DEFAULT_STATE_ID)!.layers;
  const [openCategories, setOpenCategories] = useState<Set<LayerCategory>>(new Set(["power", "water", "environment"]));

  function toggleCategory(cat: LayerCategory) {
    setOpenCategories((prev) => {
      const next = new Set(prev);
      if (next.has(cat)) next.delete(cat);
      else next.add(cat);
      return next;
    });
  }

  return (
    <DraggablePanel
      title="Infrastructure Layers"
      defaultPosition={{ x: 16, y: 84 }}
      width={288}
      collapsed={collapsed}
      onToggleCollapse={onToggleCollapse}
      headerAccent="#8fa3bf"
    >
      <div className="px-3 py-2">
        {CATEGORY_ORDER.map((cat) => {
          const layers = activeLayers.filter((l) => l.category === cat);
          if (layers.length === 0) return null;
          const meta = CATEGORY_META[cat];
          const isOpen = openCategories.has(cat);
          const activeCount = layers.filter((l) => layerVisibility[l.id]).length;

          return (
            <div key={cat} className="mb-1">
              <button
                onClick={() => toggleCategory(cat)}
                className="w-full flex items-center justify-between py-1.5 group"
              >
                <div className="flex items-center gap-2">
                  <span className="h-1.5 w-1.5 rounded-full" style={{ background: meta.color }} />
                  <span className="text-[11px] font-semibold tracking-[0.07em] uppercase text-ink-300 group-hover:text-ink-100">
                    {meta.label}
                  </span>
                  {activeCount > 0 && (
                    <span className="text-[9.5px] text-ink-500 font-mono">{activeCount}</span>
                  )}
                </div>
                <span className="text-ink-500 text-[10px]">{isOpen ? "▾" : "▸"}</span>
              </button>
              {isOpen && (
                <div className="pl-3.5 pb-1.5 space-y-0.5">
                  {layers.map((layer) => (
                    <div key={layer.id} className="flex items-center justify-between gap-2 py-1.5">
                      <div className="flex items-center gap-2 min-w-0">
                        <Swatch color={layer.color ?? meta.color} kind={layer.legend?.[0]?.swatch ?? "circle"} />
                        <div className="min-w-0">
                          <div className="text-[11.5px] text-ink-100 truncate">{layer.shortName ?? layer.name}</div>
                        </div>
                        <ConfidenceBadge confidence={layer.confidence} />
                      </div>
                      <Toggle checked={Boolean(layerVisibility[layer.id])} onChange={() => toggleLayer(layer.id)} />
                    </div>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </DraggablePanel>
  );
}
