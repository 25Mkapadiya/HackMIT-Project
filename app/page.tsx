"use client";

import { useState } from "react";
import dynamic from "next/dynamic";
import TopBar from "@/components/panels/TopBar";
import LayerControlPanel from "@/components/panels/LayerControlPanel";
import ScenarioPanel from "@/components/panels/ScenarioPanel";
import Legend from "@/components/panels/Legend";
import ComparisonPanel from "@/components/panels/ComparisonPanel";

const MapView = dynamic(() => import("@/components/map/MapView"), {
  ssr: false,
  loading: () => (
    <div className="absolute inset-0 flex items-center justify-center bg-base-950">
      <div className="text-ink-500 text-[13px] tracking-wide animate-pulse">Loading map…</div>
    </div>
  ),
});

export default function Home() {
  const [layersCollapsed, setLayersCollapsed] = useState(false);
  const [scenarioCollapsed, setScenarioCollapsed] = useState(false);

  return (
    <main className="relative h-dvh w-dvw overflow-hidden bg-base-950">
      <MapView />
      <TopBar />
      <LayerControlPanel collapsed={layersCollapsed} onToggleCollapse={() => setLayersCollapsed((c) => !c)} />
      <ScenarioPanel collapsed={scenarioCollapsed} onToggleCollapse={() => setScenarioCollapsed((c) => !c)} />
      <Legend />
      <ComparisonPanel />
    </main>
  );
}
