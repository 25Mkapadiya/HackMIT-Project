import type { StateDefinition } from "@/lib/types";
import { RI_LAYERS } from "./layers";

// Bounds/center match the real Census-derived entry in src/states/directory.ts (id "ri").
export const RHODE_ISLAND: StateDefinition = {
  id: "rhodeisland",
  name: "Rhode Island",
  abbreviation: "RI",
  bounds: [
    [-71.86, 41.151],
    [-71.12, 42.019],
  ],
  center: [-71.49, 41.585],
  defaultZoom: 8.0,
  layers: RI_LAYERS,
  enabled: true,
};

export * from "./layers";
export * from "./sources";
