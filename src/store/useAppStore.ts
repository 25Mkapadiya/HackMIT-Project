import { create } from "zustand";
import type { CoolingMedium, CoolingTechnology, LoopType, ScenarioAnalysis, ScenarioConfig } from "@/lib/types";
import { WASHINGTON } from "@/states/washington";

type AnalysisState =
  | { status: "idle" }
  | { status: "loading" }
  | { status: "error"; message: string }
  | { status: "ready"; data: ScenarioAnalysis };

interface AppState {
  // layers
  layerVisibility: Record<string, boolean>;
  toggleLayer: (id: string) => void;

  // propose-mode
  proposeMode: boolean;
  setProposeMode: (v: boolean) => void;

  // scenarios
  scenarios: ScenarioConfig[];
  activeScenarioId: string | null;
  analysisByScenario: Record<string, AnalysisState>;
  addScenario: (lng: number, lat: number) => string;
  updateScenario: (id: string, patch: Partial<ScenarioConfig>) => void;
  removeScenario: (id: string) => void;
  setActiveScenario: (id: string | null) => void;
  runAnalysis: (id: string) => Promise<void>;

  // comparison
  comparisonIds: string[];
  toggleComparisonId: (id: string) => void;
  comparisonOpen: boolean;
  setComparisonOpen: (v: boolean) => void;
}

let scenarioCounter = 0;
function nextScenarioId() {
  scenarioCounter += 1;
  return `site-${scenarioCounter}`;
}

const SITE_LABELS = ["Site A", "Site B", "Site C", "Site D", "Site E", "Site F"];

export const DEFAULT_SCENARIO_DEFAULTS: Omit<ScenarioConfig, "id" | "label" | "lng" | "lat" | "createdAt"> = {
  mwLoad: 100,
  buildings: 3,
  coolingTechnology: "cooling_tower_evaporative" as CoolingTechnology,
  loopType: "closed_loop" as LoopType,
  coolingMedium: "water_cooled" as CoolingMedium,
  redundancy: "N+1",
};

export const useAppStore = create<AppState>((set, get) => ({
  layerVisibility: Object.fromEntries(WASHINGTON.layers.map((l) => [l.id, Boolean(l.defaultVisible)])),
  toggleLayer: (id) =>
    set((s) => ({ layerVisibility: { ...s.layerVisibility, [id]: !s.layerVisibility[id] } })),

  proposeMode: false,
  setProposeMode: (v) => set({ proposeMode: v }),

  scenarios: [],
  activeScenarioId: null,
  analysisByScenario: {},

  addScenario: (lng, lat) => {
    const id = nextScenarioId();
    const idx = get().scenarios.length % SITE_LABELS.length;
    const scenario: ScenarioConfig = {
      id,
      label: SITE_LABELS[idx] ?? `Site ${idx + 1}`,
      lng,
      lat,
      createdAt: new Date().toISOString(),
      ...DEFAULT_SCENARIO_DEFAULTS,
    };
    set((s) => ({
      scenarios: [...s.scenarios, scenario],
      activeScenarioId: id,
      proposeMode: false,
    }));
    return id;
  },

  updateScenario: (id, patch) =>
    set((s) => ({
      scenarios: s.scenarios.map((sc) => (sc.id === id ? { ...sc, ...patch } : sc)),
    })),

  removeScenario: (id) =>
    set((s) => {
      const { [id]: _removed, ...rest } = s.analysisByScenario;
      return {
        scenarios: s.scenarios.filter((sc) => sc.id !== id),
        activeScenarioId: s.activeScenarioId === id ? null : s.activeScenarioId,
        analysisByScenario: rest,
        comparisonIds: s.comparisonIds.filter((cid) => cid !== id),
      };
    }),

  setActiveScenario: (id) => set({ activeScenarioId: id }),

  runAnalysis: async (id) => {
    const scenario = get().scenarios.find((s) => s.id === id);
    if (!scenario) return;
    set((s) => ({ analysisByScenario: { ...s.analysisByScenario, [id]: { status: "loading" } } }));
    try {
      const res = await fetch("/api/analysis", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(scenario),
      });
      if (!res.ok) throw new Error(`Analysis request failed (${res.status})`);
      const data = (await res.json()) as ScenarioAnalysis;
      set((s) => ({ analysisByScenario: { ...s.analysisByScenario, [id]: { status: "ready", data } } }));
    } catch (err) {
      set((s) => ({
        analysisByScenario: {
          ...s.analysisByScenario,
          [id]: { status: "error", message: err instanceof Error ? err.message : "Unknown error" },
        },
      }));
    }
  },

  comparisonIds: [],
  toggleComparisonId: (id) =>
    set((s) => ({
      comparisonIds: s.comparisonIds.includes(id)
        ? s.comparisonIds.filter((c) => c !== id)
        : [...s.comparisonIds, id],
    })),
  comparisonOpen: false,
  setComparisonOpen: (v) => set({ comparisonOpen: v }),
}));
