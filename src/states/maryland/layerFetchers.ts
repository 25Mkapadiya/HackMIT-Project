import { buildStandardStateLayerFetchers } from "@/lib/gis/standardStateLayerFetchers";
import { MD_EXISTING_DATA_CENTERS } from "./data/existingDataCenters";

/** All of Maryland's layers are nationwide sources — see standardStateLayerFetchers.ts. */
export const MD_LAYER_FETCHERS = buildStandardStateLayerFetchers("MD", MD_EXISTING_DATA_CENTERS);
