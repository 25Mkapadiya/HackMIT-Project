import type { StateDefinition } from "@/lib/types";
import { GA_LAYERS } from "./layers";

// Bounds/center match the real Census-derived entry in src/states/directory.ts (id "ga").
export const GEORGIA: StateDefinition = {
  id: "georgia",
  name: "Georgia",
  abbreviation: "GA",
  bounds: [
    [-85.607, 30.359],
    [-80.844, 35.001],
  ],
  center: [-83.225, 32.68],
  defaultZoom: 6.6,
  layers: GA_LAYERS,
  enabled: true,
};

export * from "./layers";
export * from "./sources";
