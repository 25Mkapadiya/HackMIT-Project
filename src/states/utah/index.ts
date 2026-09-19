import type { StateDefinition } from "@/lib/types";
import { UT_LAYERS } from "./layers";

// Bounds/center match the real Census-derived entry in src/states/directory.ts (id "ut").
export const UTAH: StateDefinition = {
  id: "utah",
  name: "Utah",
  abbreviation: "UT",
  bounds: [
    [-114.052, 36.998],
    [-109.041, 42.002],
  ],
  center: [-111.547, 39.5],
  defaultZoom: 6.0,
  layers: UT_LAYERS,
  enabled: true,
};

export * from "./layers";
export * from "./sources";
