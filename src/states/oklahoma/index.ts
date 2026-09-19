import type { StateDefinition } from "@/lib/types";
import { OK_LAYERS } from "./layers";

// Bounds/center match the real Census-derived entry in src/states/directory.ts
// (id "ok") — duplicated here as literals (like WASHINGTON does) so this file
// has no import-order dependency on the generated directory.
export const OKLAHOMA: StateDefinition = {
  id: "oklahoma",
  name: "Oklahoma",
  abbreviation: "OK",
  bounds: [
    [-103.004, 33.617],
    [-94.433, 37.002],
  ],
  center: [-98.718, 35.309],
  defaultZoom: 6.4,
  layers: OK_LAYERS,
  enabled: true,
};

export * from "./layers";
export * from "./sources";
