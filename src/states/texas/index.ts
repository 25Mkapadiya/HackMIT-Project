import type { StateDefinition } from "@/lib/types";
import { TX_LAYERS } from "./layers";

// Bounds/center match the real Census-derived entry in src/states/directory.ts (id "tx").
export const TEXAS: StateDefinition = {
  id: "texas",
  name: "Texas",
  abbreviation: "TX",
  bounds: [
    [-106.647, 25.84],
    [-93.518, 36.501],
  ],
  center: [-100.082, 31.17],
  defaultZoom: 5.7,
  layers: TX_LAYERS,
  enabled: true,
};

export * from "./layers";
export * from "./sources";
