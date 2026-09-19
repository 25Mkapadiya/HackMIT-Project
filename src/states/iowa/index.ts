import type { StateDefinition } from "@/lib/types";
import { IA_LAYERS } from "./layers";

// Bounds/center match the real Census-derived entry in src/states/directory.ts (id "ia").
export const IOWA: StateDefinition = {
  id: "iowa",
  name: "Iowa",
  abbreviation: "IA",
  bounds: [
    [-96.633, 40.378],
    [-90.14, 43.5],
  ],
  center: [-93.387, 41.939],
  defaultZoom: 6.6,
  layers: IA_LAYERS,
  enabled: true,
};

export * from "./layers";
export * from "./sources";
