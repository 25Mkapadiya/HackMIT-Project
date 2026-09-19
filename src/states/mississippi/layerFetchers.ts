import { buildStandardStateLayerFetchers } from "@/lib/gis/standardStateLayerFetchers";
import { MS_EXISTING_DATA_CENTERS } from "./data/existingDataCenters";

/** All of Mississippi's layers are nationwide sources — see standardStateLayerFetchers.ts. */
export const MS_LAYER_FETCHERS = buildStandardStateLayerFetchers("MS", MS_EXISTING_DATA_CENTERS);
