import type { StateDefinition } from "@/lib/types";
import { SD_LAYERS } from "./layers";

// Bounds/center match the real Census-derived entry in src/states/directory.ts (id "sd").
export const SOUTH_DAKOTA: StateDefinition = {
  id: "southdakota",
  name: "South Dakota",
  abbreviation: "SD",
  bounds: [
    [-104.059, 42.485],
    [-96.436, 45.945],
  ],
  center: [-100.247, 44.215],
  defaultZoom: 6.6,
  layers: SD_LAYERS,
  enabled: true,
};

export * from "./layers";
export * from "./sources";
