import type { StateDefinition } from "@/lib/types";
import { NE_LAYERS } from "./layers";

// Bounds/center match the real Census-derived entry in src/states/directory.ts (id "ne").
export const NEBRASKA: StateDefinition = {
  id: "nebraska",
  name: "Nebraska",
  abbreviation: "NE",
  bounds: [
    [-104.052, 40],
    [-95.309, 43.001],
  ],
  center: [-99.68, 41.501],
  defaultZoom: 6.5,
  layers: NE_LAYERS,
  enabled: true,
};

export * from "./layers";
export * from "./sources";
