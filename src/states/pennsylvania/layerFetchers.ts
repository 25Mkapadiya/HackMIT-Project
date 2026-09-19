import { buildStandardStateLayerFetchers } from "@/lib/gis/standardStateLayerFetchers";
import { PA_EXISTING_DATA_CENTERS } from "./data/existingDataCenters";

/** All of Pennsylvania's layers are nationwide sources — see standardStateLayerFetchers.ts. */
export const PA_LAYER_FETCHERS = buildStandardStateLayerFetchers("PA", PA_EXISTING_DATA_CENTERS);
