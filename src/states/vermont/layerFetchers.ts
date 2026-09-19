import { buildStandardStateLayerFetchers } from "@/lib/gis/standardStateLayerFetchers";
import { VT_EXISTING_DATA_CENTERS } from "./data/existingDataCenters";

/** All of Vermont's layers are nationwide sources — see standardStateLayerFetchers.ts. */
export const VT_LAYER_FETCHERS = buildStandardStateLayerFetchers("VT", VT_EXISTING_DATA_CENTERS);
