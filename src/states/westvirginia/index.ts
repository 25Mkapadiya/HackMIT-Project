import type { StateDefinition } from "@/lib/types";
import { WV_LAYERS } from "./layers";

// Bounds/center match the real Census-derived entry in src/states/directory.ts (id "wv").
export const WEST_VIRGINIA: StateDefinition = {
  id: "westvirginia",
  name: "West Virginia",
  abbreviation: "WV",
  bounds: [
    [-82.638, 37.202],
    [-77.721, 40.639],
  ],
  center: [-80.18, 38.92],
  defaultZoom: 6.6,
  layers: WV_LAYERS,
  enabled: true,
};

export * from "./layers";
export * from "./sources";
