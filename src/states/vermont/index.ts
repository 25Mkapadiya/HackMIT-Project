import type { StateDefinition } from "@/lib/types";
import { VT_LAYERS } from "./layers";

// Bounds/center match the real Census-derived entry in src/states/directory.ts (id "vt").
export const VERMONT: StateDefinition = {
  id: "vermont",
  name: "Vermont",
  abbreviation: "VT",
  bounds: [
    [-73.439, 42.727],
    [-71.494, 45.016],
  ],
  center: [-72.466, 43.871],
  defaultZoom: 7.0,
  layers: VT_LAYERS,
  enabled: true,
};

export * from "./layers";
export * from "./sources";
