import { buildStandardStateLayerFetchers } from "@/lib/gis/standardStateLayerFetchers";
import { AK_EXISTING_DATA_CENTERS } from "./data/existingDataCenters";

/** All of Alaska's layers are nationwide sources - see standardStateLayerFetchers.ts. */
export const AK_LAYER_FETCHERS = buildStandardStateLayerFetchers("AK", AK_EXISTING_DATA_CENTERS);
