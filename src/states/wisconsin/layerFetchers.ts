import { buildStandardStateLayerFetchers } from "@/lib/gis/standardStateLayerFetchers";
import { WI_EXISTING_DATA_CENTERS } from "./data/existingDataCenters";

/** All of Wisconsin's layers are nationwide sources — see standardStateLayerFetchers.ts. */
export const WI_LAYER_FETCHERS = buildStandardStateLayerFetchers("WI", WI_EXISTING_DATA_CENTERS);
