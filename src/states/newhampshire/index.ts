import type { StateDefinition } from "@/lib/types";
import { NH_LAYERS } from "./layers";

// Bounds/center match the real Census-derived entry in src/states/directory.ts (id "nh").
export const NEW_HAMPSHIRE: StateDefinition = {
  id: "newhampshire",
  name: "New Hampshire",
  abbreviation: "NH",
  bounds: [
    [-72.556, 42.697],
    [-70.704, 45.306],
  ],
  center: [-71.63, 44.001],
  defaultZoom: 7.0,
  layers: NH_LAYERS,
  enabled: true,
};

export * from "./layers";
export * from "./sources";
