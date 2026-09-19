import { buildStandardStateLayerFetchers } from "@/lib/gis/standardStateLayerFetchers";
import { NE_EXISTING_DATA_CENTERS } from "./data/existingDataCenters";

/** All of Nebraska's layers are nationwide sources — see standardStateLayerFetchers.ts. */
export const NE_LAYER_FETCHERS = buildStandardStateLayerFetchers("NE", NE_EXISTING_DATA_CENTERS);
