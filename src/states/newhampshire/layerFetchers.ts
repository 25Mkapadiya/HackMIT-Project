import { buildStandardStateLayerFetchers } from "@/lib/gis/standardStateLayerFetchers";
import { NH_EXISTING_DATA_CENTERS } from "./data/existingDataCenters";

/** All of New Hampshire's layers are nationwide sources — see standardStateLayerFetchers.ts. */
export const NH_LAYER_FETCHERS = buildStandardStateLayerFetchers("NH", NH_EXISTING_DATA_CENTERS);
