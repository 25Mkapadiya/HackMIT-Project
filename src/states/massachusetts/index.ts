import type { StateDefinition } from "@/lib/types";
import { MA_LAYERS } from "./layers";

// Bounds/center match the real Census-derived entry in src/states/directory.ts (id "ma").
export const MASSACHUSETTS: StateDefinition = {
  id: "massachusetts",
  name: "Massachusetts",
  abbreviation: "MA",
  bounds: [
    [-73.507, 41.239],
    [-69.929, 42.887],
  ],
  center: [-71.718, 42.063],
  defaultZoom: 7.0,
  layers: MA_LAYERS,
  enabled: true,
};

export * from "./layers";
export * from "./sources";
