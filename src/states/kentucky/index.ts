import type { StateDefinition } from "@/lib/types";
import { KY_LAYERS } from "./layers";

// Bounds/center match the real Census-derived entry in src/states/directory.ts (id "ky").
export const KENTUCKY: StateDefinition = {
  id: "kentucky",
  name: "Kentucky",
  abbreviation: "KY",
  bounds: [
    [-89.573, 36.497],
    [-81.967, 39.146],
  ],
  center: [-85.77, 37.822],
  defaultZoom: 6.6,
  layers: KY_LAYERS,
  enabled: true,
};

export * from "./layers";
export * from "./sources";
