import type { StateDefinition } from "@/lib/types";
import { AL_LAYERS } from "./layers";

// Bounds/center match the real Census-derived entry in src/states/directory.ts (id "al").
export const ALABAMA: StateDefinition = {
  id: "alabama",
  name: "Alabama",
  abbreviation: "AL",
  bounds: [
    [-88.475, 30.223],
    [-84.892, 35.008],
  ],
  center: [-86.684, 32.615],
  defaultZoom: 6.6,
  layers: AL_LAYERS,
  enabled: true,
};

export * from "./layers";
export * from "./sources";
