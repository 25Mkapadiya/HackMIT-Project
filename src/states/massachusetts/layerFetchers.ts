import { buildStandardStateLayerFetchers } from "@/lib/gis/standardStateLayerFetchers";
import { MA_EXISTING_DATA_CENTERS } from "./data/existingDataCenters";

/** All of Massachusetts's layers are nationwide sources — see standardStateLayerFetchers.ts. */
export const MA_LAYER_FETCHERS = buildStandardStateLayerFetchers("MA", MA_EXISTING_DATA_CENTERS);
