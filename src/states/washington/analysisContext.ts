import type { StateAnalysisContext } from "@/lib/analysis/context";
import { WA_LAYER_FETCHERS } from "@/lib/gis/layerFetchers";
import { NATIONAL_SOURCES } from "@/lib/gis/nationalSources";
import { WA_SOURCES } from "./sources";

export const WASHINGTON_CONTEXT: StateAnalysisContext = {
  stateId: "washington",
  stateCode: "WA",
  bounds: [
    [-124.9, 45.4],
    [-116.8, 49.1],
  ],
  fetchers: WA_LAYER_FETCHERS,
  sources: {
    ...NATIONAL_SOURCES,
    transmission: WA_SOURCES.bpaTransmission,
    utilityTerritories: WA_SOURCES.waUtilityTerritories,
    waterRights: WA_SOURCES.waWaterDiversions,
    drought: WA_SOURCES.waDroughtAreas,
    roads: WA_SOURCES.wsdotHighways,
    curatedDataCenters: WA_SOURCES.curatedDataCenters,
  },
  environmentalReviewNote:
    "SEPA (WA State Environmental Policy Act) environmental review is likely required for a project of this scale.",
  permittingNote:
    "Large facilities in Washington typically trigger county conditional-use/site-plan review and, depending on size and location, State Environmental Policy Act (SEPA) review. Utility interconnection is a separate process from land-use permitting.",
};
