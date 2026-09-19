import type { StateDefinition } from "@/lib/types";
import { OR_LAYERS } from "./layers";

// Bounds/center match the real Census-derived entry in src/states/directory.ts (id "or").
export const OREGON: StateDefinition = {
  id: "oregon",
  name: "Oregon",
  abbreviation: "OR",
  bounds: [
    [-124.554, 41.992],
    [-116.464, 46.268],
  ],
  center: [-120.509, 44.13],
  defaultZoom: 6.4,
  layers: OR_LAYERS,
  enabled: true,
};

export * from "./layers";
export * from "./sources";
