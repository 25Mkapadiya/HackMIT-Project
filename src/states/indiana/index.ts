import type { StateDefinition } from "@/lib/types";
import { IN_LAYERS } from "./layers";

// Bounds/center match the real Census-derived entry in src/states/directory.ts (id "in").
export const INDIANA: StateDefinition = {
  id: "indiana",
  name: "Indiana",
  abbreviation: "IN",
  bounds: [
    [-88.098, 37.772],
    [-84.785, 41.761],
  ],
  center: [-86.441, 39.766],
  defaultZoom: 6.6,
  layers: IN_LAYERS,
  enabled: true,
};

export * from "./layers";
export * from "./sources";
