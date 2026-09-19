import { buildStandardStateLayerFetchers } from "@/lib/gis/standardStateLayerFetchers";
import { FL_EXISTING_DATA_CENTERS } from "./data/existingDataCenters";

/** All of Florida's layers are nationwide sources — see standardStateLayerFetchers.ts. */
export const FL_LAYER_FETCHERS = buildStandardStateLayerFetchers("FL", FL_EXISTING_DATA_CENTERS);
