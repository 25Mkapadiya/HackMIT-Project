import type { StateDefinition } from "@/lib/types";
import { HI_LAYERS } from "./layers";

// Bounds/center match the real Census-derived entry in src/states/directory.ts (id "hi").
export const HAWAII: StateDefinition = {
  id: "hawaii",
  name: "Hawaii",
  abbreviation: "HI",
  bounds: [
    [-160.25, 18.917],
    [-154.808, 22.232],
  ],
  center: [-157.529, 20.575],
  defaultZoom: 6.0,
  layers: HI_LAYERS,
  enabled: true,
};

export * from "./layers";
export * from "./sources";
