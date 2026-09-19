import type { StateDefinition } from "@/lib/types";
import { NV_LAYERS } from "./layers";

// Bounds/center match the real Census-derived entry in src/states/directory.ts (id "nv").
export const NEVADA: StateDefinition = {
  id: "nevada",
  name: "Nevada",
  abbreviation: "NV",
  bounds: [
    [-120.007, 35.001],
    [-114.041, 42.002],
  ],
  center: [-117.024, 38.502],
  defaultZoom: 5.9,
  layers: NV_LAYERS,
  enabled: true,
};

export * from "./layers";
export * from "./sources";
