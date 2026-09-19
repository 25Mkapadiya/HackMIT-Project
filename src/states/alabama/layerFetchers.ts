import { buildStandardStateLayerFetchers } from "@/lib/gis/standardStateLayerFetchers";
import { AL_EXISTING_DATA_CENTERS } from "./data/existingDataCenters";

/** All of Alabama's layers are nationwide sources — see standardStateLayerFetchers.ts. */
export const AL_LAYER_FETCHERS = buildStandardStateLayerFetchers("AL", AL_EXISTING_DATA_CENTERS);
