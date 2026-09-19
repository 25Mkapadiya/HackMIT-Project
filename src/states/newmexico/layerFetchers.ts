import { buildStandardStateLayerFetchers } from "@/lib/gis/standardStateLayerFetchers";
import { NM_EXISTING_DATA_CENTERS } from "./data/existingDataCenters";

/** All of New Mexico's layers are nationwide sources — see standardStateLayerFetchers.ts. */
export const NM_LAYER_FETCHERS = buildStandardStateLayerFetchers("NM", NM_EXISTING_DATA_CENTERS);
