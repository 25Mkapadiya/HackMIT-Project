import { buildStandardStateLayerFetchers } from "@/lib/gis/standardStateLayerFetchers";
import { SD_EXISTING_DATA_CENTERS } from "./data/existingDataCenters";

/** All of South Dakota's layers are nationwide sources — see standardStateLayerFetchers.ts. */
export const SD_LAYER_FETCHERS = buildStandardStateLayerFetchers("SD", SD_EXISTING_DATA_CENTERS);
