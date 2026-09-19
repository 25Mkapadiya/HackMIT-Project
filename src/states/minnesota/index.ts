import type { StateDefinition } from "@/lib/types";
import { MN_LAYERS } from "./layers";

// Bounds/center match the real Census-derived entry in src/states/directory.ts
// (id "mn") — duplicated here as literals (like WASHINGTON/OKLAHOMA do) so this
// file has no import-order dependency on the generated directory.
export const MINNESOTA: StateDefinition = {
  id: "minnesota",
  name: "Minnesota",
  abbreviation: "MN",
  bounds: [
    [-97.24, 43.499],
    [-89.49, 49.385],
  ],
  center: [-93.365, 46.442],
  defaultZoom: 6,
  layers: MN_LAYERS,
  enabled: true,
};

export * from "./layers";
export * from "./sources";
