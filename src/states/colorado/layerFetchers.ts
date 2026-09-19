import { buildStandardStateLayerFetchers } from "@/lib/gis/standardStateLayerFetchers";
import { CO_EXISTING_DATA_CENTERS } from "./data/existingDataCenters";

/** All of Colorado's layers are nationwide sources - see standardStateLayerFetchers.ts. */
export const CO_LAYER_FETCHERS = buildStandardStateLayerFetchers("CO", CO_EXISTING_DATA_CENTERS);
