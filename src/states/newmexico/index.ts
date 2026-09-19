import type { StateDefinition } from "@/lib/types";
import { NM_LAYERS } from "./layers";

// Bounds/center match the real Census-derived entry in src/states/directory.ts (id "nm").
export const NEW_MEXICO: StateDefinition = {
  id: "newmexico",
  name: "New Mexico",
  abbreviation: "NM",
  bounds: [
    [-109.048, 31.332],
    [-103, 37],
  ],
  center: [-106.024, 34.166],
  defaultZoom: 6.4,
  layers: NM_LAYERS,
  enabled: true,
};

export * from "./layers";
export * from "./sources";
