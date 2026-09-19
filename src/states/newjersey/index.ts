import type { StateDefinition } from "@/lib/types";
import { NJ_LAYERS } from "./layers";

// Bounds/center match the real Census-derived entry in src/states/directory.ts (id "nj").
export const NEW_JERSEY: StateDefinition = {
  id: "newjersey",
  name: "New Jersey",
  abbreviation: "NJ",
  bounds: [
    [-75.56, 38.928],
    [-73.895, 41.358],
  ],
  center: [-74.728, 40.143],
  defaultZoom: 7.0,
  layers: NJ_LAYERS,
  enabled: true,
};

export * from "./layers";
export * from "./sources";
