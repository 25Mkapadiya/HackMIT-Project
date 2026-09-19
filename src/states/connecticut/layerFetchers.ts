import { buildStandardStateLayerFetchers } from "@/lib/gis/standardStateLayerFetchers";
import { CT_EXISTING_DATA_CENTERS } from "./data/existingDataCenters";

/** All of Connecticut's layers are nationwide sources — see standardStateLayerFetchers.ts. */
export const CT_LAYER_FETCHERS = buildStandardStateLayerFetchers("CT", CT_EXISTING_DATA_CENTERS);
