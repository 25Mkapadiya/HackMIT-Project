import type { StateDefinition } from "@/lib/types";
import { FL_LAYERS } from "./layers";

// Bounds/center match the real Census-derived entry in src/states/directory.ts (id "fl").
export const FLORIDA: StateDefinition = {
  id: "florida",
  name: "Florida",
  abbreviation: "FL",
  bounds: [
    [-87.635, 24.515],
    [-80.033, 31.001],
  ],
  center: [-83.834, 27.758],
  defaultZoom: 6.2,
  layers: FL_LAYERS,
  enabled: true,
};

export * from "./layers";
export * from "./sources";
