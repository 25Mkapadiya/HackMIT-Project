import type { StateDefinition } from "@/lib/types";
import { PA_LAYERS } from "./layers";

// Bounds/center match the real Census-derived entry in src/states/directory.ts (id "pa").
export const PENNSYLVANIA: StateDefinition = {
  id: "pennsylvania",
  name: "Pennsylvania",
  abbreviation: "PA",
  bounds: [
    [-80.521, 39.72],
    [-74.695, 42.27],
  ],
  center: [-77.608, 40.995],
  defaultZoom: 6.6,
  layers: PA_LAYERS,
  enabled: true,
};

export * from "./layers";
export * from "./sources";
