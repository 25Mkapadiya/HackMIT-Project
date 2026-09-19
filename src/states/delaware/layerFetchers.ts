import { buildStandardStateLayerFetchers } from "@/lib/gis/standardStateLayerFetchers";
import { DE_EXISTING_DATA_CENTERS } from "./data/existingDataCenters";

/** All of Delaware's layers are nationwide sources — see standardStateLayerFetchers.ts. */
export const DE_LAYER_FETCHERS = buildStandardStateLayerFetchers("DE", DE_EXISTING_DATA_CENTERS);
