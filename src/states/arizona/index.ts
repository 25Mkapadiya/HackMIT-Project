import type { StateDefinition } from "@/lib/types";
import { AZ_LAYERS } from "./layers";

// Bounds/center match the real Census-derived entry in src/states/directory.ts (id "az").
export const ARIZONA: StateDefinition = {
  id: "arizona",
  name: "Arizona",
  abbreviation: "AZ",
  bounds: [
    [-114.813, 31.332],
    [-109.045, 37.004],
  ],
  center: [-111.929, 34.168],
  defaultZoom: 6.4,
  layers: AZ_LAYERS,
  enabled: true,
};

export * from "./layers";
export * from "./sources";
