import { buildStandardStateLayerFetchers } from "@/lib/gis/standardStateLayerFetchers";
import { KY_EXISTING_DATA_CENTERS } from "./data/existingDataCenters";

/** All of Kentucky's layers are nationwide sources — see standardStateLayerFetchers.ts. */
export const KY_LAYER_FETCHERS = buildStandardStateLayerFetchers("KY", KY_EXISTING_DATA_CENTERS);
