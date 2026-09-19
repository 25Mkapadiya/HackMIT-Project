import type { StateDefinition } from "@/lib/types";
import { MO_LAYERS } from "./layers";

export const MISSOURI: StateDefinition = {
  id: "missouri",
  name: "Missouri",
  abbreviation: "MO",
  bounds: [
    [-95.768, 35.995],
    [-89.099, 40.614],
  ],
  center: [-92.434, 38.305],
  defaultZoom: 6.4,
  layers: MO_LAYERS,
  enabled: true,
};

export * from "./layers";
export * from "./sources";
