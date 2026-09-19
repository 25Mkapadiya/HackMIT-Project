import { buildStandardStateLayerFetchers } from "@/lib/gis/standardStateLayerFetchers";
import { NJ_EXISTING_DATA_CENTERS } from "./data/existingDataCenters";

/** All of New Jersey's layers are nationwide sources — see standardStateLayerFetchers.ts. */
export const NJ_LAYER_FETCHERS = buildStandardStateLayerFetchers("NJ", NJ_EXISTING_DATA_CENTERS);
