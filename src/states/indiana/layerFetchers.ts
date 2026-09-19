import { buildStandardStateLayerFetchers } from "@/lib/gis/standardStateLayerFetchers";
import { IN_EXISTING_DATA_CENTERS } from "./data/existingDataCenters";

/** All of Indiana's layers are nationwide sources — see standardStateLayerFetchers.ts. */
export const IN_LAYER_FETCHERS = buildStandardStateLayerFetchers("IN", IN_EXISTING_DATA_CENTERS);
