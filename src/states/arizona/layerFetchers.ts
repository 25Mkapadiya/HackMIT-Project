import { buildStandardStateLayerFetchers } from "@/lib/gis/standardStateLayerFetchers";
import { AZ_EXISTING_DATA_CENTERS } from "./data/existingDataCenters";

/** All of Arizona's layers are nationwide sources — see standardStateLayerFetchers.ts. */
export const AZ_LAYER_FETCHERS = buildStandardStateLayerFetchers("AZ", AZ_EXISTING_DATA_CENTERS);
