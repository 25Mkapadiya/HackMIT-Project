import type { StateDefinition } from "@/lib/types";
import { IL_LAYERS } from "./layers";

export const ILLINOIS: StateDefinition = {
  id: "illinois",
  name: "Illinois",
  abbreviation: "IL",
  bounds: [[-91.513, 36.970], [-87.495, 42.509]],
  center: [-89.504, 39.740],
  defaultZoom: 6.2,
  layers: IL_LAYERS,
  enabled: true,
};

export * from "./layers";
export * from "./sources";
