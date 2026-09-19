import { buildStandardStateLayerFetchers } from "@/lib/gis/standardStateLayerFetchers";
import { KS_EXISTING_DATA_CENTERS } from "./data/existingDataCenters";

/** All of Kansas's layers are nationwide sources — see standardStateLayerFetchers.ts. */
export const KS_LAYER_FETCHERS = buildStandardStateLayerFetchers("KS", KS_EXISTING_DATA_CENTERS);
