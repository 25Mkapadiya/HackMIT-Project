import type { StateDefinition } from "@/lib/types";
import { MI_LAYERS } from "./layers";

// Bounds/center match the real Census-derived entry in src/states/directory.ts (id "mi").
export const MICHIGAN: StateDefinition = {
  id: "michigan",
  name: "Michigan",
  abbreviation: "MI",
  bounds: [
    [-90.416, 41.696],
    [-82.416, 48.191],
  ],
  center: [-86.416, 44.943],
  defaultZoom: 6.0,
  layers: MI_LAYERS,
  enabled: true,
};

export * from "./layers";
export * from "./sources";
