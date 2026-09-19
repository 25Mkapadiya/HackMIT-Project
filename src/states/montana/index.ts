import type { StateDefinition } from "@/lib/types";
import { MT_LAYERS } from "./layers";

// Bounds/center match the real Census-derived entry in src/states/directory.ts (id "mt").
export const MONTANA: StateDefinition = {
  id: "montana",
  name: "Montana",
  abbreviation: "MT",
  bounds: [
    [-116.051, 44.358],
    [-104.041, 49.002],
  ],
  center: [-110.046, 46.68],
  defaultZoom: 5.9,
  layers: MT_LAYERS,
  enabled: true,
};

export * from "./layers";
export * from "./sources";
