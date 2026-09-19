import { buildStandardStateLayerFetchers } from "@/lib/gis/standardStateLayerFetchers";
import { NY_EXISTING_DATA_CENTERS } from "./data/existingDataCenters";

/** All of New York's layers are nationwide sources — see standardStateLayerFetchers.ts. */
export const NY_LAYER_FETCHERS = buildStandardStateLayerFetchers("NY", NY_EXISTING_DATA_CENTERS);
