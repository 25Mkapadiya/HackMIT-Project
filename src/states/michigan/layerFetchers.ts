import { buildStandardStateLayerFetchers } from "@/lib/gis/standardStateLayerFetchers";
import { MI_EXISTING_DATA_CENTERS } from "./data/existingDataCenters";

/** All of Michigan's layers are nationwide sources — see standardStateLayerFetchers.ts. */
export const MI_LAYER_FETCHERS = buildStandardStateLayerFetchers("MI", MI_EXISTING_DATA_CENTERS);
