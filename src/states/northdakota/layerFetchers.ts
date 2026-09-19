import { buildStandardStateLayerFetchers } from "@/lib/gis/standardStateLayerFetchers";
import { ND_EXISTING_DATA_CENTERS } from "./data/existingDataCenters";

/** All of North Dakota's layers are nationwide sources — see standardStateLayerFetchers.ts. */
export const ND_LAYER_FETCHERS = buildStandardStateLayerFetchers("ND", ND_EXISTING_DATA_CENTERS);
