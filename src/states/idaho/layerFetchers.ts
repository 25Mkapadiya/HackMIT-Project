import { buildStandardStateLayerFetchers } from "@/lib/gis/standardStateLayerFetchers";
import { ID_EXISTING_DATA_CENTERS } from "./data/existingDataCenters";

/** All of Idaho's layers are nationwide sources - see standardStateLayerFetchers.ts. */
export const ID_LAYER_FETCHERS = buildStandardStateLayerFetchers("ID", ID_EXISTING_DATA_CENTERS);
