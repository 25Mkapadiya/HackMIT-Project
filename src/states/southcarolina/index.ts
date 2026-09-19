import type { StateDefinition } from "@/lib/types";
import { SC_LAYERS } from "./layers";

// Bounds/center match the real Census-derived entry in src/states/directory.ts (id "sc").
export const SOUTH_CAROLINA: StateDefinition = {
  id: "southcarolina",
  name: "South Carolina",
  abbreviation: "SC",
  bounds: [
    [-83.349, 32.034],
    [-78.539, 35.215],
  ],
  center: [-80.944, 33.625],
  defaultZoom: 6.8,
  layers: SC_LAYERS,
  enabled: true,
};

export * from "./layers";
export * from "./sources";
