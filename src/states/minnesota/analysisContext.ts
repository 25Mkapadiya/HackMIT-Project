import type { StateAnalysisContext } from "@/lib/analysis/context";
import { MN_LAYER_FETCHERS } from "./layerFetchers";
import { NATIONAL_SOURCES } from "@/lib/gis/nationalSources";
import { MN_SOURCES } from "./sources";
import { MINNESOTA } from "./index";

export const MINNESOTA_CONTEXT: StateAnalysisContext = {
  stateId: "minnesota",
  stateCode: "MN",
  bounds: MINNESOTA.bounds,
  fetchers: MN_LAYER_FETCHERS,
  sources: {
    ...NATIONAL_SOURCES,
    transmission: MN_SOURCES.transmissionNational,
    utilityTerritories: MN_SOURCES.utilityServiceAreas,
    // usgsNhdFlowline/usgsNhdWaterbody deliberately NOT overridden with MN_SOURCES —
    // water.ts's nearestWaterBody metric cites whichever "usgsNhdFlowline" source is
    // in this map, and MN's hydrography fetcher (DNR Public Waters Inventory) already
    // replaces the *fetch*; point the citation at the DNR source it actually queries.
    usgsNhdFlowline: MN_SOURCES.dnrPublicWatersLines,
    usgsNhdWaterbody: MN_SOURCES.dnrPublicWatersBasins,
    curatedDataCenters: MN_SOURCES.curatedDataCenters,
    // No "waterRights" or "drought" or "roads" entries — no live public dataset was
    // found for MN water-appropriation permits, a drought-declaration layer, or a
    // statewide roads service. water.ts / land.ts degrade these to UNKNOWN via
    // ctx.fetchers["water-diversions"] / ["drought-areas"] / ["state-highways"]
    // being absent, rather than fabricating a source.
  },
  environmentalReviewNote:
    "Minnesota Environmental Policy Act (MEPA) review — potentially including an Environmental Assessment Worksheet (EAW) — is likely required for a project of this scale, in addition to any local conditional-use/site-plan review.",
  permittingNote:
    "Large facilities in Minnesota typically trigger county/city conditional-use or site-plan review and, depending on size, an Environmental Assessment Worksheet (EAW) under the Minnesota Environmental Policy Act (MEPA). Utility interconnection (including any MISO-level review) is a separate process from land-use permitting.",
};
