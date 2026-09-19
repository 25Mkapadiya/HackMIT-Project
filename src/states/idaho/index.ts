import type { StateDefinition } from "@/lib/types";
import { ID_LAYERS } from "./layers";

// Bounds/center match the real Census-derived entry in src/states/directory.ts (id "id").
export const IDAHO: StateDefinition = {
  id: "idaho",
  name: "Idaho",
  abbreviation: "ID",
  bounds: [
    [-117.243, 41.988],
    [-111.044, 49.001],
  ],
  center: [-114.143, 45.494],
  defaultZoom: 5.9,
  layers: ID_LAYERS,
  enabled: true,
};

export * from "./layers";
export * from "./sources";
