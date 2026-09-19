import { buildStandardStateLayerFetchers } from "@/lib/gis/standardStateLayerFetchers";
import { IA_EXISTING_DATA_CENTERS } from "./data/existingDataCenters";

/** All of Iowa's layers are nationwide sources — see standardStateLayerFetchers.ts. */
export const IA_LAYER_FETCHERS = buildStandardStateLayerFetchers("IA", IA_EXISTING_DATA_CENTERS);
