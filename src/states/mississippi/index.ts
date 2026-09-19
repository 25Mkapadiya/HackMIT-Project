import type { StateDefinition } from "@/lib/types";
import { MS_LAYERS } from "./layers";

// Bounds/center match the real Census-derived entry in src/states/directory.ts (id "ms").
export const MISSISSIPPI: StateDefinition = {
  id: "mississippi",
  name: "Mississippi",
  abbreviation: "MS",
  bounds: [
    [-91.644, 30.18],
    [-88.098, 34.995],
  ],
  center: [-89.871, 32.588],
  defaultZoom: 6.6,
  layers: MS_LAYERS,
  enabled: true,
};

export * from "./layers";
export * from "./sources";
