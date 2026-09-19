import type { StateDefinition } from "@/lib/types";
import { CO_LAYERS } from "./layers";

// Bounds/center match the real Census-derived entry in src/states/directory.ts (id "co").
export const COLORADO: StateDefinition = {
  id: "colorado",
  name: "Colorado",
  abbreviation: "CO",
  bounds: [
    [-109.059, 36.993],
    [-102.042, 41.002],
  ],
  center: [-105.551, 38.997],
  defaultZoom: 6.2,
  layers: CO_LAYERS,
  enabled: true,
};

export * from "./layers";
export * from "./sources";
