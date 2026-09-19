import { buildStandardStateLayerFetchers } from "@/lib/gis/standardStateLayerFetchers";
import { TN_EXISTING_DATA_CENTERS } from "./data/existingDataCenters";

/** All of Tennessee's layers are nationwide sources — see standardStateLayerFetchers.ts. */
export const TN_LAYER_FETCHERS = buildStandardStateLayerFetchers("TN", TN_EXISTING_DATA_CENTERS);
