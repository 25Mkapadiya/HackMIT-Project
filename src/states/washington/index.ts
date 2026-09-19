import type { StateDefinition } from "@/lib/types";
import { WA_LAYERS } from "./layers";

export const WASHINGTON: StateDefinition = {
  id: "washington",
  name: "Washington",
  abbreviation: "WA",
  bounds: [
    [-124.9, 45.4],
    [-116.8, 49.1],
  ],
  center: [-120.5, 47.35],
  defaultZoom: 6.3,
  layers: WA_LAYERS,
  enabled: true,
};

export * from "./layers";
export * from "./sources";
