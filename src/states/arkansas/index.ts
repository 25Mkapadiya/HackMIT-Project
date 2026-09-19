import type { StateDefinition } from "@/lib/types";
import { AR_LAYERS } from "./layers";

// Bounds/center match the real Census-derived entry in src/states/directory.ts (id "ar").
export const ARKANSAS: StateDefinition = {
  id: "arkansas",
  name: "Arkansas",
  abbreviation: "AR",
  bounds: [
    [-94.619, 33.004],
    [-89.655, 36.5],
  ],
  center: [-92.137, 34.752],
  defaultZoom: 6.6,
  layers: AR_LAYERS,
  enabled: true,
};

export * from "./layers";
export * from "./sources";
