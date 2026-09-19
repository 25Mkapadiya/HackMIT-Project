import type { StateDefinition } from "@/lib/types";
import { WI_LAYERS } from "./layers";

// Bounds/center match the real Census-derived entry in src/states/directory.ts (id "wi").
export const WISCONSIN: StateDefinition = {
  id: "wisconsin",
  name: "Wisconsin",
  abbreviation: "WI",
  bounds: [
    [-92.889, 42.492],
    [-86.824, 47.077],
  ],
  center: [-89.856, 44.784],
  defaultZoom: 6.3,
  layers: WI_LAYERS,
  enabled: true,
};

export * from "./layers";
export * from "./sources";
