import { buildStandardStateLayerFetchers } from "@/lib/gis/standardStateLayerFetchers";
import { WY_EXISTING_DATA_CENTERS } from "./data/existingDataCenters";

/** All of Wyoming's layers are nationwide sources - see standardStateLayerFetchers.ts. */
export const WY_LAYER_FETCHERS = buildStandardStateLayerFetchers("WY", WY_EXISTING_DATA_CENTERS);
