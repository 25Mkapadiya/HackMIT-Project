import type { StateDefinition } from "@/lib/types";
import { DE_LAYERS } from "./layers";

// Bounds/center match the real Census-derived entry in src/states/directory.ts (id "de").
export const DELAWARE: StateDefinition = {
  id: "delaware",
  name: "Delaware",
  abbreviation: "DE",
  bounds: [
    [-75.79, 38.451],
    [-75.051, 39.839],
  ],
  center: [-75.42, 39.145],
  defaultZoom: 7.8,
  layers: DE_LAYERS,
  enabled: true,
};

export * from "./layers";
export * from "./sources";
