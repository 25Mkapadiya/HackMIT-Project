import { buildStandardStateLayerFetchers } from "@/lib/gis/standardStateLayerFetchers";
import { WV_EXISTING_DATA_CENTERS } from "./data/existingDataCenters";

/** All of West Virginia's layers are nationwide sources — see standardStateLayerFetchers.ts. */
export const WV_LAYER_FETCHERS = buildStandardStateLayerFetchers("WV", WV_EXISTING_DATA_CENTERS);
