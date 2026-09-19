import type { StateDefinition } from "@/lib/types";
import { OH_LAYERS } from "./layers";

// Bounds/center match the real Census-derived entry in src/states/directory.ts (id "oh").
export const OHIO: StateDefinition = {
  id: "ohio",
  name: "Ohio",
  abbreviation: "OH",
  bounds: [
    [-84.821, 38.405],
    [-80.521, 41.978],
  ],
  center: [-82.671, 40.191],
  defaultZoom: 6.7,
  layers: OH_LAYERS,
  enabled: true,
};

export * from "./layers";
export * from "./sources";
