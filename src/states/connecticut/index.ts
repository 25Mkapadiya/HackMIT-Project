import type { StateDefinition } from "@/lib/types";
import { CT_LAYERS } from "./layers";

// Bounds/center match the real Census-derived entry in src/states/directory.ts (id "ct").
export const CONNECTICUT: StateDefinition = {
  id: "connecticut",
  name: "Connecticut",
  abbreviation: "CT",
  bounds: [
    [-73.726, 40.985],
    [-71.788, 42.051],
  ],
  center: [-72.757, 41.518],
  defaultZoom: 7.5,
  layers: CT_LAYERS,
  enabled: true,
};

export * from "./layers";
export * from "./sources";
