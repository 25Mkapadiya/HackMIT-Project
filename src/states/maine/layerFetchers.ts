import { buildStandardStateLayerFetchers } from "@/lib/gis/standardStateLayerFetchers";
import { ME_EXISTING_DATA_CENTERS } from "./data/existingDataCenters";

/** All of Maine's layers are nationwide sources — see standardStateLayerFetchers.ts. */
export const ME_LAYER_FETCHERS = buildStandardStateLayerFetchers("ME", ME_EXISTING_DATA_CENTERS);
