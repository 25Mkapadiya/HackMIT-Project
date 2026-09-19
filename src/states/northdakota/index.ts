import type { StateDefinition } from "@/lib/types";
import { ND_LAYERS } from "./layers";

// Bounds/center match the real Census-derived entry in src/states/directory.ts (id "nd").
export const NORTH_DAKOTA: StateDefinition = {
  id: "northdakota",
  name: "North Dakota",
  abbreviation: "ND",
  bounds: [
    [-104.049, 45.935],
    [-96.558, 49.001],
  ],
  center: [-100.303, 47.468],
  defaultZoom: 6.6,
  layers: ND_LAYERS,
  enabled: true,
};

export * from "./layers";
export * from "./sources";
