import type { StateDefinition } from "@/lib/types";
import { ME_LAYERS } from "./layers";

// Bounds/center match the real Census-derived entry in src/states/directory.ts (id "me").
export const MAINE: StateDefinition = {
  id: "maine",
  name: "Maine",
  abbreviation: "ME",
  bounds: [
    [-71.084, 43.059],
    [-66.982, 47.46],
  ],
  center: [-69.033, 45.259],
  defaultZoom: 6.5,
  layers: ME_LAYERS,
  enabled: true,
};

export * from "./layers";
export * from "./sources";
