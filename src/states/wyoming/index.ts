import type { StateDefinition } from "@/lib/types";
import { WY_LAYERS } from "./layers";

// Bounds/center match the real Census-derived entry in src/states/directory.ts (id "wy").
export const WYOMING: StateDefinition = {
  id: "wyoming",
  name: "Wyoming",
  abbreviation: "WY",
  bounds: [
    [-111.058, 40.995],
    [-104.052, 45.006],
  ],
  center: [-107.555, 43.001],
  defaultZoom: 6.2,
  layers: WY_LAYERS,
  enabled: true,
};

export * from "./layers";
export * from "./sources";
