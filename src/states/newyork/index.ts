import type { StateDefinition } from "@/lib/types";
import { NY_LAYERS } from "./layers";

// Bounds/center match the real Census-derived entry in src/states/directory.ts (id "ny").
export const NEW_YORK: StateDefinition = {
  id: "newyork",
  name: "New York",
  abbreviation: "NY",
  bounds: [
    [-79.763, 40.502],
    [-71.856, 45.016],
  ],
  center: [-75.81, 42.759],
  defaultZoom: 6.0,
  layers: NY_LAYERS,
  enabled: true,
};

export * from "./layers";
export * from "./sources";
