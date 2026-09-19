import { buildStandardStateLayerFetchers } from "@/lib/gis/standardStateLayerFetchers";
import { RI_EXISTING_DATA_CENTERS } from "./data/existingDataCenters";

/** All of Rhode Island's layers are nationwide sources — see standardStateLayerFetchers.ts. */
export const RI_LAYER_FETCHERS = buildStandardStateLayerFetchers("RI", RI_EXISTING_DATA_CENTERS);
