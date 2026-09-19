import { buildStandardStateLayerFetchers } from "@/lib/gis/standardStateLayerFetchers";
import { UT_EXISTING_DATA_CENTERS } from "./data/existingDataCenters";

/** All of Utah's layers are nationwide sources - see standardStateLayerFetchers.ts. */
export const UT_LAYER_FETCHERS = buildStandardStateLayerFetchers("UT", UT_EXISTING_DATA_CENTERS);
