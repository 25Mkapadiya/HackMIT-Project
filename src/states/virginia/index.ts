import type { StateDefinition } from "@/lib/types";
import { VA_LAYERS } from "./layers";

// Bounds/center match the real Census-derived entry in src/states/directory.ts (id "va").
export const VIRGINIA: StateDefinition = {
  id: "virginia",
  name: "Virginia",
  abbreviation: "VA",
  bounds: [
    [-83.676, 36.541],
    [-75.241, 39.466],
  ],
  center: [-79.458, 38.003],
  defaultZoom: 6.5,
  layers: VA_LAYERS,
  enabled: true,
};

export * from "./layers";
export * from "./sources";
