import { buildStandardStateLayerFetchers } from "@/lib/gis/standardStateLayerFetchers";
import { LA_EXISTING_DATA_CENTERS } from "./data/existingDataCenters";

/** All of Louisiana's layers are nationwide sources — see standardStateLayerFetchers.ts. */
export const LA_LAYER_FETCHERS = buildStandardStateLayerFetchers("LA", LA_EXISTING_DATA_CENTERS);
