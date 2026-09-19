import { buildStandardStateLayerFetchers } from "@/lib/gis/standardStateLayerFetchers";
import { MT_EXISTING_DATA_CENTERS } from "./data/existingDataCenters";

/** All of Montana's layers are nationwide sources - see standardStateLayerFetchers.ts. */
export const MT_LAYER_FETCHERS = buildStandardStateLayerFetchers("MT", MT_EXISTING_DATA_CENTERS);
