import { buildStandardStateLayerFetchers } from "@/lib/gis/standardStateLayerFetchers";
import { MN_EXISTING_DATA_CENTERS } from "./data/existingDataCenters";

/** All of Minnesota's layers are nationwide sources — see standardStateLayerFetchers.ts. */
export const MN_LAYER_FETCHERS = buildStandardStateLayerFetchers("MN", MN_EXISTING_DATA_CENTERS);
