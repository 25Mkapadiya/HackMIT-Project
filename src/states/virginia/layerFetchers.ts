import { buildStandardStateLayerFetchers } from "@/lib/gis/standardStateLayerFetchers";
import { VA_EXISTING_DATA_CENTERS } from "./data/existingDataCenters";

/** All of Virginia's layers are nationwide sources — see standardStateLayerFetchers.ts. */
export const VA_LAYER_FETCHERS = buildStandardStateLayerFetchers("VA", VA_EXISTING_DATA_CENTERS);
