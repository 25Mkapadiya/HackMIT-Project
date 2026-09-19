import { buildStandardStateLayerFetchers } from "@/lib/gis/standardStateLayerFetchers";
import { AR_EXISTING_DATA_CENTERS } from "./data/existingDataCenters";

/** All of Arkansas's layers are nationwide sources — see standardStateLayerFetchers.ts. */
export const AR_LAYER_FETCHERS = buildStandardStateLayerFetchers("AR", AR_EXISTING_DATA_CENTERS);
