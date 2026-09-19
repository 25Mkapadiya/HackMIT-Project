import type { StateDefinition } from "@/lib/types";
import { TN_LAYERS } from "./layers";

// Bounds/center match the real Census-derived entry in src/states/directory.ts (id "tn").
export const TENNESSEE: StateDefinition = {
  id: "tennessee",
  name: "Tennessee",
  abbreviation: "TN",
  bounds: [
    [-90.309, 34.983],
    [-81.648, 36.678],
  ],
  center: [-85.978, 35.83],
  defaultZoom: 6.6,
  layers: TN_LAYERS,
  enabled: true,
};

export * from "./layers";
export * from "./sources";
