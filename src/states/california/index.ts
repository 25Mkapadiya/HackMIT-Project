import type { StateDefinition } from "@/lib/types";
import { CA_LAYERS } from "./layers";

// Bounds/center match the real Census-derived entry in src/states/directory.ts (id "ca").
export const CALIFORNIA: StateDefinition = {
  id: "california",
  name: "California",
  abbreviation: "CA",
  bounds: [
    [-124.411, 32.534],
    [-114.134, 42.01],
  ],
  center: [-119.273, 37.272],
  defaultZoom: 5.4,
  layers: CA_LAYERS,
  enabled: true,
};

export * from "./layers";
export * from "./sources";
