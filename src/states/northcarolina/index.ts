import type { StateDefinition } from "@/lib/types";
import { NC_LAYERS } from "./layers";

// Bounds/center match the real Census-derived entry in src/states/directory.ts (id "nc").
export const NORTH_CAROLINA: StateDefinition = {
  id: "northcarolina",
  name: "North Carolina",
  abbreviation: "NC",
  bounds: [
    [-84.322, 33.851],
    [-75.46, 36.588],
  ],
  center: [-79.891, 35.22],
  defaultZoom: 6.5,
  layers: NC_LAYERS,
  enabled: true,
};

export * from "./layers";
export * from "./sources";
