import { buildStandardStateLayerFetchers } from "@/lib/gis/standardStateLayerFetchers";
import { IL_EXISTING_DATA_CENTERS } from "./data/existingDataCenters";

export const IL_LAYER_FETCHERS = buildStandardStateLayerFetchers("IL", IL_EXISTING_DATA_CENTERS);
