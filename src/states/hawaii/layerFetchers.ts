import { buildStandardStateLayerFetchers } from "@/lib/gis/standardStateLayerFetchers";
import { HI_EXISTING_DATA_CENTERS } from "./data/existingDataCenters";

/** All of Hawaii's layers are nationwide sources - see standardStateLayerFetchers.ts. */
export const HI_LAYER_FETCHERS = buildStandardStateLayerFetchers("HI", HI_EXISTING_DATA_CENTERS);
