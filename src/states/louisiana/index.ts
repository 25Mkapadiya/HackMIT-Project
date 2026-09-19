import type { StateDefinition } from "@/lib/types";
import { LA_LAYERS } from "./layers";

// Bounds/center match the real Census-derived entry in src/states/directory.ts (id "la").
export const LOUISIANA: StateDefinition = {
  id: "louisiana",
  name: "Louisiana",
  abbreviation: "LA",
  bounds: [
    [-94.042, 28.93],
    [-88.816, 33.02],
  ],
  center: [-91.429, 30.975],
  defaultZoom: 6.6,
  layers: LA_LAYERS,
  enabled: true,
};

export * from "./layers";
export * from "./sources";
