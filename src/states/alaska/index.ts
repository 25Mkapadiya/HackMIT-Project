import type { StateDefinition } from "@/lib/types";
import { AK_LAYERS } from "./layers";

// Bounds/center match the real Census-derived entry in src/states/directory.ts (id "ak").
export const ALASKA: StateDefinition = {
  id: "alaska",
  name: "Alaska",
  abbreviation: "AK",
  bounds: [
    [-179.137, 51.229],
    [-129.981, 71.353],
  ],
  center: [-154.559, 61.291],
  defaultZoom: 3.6,
  layers: AK_LAYERS,
  enabled: true,
};

export * from "./layers";
export * from "./sources";
