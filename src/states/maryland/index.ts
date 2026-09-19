import type { StateDefinition } from "@/lib/types";
import { MD_LAYERS } from "./layers";

// Bounds/center match the real Census-derived entry in src/states/directory.ts (id "md").
export const MARYLAND: StateDefinition = {
  id: "maryland",
  name: "Maryland",
  abbreviation: "MD",
  bounds: [
    [-79.487, 37.917],
    [-75.051, 39.723],
  ],
  center: [-77.269, 38.82],
  defaultZoom: 6.9,
  layers: MD_LAYERS,
  enabled: true,
};

export * from "./layers";
export * from "./sources";
