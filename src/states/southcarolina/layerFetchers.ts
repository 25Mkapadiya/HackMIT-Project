import { buildStandardStateLayerFetchers } from "@/lib/gis/standardStateLayerFetchers";
import { SC_EXISTING_DATA_CENTERS } from "./data/existingDataCenters";

/** All of South Carolina's layers are nationwide sources — see standardStateLayerFetchers.ts. */
export const SC_LAYER_FETCHERS = buildStandardStateLayerFetchers("SC", SC_EXISTING_DATA_CENTERS);
