import type { StateDefinition } from "@/lib/types";
import { KS_LAYERS } from "./layers";

// Bounds/center match the real Census-derived entry in src/states/directory.ts (id "ks").
export const KANSAS: StateDefinition = {
  id: "kansas",
  name: "Kansas",
  abbreviation: "KS",
  bounds: [
    [-102.053, 36.993],
    [-94.591, 40.003],
  ],
  center: [-98.322, 38.498],
  defaultZoom: 6.5,
  layers: KS_LAYERS,
  enabled: true,
};

export * from "./layers";
export * from "./sources";
