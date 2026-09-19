import { buildStandardStateLayerFetchers } from "@/lib/gis/standardStateLayerFetchers";
import { NC_EXISTING_DATA_CENTERS } from "./data/existingDataCenters";

/** All of North Carolina's layers are nationwide sources — see standardStateLayerFetchers.ts. */
export const NC_LAYER_FETCHERS = buildStandardStateLayerFetchers("NC", NC_EXISTING_DATA_CENTERS);
