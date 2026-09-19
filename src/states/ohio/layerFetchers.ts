import { buildStandardStateLayerFetchers } from "@/lib/gis/standardStateLayerFetchers";
import { OH_EXISTING_DATA_CENTERS } from "./data/existingDataCenters";

/** All of Ohio's layers are nationwide sources — see standardStateLayerFetchers.ts. */
export const OH_LAYER_FETCHERS = buildStandardStateLayerFetchers("OH", OH_EXISTING_DATA_CENTERS);
