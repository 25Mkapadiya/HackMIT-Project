import { buildStandardStateLayerFetchers } from "@/lib/gis/standardStateLayerFetchers";
import { NV_EXISTING_DATA_CENTERS } from "./data/existingDataCenters";

/** All of Nevada's layers are nationwide sources - see standardStateLayerFetchers.ts. */
export const NV_LAYER_FETCHERS = buildStandardStateLayerFetchers("NV", NV_EXISTING_DATA_CENTERS);
