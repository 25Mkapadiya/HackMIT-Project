import { buildStandardStateLayerFetchers } from "@/lib/gis/standardStateLayerFetchers";
import { GA_EXISTING_DATA_CENTERS } from "./data/existingDataCenters";

/** All of Georgia's layers are nationwide sources — see standardStateLayerFetchers.ts. */
export const GA_LAYER_FETCHERS = buildStandardStateLayerFetchers("GA", GA_EXISTING_DATA_CENTERS);
