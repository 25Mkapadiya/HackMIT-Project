import type { FeatureCollection } from "geojson";
import type { SourceMeta } from "@/lib/types";
import type { Bbox } from "./arcgis";
import { WA_LAYER_FETCHERS } from "./layerFetchers";
import { WA_SOURCES } from "@/states/washington/sources";
import { OK_LAYER_FETCHERS } from "@/states/oklahoma/layerFetchers";
import { OK_SOURCES } from "@/states/oklahoma/sources";
import { AR_LAYER_FETCHERS } from "@/states/arkansas/layerFetchers";
import { AR_SOURCES } from "@/states/arkansas/sources";
import { LA_LAYER_FETCHERS } from "@/states/louisiana/layerFetchers";
import { LA_SOURCES } from "@/states/louisiana/sources";
import { MS_LAYER_FETCHERS } from "@/states/mississippi/layerFetchers";
import { MS_SOURCES } from "@/states/mississippi/sources";
import { AL_LAYER_FETCHERS } from "@/states/alabama/layerFetchers";
import { AL_SOURCES } from "@/states/alabama/sources";
import { TN_LAYER_FETCHERS } from "@/states/tennessee/layerFetchers";
import { TN_SOURCES } from "@/states/tennessee/sources";
import { KY_LAYER_FETCHERS } from "@/states/kentucky/layerFetchers";
import { KY_SOURCES } from "@/states/kentucky/sources";
import { FL_LAYER_FETCHERS } from "@/states/florida/layerFetchers";
import { FL_SOURCES } from "@/states/florida/sources";
import { GA_LAYER_FETCHERS } from "@/states/georgia/layerFetchers";
import { GA_SOURCES } from "@/states/georgia/sources";
import { SC_LAYER_FETCHERS } from "@/states/southcarolina/layerFetchers";
import { SC_SOURCES } from "@/states/southcarolina/sources";
import { NC_LAYER_FETCHERS } from "@/states/northcarolina/layerFetchers";
import { NC_SOURCES } from "@/states/northcarolina/sources";
import { VA_LAYER_FETCHERS } from "@/states/virginia/layerFetchers";
import { VA_SOURCES } from "@/states/virginia/sources";
import { WV_LAYER_FETCHERS } from "@/states/westvirginia/layerFetchers";
import { WV_SOURCES } from "@/states/westvirginia/sources";
import { MD_LAYER_FETCHERS } from "@/states/maryland/layerFetchers";
import { MD_SOURCES } from "@/states/maryland/sources";
import { TX_LAYER_FETCHERS } from "@/states/texas/layerFetchers";
import { TX_SOURCES } from "@/states/texas/sources";
import { DE_LAYER_FETCHERS } from "@/states/delaware/layerFetchers";
import { DE_SOURCES } from "@/states/delaware/sources";
import { MO_LAYER_FETCHERS } from "@/states/missouri/layerFetchers";
import { MO_SOURCES } from "@/states/missouri/sources";
import { IL_LAYER_FETCHERS } from "@/states/illinois/layerFetchers";
import { IL_SOURCES } from "@/states/illinois/sources";
import { ME_LAYER_FETCHERS } from "@/states/maine/layerFetchers";
import { ME_SOURCES } from "@/states/maine/sources";
import { NH_LAYER_FETCHERS } from "@/states/newhampshire/layerFetchers";
import { NH_SOURCES } from "@/states/newhampshire/sources";
import { VT_LAYER_FETCHERS } from "@/states/vermont/layerFetchers";
import { VT_SOURCES } from "@/states/vermont/sources";
import { MA_LAYER_FETCHERS } from "@/states/massachusetts/layerFetchers";
import { MA_SOURCES } from "@/states/massachusetts/sources";

import { OR_LAYER_FETCHERS } from "@/states/oregon/layerFetchers";
import { OR_SOURCES } from "@/states/oregon/sources";
import { CA_LAYER_FETCHERS } from "@/states/california/layerFetchers";
import { CA_SOURCES } from "@/states/california/sources";
import { AK_LAYER_FETCHERS } from "@/states/alaska/layerFetchers";
import { AK_SOURCES } from "@/states/alaska/sources";
import { HI_LAYER_FETCHERS } from "@/states/hawaii/layerFetchers";
import { HI_SOURCES } from "@/states/hawaii/sources";
import { ID_LAYER_FETCHERS } from "@/states/idaho/layerFetchers";
import { ID_SOURCES } from "@/states/idaho/sources";
import { MT_LAYER_FETCHERS } from "@/states/montana/layerFetchers";
import { MT_SOURCES } from "@/states/montana/sources";
import { WY_LAYER_FETCHERS } from "@/states/wyoming/layerFetchers";
import { WY_SOURCES } from "@/states/wyoming/sources";
import { RI_LAYER_FETCHERS } from "@/states/rhodeisland/layerFetchers";
import { RI_SOURCES } from "@/states/rhodeisland/sources";
import { CT_LAYER_FETCHERS } from "@/states/connecticut/layerFetchers";
import { CT_SOURCES } from "@/states/connecticut/sources";
import { NY_LAYER_FETCHERS } from "@/states/newyork/layerFetchers";
import { NY_SOURCES } from "@/states/newyork/sources";
import { NJ_LAYER_FETCHERS } from "@/states/newjersey/layerFetchers";
import { NJ_SOURCES } from "@/states/newjersey/sources";
import { PA_LAYER_FETCHERS } from "@/states/pennsylvania/layerFetchers";
import { PA_SOURCES } from "@/states/pennsylvania/sources";
import { OH_LAYER_FETCHERS } from "@/states/ohio/layerFetchers";
import { OH_SOURCES } from "@/states/ohio/sources";
import { MI_LAYER_FETCHERS } from "@/states/michigan/layerFetchers";
import { MI_SOURCES } from "@/states/michigan/sources";
import { IN_LAYER_FETCHERS } from "@/states/indiana/layerFetchers";
import { IN_SOURCES } from "@/states/indiana/sources";
import { WI_LAYER_FETCHERS } from "@/states/wisconsin/layerFetchers";
import { WI_SOURCES } from "@/states/wisconsin/sources";
import { IA_LAYER_FETCHERS } from "@/states/iowa/layerFetchers";
import { IA_SOURCES } from "@/states/iowa/sources";
import { MN_LAYER_FETCHERS } from "@/states/minnesota/layerFetchers";
import { MN_SOURCES } from "@/states/minnesota/sources";
import { KS_LAYER_FETCHERS } from "@/states/kansas/layerFetchers";
import { KS_SOURCES } from "@/states/kansas/sources";
import { NE_LAYER_FETCHERS } from "@/states/nebraska/layerFetchers";
import { NE_SOURCES } from "@/states/nebraska/sources";
import { SD_LAYER_FETCHERS } from "@/states/southdakota/layerFetchers";
import { SD_SOURCES } from "@/states/southdakota/sources";
import { ND_LAYER_FETCHERS } from "@/states/northdakota/layerFetchers";
import { ND_SOURCES } from "@/states/northdakota/sources";
import { NM_LAYER_FETCHERS } from "@/states/newmexico/layerFetchers";
import { NM_SOURCES } from "@/states/newmexico/sources";
import { AZ_LAYER_FETCHERS } from "@/states/arizona/layerFetchers";
import { AZ_SOURCES } from "@/states/arizona/sources";

export type Fetcher = (bbox: Bbox) => Promise<FeatureCollection>;

/**
 * The handful of things that genuinely differ per state and aren't already
 * covered by NATIONAL_SOURCES / the shared national fetchers: which upstream
 * feeds this state's power/water layers use, and a few pieces of state-specific
 * regulatory prose. Everything else (hydrography, flood zones, forest lands,
 * census tracts, elevation, EIA generation, PeeringDB) is nationwide and reused
 * as-is by every state's fetcher map — see src/lib/gis/nationalFetchers.ts.
 */
export interface StateGisBundle {
  fetchers: Record<string, Fetcher>;
  transmissionSource: SourceMeta;
  utilityTerritorySource: SourceMeta;
  utilityTerritoryCaveats: string[];
  waterRightsSource: SourceMeta;
  droughtSource: SourceMeta;
  /** e.g. "BPA" or "SPP" — used in the "Utility/<X> interconnection study..." likely-action copy. */
  interconnectionAuthorityLabel: string;
  /** One-line environmental/regulatory-review bullet added to LandAnalysis.environmentalConstraints. */
  environmentalReviewNote: string;
  permittingNote: { text: string; source: SourceMeta };
  /** null when no verified state road-classification GIS layer is integrated. */
  roads: { layerId: string; source: SourceMeta; label: string } | null;
}

const STANDARD_HIFLD_UTILITY_CAVEAT =
  "Boundary is a static 2025-08-21 HIFLD Electric Retail Service Territories snapshot — not an official service-territory determination and will not reflect subsequent utility/territory changes.";

/** Placeholder for states where no verified public GIS layer of water-rights/withdrawal permits was found. */
const NO_WATER_RIGHTS_SOURCE: SourceMeta = {
  id: "no-water-rights-dataset",
  name: "No water-rights/withdrawal-permit GIS dataset integrated for this state",
  url: "",
};

const WASHINGTON_BUNDLE: StateGisBundle = {
  fetchers: WA_LAYER_FETCHERS,
  transmissionSource: WA_SOURCES.bpaTransmission,
  utilityTerritorySource: WA_SOURCES.waUtilityTerritories,
  utilityTerritoryCaveats: ["Boundary is informational, compiled by WA Ecology/UTC — not an official service-territory determination."],
  waterRightsSource: WA_SOURCES.waWaterDiversions,
  droughtSource: WA_SOURCES.waDroughtAreas,
  interconnectionAuthorityLabel: "BPA",
  environmentalReviewNote: "SEPA (WA State Environmental Policy Act) environmental review is likely required for a project of this scale.",
  permittingNote: {
    text: "Large facilities in Washington typically trigger county conditional-use/site-plan review and, depending on size and location, State Environmental Policy Act (SEPA) review. Utility interconnection is a separate process from land-use permitting.",
    source: {
      id: "wa-sepa-general",
      name: "Washington State Environmental Policy Act (general reference)",
      url: "https://ecology.wa.gov/regulations-permits/sepa",
      methodology: "General regulatory context, not a jurisdiction-specific legal determination.",
    },
  },
  roads: {
    layerId: "state-highways",
    source: WA_SOURCES.wsdotHighways,
    label: "Nearest state highway (functional class ≤ 3)",
  },
};

const OKLAHOMA_BUNDLE: StateGisBundle = {
  fetchers: OK_LAYER_FETCHERS,
  transmissionSource: OK_SOURCES.hifldTransmission,
  utilityTerritorySource: OK_SOURCES.hifldUtilityTerritories,
  utilityTerritoryCaveats: [STANDARD_HIFLD_UTILITY_CAVEAT],
  waterRightsSource: OK_SOURCES.owrbSurfaceWaterRights,
  droughtSource: OK_SOURCES.usDroughtMonitor,
  interconnectionAuthorityLabel: "SPP",
  environmentalReviewNote:
    "Oklahoma has no statewide environmental-review analog to SEPA/CEQA — county/municipal site-plan review and utility large-load coordination are the primary gating processes; some jurisdictions (e.g. Oklahoma City) have adopted additional data-center-specific review. Confirm current local status directly.",
  permittingNote: {
    text: "Large facilities in Oklahoma typically require county or municipal site-plan/zoning review (Oklahoma has no statewide zoning layer) and large-load service coordination with the serving utility and/or the Southwest Power Pool (SPP). Utility interconnection is a separate process from land-use permitting.",
    source: {
      id: "ok-permitting-general",
      name: "Oklahoma data-center siting — general regulatory context",
      url: "https://okcommerce.gov",
      methodology: "General regulatory context compiled from state/local public reporting, not a jurisdiction-specific legal determination.",
    },
  },
  roads: null,
};

/**
 * Shared shape for states whose power/water/environment layers are entirely
 * nationwide (see buildStandardStateLayerFetchers) and have no verified public
 * GIS layer for water-rights permits or road classification. Only the
 * regulatory prose and interconnection-authority label differ per state.
 */
function buildStandardBundle(opts: {
  fetchers: Record<string, Fetcher>;
  hifldTransmission: SourceMeta;
  hifldUtilityTerritories: SourceMeta;
  usDroughtMonitor: SourceMeta;
  interconnectionAuthorityLabel: string;
  environmentalReviewNote: string;
  permittingNote: { text: string; source: SourceMeta };
}): StateGisBundle {
  return {
    fetchers: opts.fetchers,
    transmissionSource: opts.hifldTransmission,
    utilityTerritorySource: opts.hifldUtilityTerritories,
    utilityTerritoryCaveats: [STANDARD_HIFLD_UTILITY_CAVEAT],
    waterRightsSource: NO_WATER_RIGHTS_SOURCE,
    droughtSource: opts.usDroughtMonitor,
    interconnectionAuthorityLabel: opts.interconnectionAuthorityLabel,
    environmentalReviewNote: opts.environmentalReviewNote,
    permittingNote: opts.permittingNote,
    roads: null,
  };
}

const ARKANSAS_BUNDLE = buildStandardBundle({
  fetchers: AR_LAYER_FETCHERS,
  hifldTransmission: AR_SOURCES.hifldTransmission,
  hifldUtilityTerritories: AR_SOURCES.hifldUtilityTerritories,
  usDroughtMonitor: AR_SOURCES.usDroughtMonitor,
  interconnectionAuthorityLabel: "SPP",
  environmentalReviewNote:
    "Arkansas has no statewide zoning layer or SEPA/CEQA-style environmental-review analog — county/municipal site-plan review and utility large-load coordination with the serving utility and/or the Southwest Power Pool (SPP) are the primary gating processes.",
  permittingNote: {
    text: "Large facilities in Arkansas typically require county or municipal site-plan/zoning review and large-load service coordination with the serving utility (e.g. Entergy Arkansas, SWEPCO, or a cooperative) and/or the Southwest Power Pool (SPP). Utility interconnection is a separate process from land-use permitting.",
    source: {
      id: "ar-permitting-general",
      name: "Arkansas data-center siting — general regulatory context",
      url: "https://www.arkansasedc.com",
      methodology: "General regulatory context compiled from state/local public reporting, not a jurisdiction-specific legal determination.",
    },
  },
});

const LOUISIANA_BUNDLE = buildStandardBundle({
  fetchers: LA_LAYER_FETCHERS,
  hifldTransmission: LA_SOURCES.hifldTransmission,
  hifldUtilityTerritories: LA_SOURCES.hifldUtilityTerritories,
  usDroughtMonitor: LA_SOURCES.usDroughtMonitor,
  interconnectionAuthorityLabel: "MISO",
  environmentalReviewNote:
    "Louisiana has no statewide zoning layer — parish and municipal review, plus coastal/flood permitting (significantly more important here than in most inland states), are the primary gating processes alongside utility large-load coordination with MISO.",
  permittingNote: {
    text: "Large facilities in Louisiana typically require parish or municipal site-plan/zoning review and large-load service coordination with the serving utility (e.g. Entergy Louisiana, Cleco, or SWEPCO) and/or the Midcontinent Independent System Operator (MISO). Coastal and flood-related permitting is a significant additional consideration in much of the state. Utility interconnection is a separate process from land-use permitting.",
    source: {
      id: "la-permitting-general",
      name: "Louisiana data-center siting — general regulatory context",
      url: "https://www.opportunitylouisiana.gov",
      methodology: "General regulatory context compiled from state/local public reporting, not a jurisdiction-specific legal determination.",
    },
  },
});

const MISSISSIPPI_BUNDLE = buildStandardBundle({
  fetchers: MS_LAYER_FETCHERS,
  hifldTransmission: MS_SOURCES.hifldTransmission,
  hifldUtilityTerritories: MS_SOURCES.hifldUtilityTerritories,
  usDroughtMonitor: MS_SOURCES.usDroughtMonitor,
  interconnectionAuthorityLabel: "MISO",
  environmentalReviewNote:
    "Mississippi has no statewide zoning layer — county/municipal site-plan review is the primary local gating process, alongside utility large-load coordination with MISO. Mississippi also offers dedicated Mississippi Development Authority incentives for qualifying data-center enterprises.",
  permittingNote: {
    text: "Large facilities in Mississippi typically require county or municipal site-plan/zoning review and large-load service coordination with the serving utility (e.g. Entergy Mississippi, Mississippi Power, or Cooperative Energy) and/or the Midcontinent Independent System Operator (MISO). Utility interconnection is a separate process from land-use permitting.",
    source: {
      id: "ms-permitting-general",
      name: "Mississippi data-center siting — general regulatory context",
      url: "https://mississippi.org",
      methodology: "General regulatory context compiled from state/local public reporting, not a jurisdiction-specific legal determination.",
    },
  },
});

const ALABAMA_BUNDLE = buildStandardBundle({
  fetchers: AL_LAYER_FETCHERS,
  hifldTransmission: AL_SOURCES.hifldTransmission,
  hifldUtilityTerritories: AL_SOURCES.hifldUtilityTerritories,
  usDroughtMonitor: AL_SOURCES.usDroughtMonitor,
  interconnectionAuthorityLabel: "Alabama Power/TVA",
  environmentalReviewNote:
    "Alabama has no statewide zoning layer — county/municipal site-plan review is the primary local gating process. Alabama operates mostly vertically integrated utility territory (Alabama Power/Southern Company, TVA) rather than a competitive RTO market, so utility coordination happens directly with the serving utility rather than a regional grid operator.",
  permittingNote: {
    text: "Large facilities in Alabama typically require county or municipal site-plan/zoning review and large-load service coordination directly with the serving utility (Alabama Power or the Tennessee Valley Authority, depending on location) — Alabama has no traditional RTO covering the whole state. Alabama also offers Chapter 9B tax-abatement programs specifically for qualifying data-processing centers (revised by Act 2026-573, effective for abatements granted on or after 2027-01-01). Utility interconnection is a separate process from land-use permitting.",
    source: {
      id: "al-permitting-general",
      name: "Alabama data-center siting — general regulatory context",
      url: "https://revenue.alabama.gov",
      methodology: "General regulatory context compiled from state/local public reporting, not a jurisdiction-specific legal determination.",
    },
  },
});

const TENNESSEE_BUNDLE = buildStandardBundle({
  fetchers: TN_LAYER_FETCHERS,
  hifldTransmission: TN_SOURCES.hifldTransmission,
  hifldUtilityTerritories: TN_SOURCES.hifldUtilityTerritories,
  usDroughtMonitor: TN_SOURCES.usDroughtMonitor,
  interconnectionAuthorityLabel: "TVA",
  environmentalReviewNote:
    "Tennessee has no statewide zoning layer — county/municipal site-plan review is the primary local gating process, alongside large-load coordination with the Tennessee Valley Authority (TVA) or a local power company. Tennessee also offers a Qualified Data Center sales/use-tax and electricity-tax incentive program (generally requiring >$100M capital investment and 15+ net new jobs within 3 years).",
  permittingNote: {
    text: "Large facilities in Tennessee typically require county or municipal site-plan/zoning review and large-load service coordination with the Tennessee Valley Authority (TVA) or a local power company (e.g. Nashville Electric Service, Memphis Light Gas & Water, Chattanooga EPB). Utility interconnection is a separate process from land-use permitting.",
    source: {
      id: "tn-permitting-general",
      name: "Tennessee data-center siting — general regulatory context",
      url: "https://www.tn.gov/ecd",
      methodology: "General regulatory context compiled from state/local public reporting, not a jurisdiction-specific legal determination.",
    },
  },
});

const KENTUCKY_BUNDLE = buildStandardBundle({
  fetchers: KY_LAYER_FETCHERS,
  hifldTransmission: KY_SOURCES.hifldTransmission,
  hifldUtilityTerritories: KY_SOURCES.hifldUtilityTerritories,
  usDroughtMonitor: KY_SOURCES.usDroughtMonitor,
  interconnectionAuthorityLabel: "the serving utility (KU/LG&E or TVA)",
  environmentalReviewNote:
    "Kentucky has no statewide zoning layer — county/municipal site-plan review is the primary local gating process, alongside large-load coordination with the serving utility. Kentucky's extensive karst geology can also affect construction and groundwater considerations at a given site.",
  permittingNote: {
    text: "Large facilities in Kentucky typically require county or municipal site-plan/zoning review and large-load service coordination with the serving utility (e.g. Kentucky Utilities, Louisville Gas & Electric, Duke Energy Kentucky, Kentucky Power, or a TVA-served local power company). Utility interconnection is a separate process from land-use permitting.",
    source: {
      id: "ky-permitting-general",
      name: "Kentucky data-center siting — general regulatory context",
      url: "https://ced.ky.gov",
      methodology: "General regulatory context compiled from state/local public reporting, not a jurisdiction-specific legal determination.",
    },
  },
});

const FLORIDA_BUNDLE = buildStandardBundle({
  fetchers: FL_LAYER_FETCHERS,
  hifldTransmission: FL_SOURCES.hifldTransmission,
  hifldUtilityTerritories: FL_SOURCES.hifldUtilityTerritories,
  usDroughtMonitor: FL_SOURCES.usDroughtMonitor,
  interconnectionAuthorityLabel: "the serving utility (FPL, Duke Energy Florida, or TECO)",
  environmentalReviewNote:
    "Florida has no statewide zoning layer — county/municipal site-plan review is the primary local gating process. Flood, hurricane, and storm-surge risk should be weighted heavily in Florida site selection, and consumptive-use water permitting is administered regionally by one of Florida's five Water Management Districts rather than a single statewide agency.",
  permittingNote: {
    text: "Large facilities in Florida typically require county or municipal site-plan/zoning review and large-load service coordination directly with the serving utility (Florida operates largely as a standalone grid rather than a member of a traditional RTO). Florida also offers a sales-tax exemption for qualifying data-center property, administered through a state certification process with investment and critical-IT-load requirements (modified in 2025). Utility interconnection is a separate process from land-use permitting.",
    source: {
      id: "fl-permitting-general",
      name: "Florida data-center siting — general regulatory context",
      url: "https://www.floridajobs.org",
      methodology: "General regulatory context compiled from state/local public reporting, not a jurisdiction-specific legal determination.",
    },
  },
});

const GEORGIA_BUNDLE = buildStandardBundle({
  fetchers: GA_LAYER_FETCHERS,
  hifldTransmission: GA_SOURCES.hifldTransmission,
  hifldUtilityTerritories: GA_SOURCES.hifldUtilityTerritories,
  usDroughtMonitor: GA_SOURCES.usDroughtMonitor,
  interconnectionAuthorityLabel: "the serving utility (Georgia Power or an EMC)",
  environmentalReviewNote:
    "Georgia has no statewide zoning layer — county/municipal site-plan review is the primary local gating process. Georgia operates mostly vertically integrated utility territory (Georgia Power, EMCs, municipal systems) governed by the Georgia Territorial Electric Service Act rather than a competitive RTO market.",
  permittingNote: {
    text: "Large facilities in Georgia typically require county or municipal site-plan/zoning review and large-load service coordination directly with the serving utility (Georgia Power or an Electric Membership Corporation) — Georgia has no traditional RTO covering the whole state. Georgia also offers a High-Technology Data Center Equipment sales/use-tax exemption administered by the Department of Revenue, subject to investment and job-creation requirements. Utility interconnection is a separate process from land-use permitting.",
    source: {
      id: "ga-permitting-general",
      name: "Georgia data-center siting — general regulatory context",
      url: "https://www.georgia.org",
      methodology: "General regulatory context compiled from state/local public reporting, not a jurisdiction-specific legal determination.",
    },
  },
});

const SOUTH_CAROLINA_BUNDLE = buildStandardBundle({
  fetchers: SC_LAYER_FETCHERS,
  hifldTransmission: SC_SOURCES.hifldTransmission,
  hifldUtilityTerritories: SC_SOURCES.hifldUtilityTerritories,
  usDroughtMonitor: SC_SOURCES.usDroughtMonitor,
  interconnectionAuthorityLabel: "the serving utility (Dominion Energy, Duke Energy, or Santee Cooper)",
  environmentalReviewNote:
    "South Carolina has no statewide zoning layer — county/municipal site-plan review is the primary local gating process, alongside large-load coordination directly with the serving utility (the state is not fully organized under a traditional RTO). Coastal development should include hurricane and storm-surge resilience analysis.",
  permittingNote: {
    text: "Large facilities in South Carolina typically require county or municipal site-plan/zoning review and large-load service coordination with the serving utility (Dominion Energy South Carolina, Duke Energy, Santee Cooper, or a cooperative). South Carolina also offers sales/use-tax exemptions for qualifying data centers, plus county-level Fee-In-Lieu-of-Tax (FILOT) arrangements. Utility interconnection is a separate process from land-use permitting.",
    source: {
      id: "sc-permitting-general",
      name: "South Carolina data-center siting — general regulatory context",
      url: "https://www.sccommerce.com",
      methodology: "General regulatory context compiled from state/local public reporting, not a jurisdiction-specific legal determination.",
    },
  },
});

const NORTH_CAROLINA_BUNDLE = buildStandardBundle({
  fetchers: NC_LAYER_FETCHERS,
  hifldTransmission: NC_SOURCES.hifldTransmission,
  hifldUtilityTerritories: NC_SOURCES.hifldUtilityTerritories,
  usDroughtMonitor: NC_SOURCES.usDroughtMonitor,
  interconnectionAuthorityLabel: "the serving utility (Duke Energy or Dominion Energy)",
  environmentalReviewNote:
    "North Carolina has no statewide zoning layer — county/municipal site-plan review is the primary local gating process, alongside large-load coordination directly with the serving utility. Hurricane-driven inland flooding is a significant planning consideration in eastern North Carolina.",
  permittingNote: {
    text: "Large facilities in North Carolina typically require county or municipal site-plan/zoning review and large-load service coordination with the serving utility (Duke Energy Carolinas/Progress or Dominion Energy North Carolina). North Carolina offers sales/use-tax exemptions for qualifying data-center equipment (Commerce-certified), though it repealed the exemption on electricity used by qualifying data centers. Utility interconnection is a separate process from land-use permitting.",
    source: {
      id: "nc-permitting-general",
      name: "North Carolina data-center siting — general regulatory context",
      url: "https://www.edpnc.com",
      methodology: "General regulatory context compiled from state/local public reporting, not a jurisdiction-specific legal determination.",
    },
  },
});

const VIRGINIA_BUNDLE = buildStandardBundle({
  fetchers: VA_LAYER_FETCHERS,
  hifldTransmission: VA_SOURCES.hifldTransmission,
  hifldUtilityTerritories: VA_SOURCES.hifldUtilityTerritories,
  usDroughtMonitor: VA_SOURCES.usDroughtMonitor,
  interconnectionAuthorityLabel: "PJM",
  environmentalReviewNote:
    "Virginia has no statewide zoning layer — county/municipal site-plan review is the primary local gating process, alongside large-load coordination with PJM Interconnection and the serving utility. Power availability and transmission deliverability have become significant siting factors given Northern Virginia's exceptional data-center growth.",
  permittingNote: {
    text: "Large facilities in Virginia typically require county or municipal site-plan/zoning review and large-load service coordination with the serving utility (Dominion Energy Virginia or Appalachian Power) and PJM Interconnection. Virginia offers the Data Center Retail Sales and Use Tax Exemption (DCRSUT), generally requiring a Memorandum of Understanding with the Virginia Economic Development Partnership (VEDP) plus qualifying investment and job creation; a temporary electricity-consumption tax also began in 2026. Utility interconnection is a separate process from land-use permitting.",
    source: {
      id: "va-permitting-general",
      name: "Virginia data-center siting — general regulatory context",
      url: "https://www.vedp.org",
      methodology: "General regulatory context compiled from state/local public reporting, not a jurisdiction-specific legal determination.",
    },
  },
});

const WEST_VIRGINIA_BUNDLE = buildStandardBundle({
  fetchers: WV_LAYER_FETCHERS,
  hifldTransmission: WV_SOURCES.hifldTransmission,
  hifldUtilityTerritories: WV_SOURCES.hifldUtilityTerritories,
  usDroughtMonitor: WV_SOURCES.usDroughtMonitor,
  interconnectionAuthorityLabel: "PJM",
  environmentalReviewNote:
    "West Virginia has no statewide zoning layer — county/municipal site-plan review is the primary local gating process, alongside large-load coordination with PJM Interconnection and the serving utility. West Virginia markets itself as a lower-cost alternative to Northern Virginia, with the Eastern Panhandle (Berkeley/Jefferson counties) the primary growth corridor.",
  permittingNote: {
    text: "Large facilities in West Virginia typically require county or municipal site-plan/zoning review and large-load service coordination with the serving utility (Appalachian Power, Monongahela Power, Potomac Edison, or Wheeling Power) and PJM Interconnection. West Virginia has enacted high-impact data-center legislation with special property-tax valuation treatment and sales-tax exemptions on qualifying technology equipment. Utility interconnection is a separate process from land-use permitting.",
    source: {
      id: "wv-permitting-general",
      name: "West Virginia data-center siting — general regulatory context",
      url: "https://westvirginia.gov",
      methodology: "General regulatory context compiled from state/local public reporting, not a jurisdiction-specific legal determination.",
    },
  },
});

const MARYLAND_BUNDLE = buildStandardBundle({
  fetchers: MD_LAYER_FETCHERS,
  hifldTransmission: MD_SOURCES.hifldTransmission,
  hifldUtilityTerritories: MD_SOURCES.hifldUtilityTerritories,
  usDroughtMonitor: MD_SOURCES.usDroughtMonitor,
  interconnectionAuthorityLabel: "PJM",
  environmentalReviewNote:
    "Maryland has no statewide zoning layer — county/municipal site-plan review is the primary local gating process, alongside large-load coordination with PJM Interconnection and the serving utility. Maryland recently enacted large-load-customer registration and reporting requirements.",
  permittingNote: {
    text: "Large facilities in Maryland typically require county or municipal site-plan/zoning review and large-load service coordination with the serving utility (BGE, Pepco, Delmarva Power, Potomac Edison, or SMECO) and PJM Interconnection. Maryland offers the Data Center Maryland Sales and Use Tax Exemption Incentive Program, generally requiring Commerce certification, at least five qualified positions, and minimum investment, with a 10-20 year benefit period. Utility interconnection is a separate process from land-use permitting.",
    source: {
      id: "md-permitting-general",
      name: "Maryland data-center siting — general regulatory context",
      url: "https://commerce.maryland.gov",
      methodology: "General regulatory context compiled from state/local public reporting, not a jurisdiction-specific legal determination.",
    },
  },
});

const TEXAS_BUNDLE: StateGisBundle = {
  fetchers: TX_LAYER_FETCHERS,
  transmissionSource: TX_SOURCES.hifldTransmission,
  utilityTerritorySource: TX_SOURCES.hifldUtilityTerritories,
  utilityTerritoryCaveats: [STANDARD_HIFLD_UTILITY_CAVEAT],
  // Texas is the one state in this integration with a real, live statewide
  // water-rights points layer (TCEQ's Water Rights Viewer) — see sources.ts.
  waterRightsSource: TX_SOURCES.tceqWaterRights,
  droughtSource: TX_SOURCES.usDroughtMonitor,
  interconnectionAuthorityLabel: "ERCOT",
  environmentalReviewNote:
    "Texas has no statewide zoning layer — county/municipal site-plan review is the primary local gating process. Most of Texas operates within ERCOT, a standalone grid outside the traditional RTO structure — whether a site is inside or outside ERCOT is a major siting factor, and water availability varies significantly by region and should be evaluated site-by-site.",
  permittingNote: {
    text: "Large facilities in Texas typically require county or municipal site-plan/zoning review and large-load service coordination with the serving utility (e.g. Oncor, CenterPoint Energy, AEP Texas, or a municipal/cooperative provider) and ERCOT (or the applicable non-ERCOT interconnection, in parts of the state outside ERCOT). Texas offers a statewide sales-tax exemption for qualifying data centers (≥100,000 sq ft) and a separate certification path for qualifying large data-center projects, both administered by the Texas Comptroller. Utility interconnection is a separate process from land-use permitting.",
    source: {
      id: "tx-permitting-general",
      name: "Texas data-center siting — general regulatory context",
      url: "https://comptroller.texas.gov",
      methodology: "General regulatory context compiled from state/local public reporting, not a jurisdiction-specific legal determination.",
    },
  },
  roads: null,
};

const DELAWARE_BUNDLE = buildStandardBundle({
  fetchers: DE_LAYER_FETCHERS,
  hifldTransmission: DE_SOURCES.hifldTransmission,
  hifldUtilityTerritories: DE_SOURCES.hifldUtilityTerritories,
  usDroughtMonitor: DE_SOURCES.usDroughtMonitor,
  interconnectionAuthorityLabel: "PJM",
  environmentalReviewNote:
    "Delaware has no statewide zoning layer — county/municipal site-plan review is the primary local gating process, alongside large-load coordination with PJM Interconnection and the serving utility. Delaware's small, compact geography and coastal/bay exposure make flood risk an important site-specific consideration.",
  permittingNote: {
    text: "Large facilities in Delaware typically require county or municipal site-plan/zoning review and large-load service coordination with the serving utility (Delmarva Power or the Delaware Electric Cooperative) and PJM Interconnection. Delaware does not have a dedicated statewide data-center tax-incentive program comparable to neighboring states — general economic-development and technology-investment programs would need project-by-project review. Utility interconnection is a separate process from land-use permitting.",
    source: {
      id: "de-permitting-general",
      name: "Delaware data-center siting — general regulatory context",
      url: "https://business.delaware.gov",
      methodology: "General regulatory context compiled from state/local public reporting, not a jurisdiction-specific legal determination.",
    },
  },
});

const MISSOURI_BUNDLE = buildStandardBundle({
  fetchers: MO_LAYER_FETCHERS,
  hifldTransmission: MO_SOURCES.hifldTransmission,
  hifldUtilityTerritories: MO_SOURCES.hifldUtilityTerritories,
  usDroughtMonitor: MO_SOURCES.usDroughtMonitor,
  interconnectionAuthorityLabel: "MISO/SPP",
  environmentalReviewNote:
    "Missouri has no statewide zoning database, so county/municipal land-use review remains site-specific. Flood exposure along the Missouri and Mississippi river corridors and New Madrid seismic risk in southeast Missouri should be screened alongside Missouri DNR environmental constraints.",
  permittingNote: {
    text: "Large facilities in Missouri typically require county or municipal site-plan/zoning review plus large-load coordination with the serving utility. Missouri spans both MISO and SPP footprints, so the applicable grid-planning process depends on the site and utility. The Missouri Data Center Sales Tax Exemption is a potential incentive only; project eligibility must be verified separately.",
    source: {
      id: "mo-permitting-general",
      name: "Missouri data-center siting — general regulatory context",
      url: "https://ded.mo.gov/",
      methodology: "General state/local regulatory context; not a jurisdiction-specific legal determination or utility capacity finding.",
    },
  },
});

const ILLINOIS_BUNDLE = buildStandardBundle({
  fetchers: IL_LAYER_FETCHERS,
  hifldTransmission: IL_SOURCES.hifldTransmission,
  hifldUtilityTerritories: IL_SOURCES.hifldUtilityTerritories,
  usDroughtMonitor: IL_SOURCES.usDroughtMonitor,
  interconnectionAuthorityLabel: "MISO/PJM",
  environmentalReviewNote:
    "Illinois has no statewide zoning layer, so municipality/county land-use review remains site-specific. Illinois also spans both MISO and PJM planning regions, and large-load service must be coordinated with the serving utility and applicable regional transmission organization. Data-center incentive policy is under active review in 2026.",
  permittingNote: {
    text: "Large facilities in Illinois typically require municipal or county zoning/site-plan review plus large-load coordination with the serving utility (such as ComEd, Ameren Illinois, MidAmerican Energy, a municipal utility, or a cooperative) and the applicable MISO or PJM process. Illinois Data Center Investment Program processing for new agreements was paused beginning July 1, 2026 while policy reforms are considered. Utility interconnection is separate from land-use permitting.",
    source: {
      id: "il-permitting-general",
      name: "Illinois data-center siting — general regulatory context",
      url: "https://dceo.illinois.gov/expandrelocate/incentives/datacenters.html",
      methodology: "General statewide regulatory context from Illinois public sources; not a jurisdiction-specific legal determination.",
    },
  },
});

const MAINE_BUNDLE = buildStandardBundle({
  fetchers: ME_LAYER_FETCHERS,
  hifldTransmission: ME_SOURCES.hifldTransmission,
  hifldUtilityTerritories: ME_SOURCES.hifldUtilityTerritories,
  usDroughtMonitor: ME_SOURCES.usDroughtMonitor,
  interconnectionAuthorityLabel: "ISO-NE",
  environmentalReviewNote:
    "Maine has no statewide zoning layer — municipal site-plan/land-use review is the primary local gating process, alongside large-load coordination with ISO New England and the serving utility. Maine's 2026 legislative session actively debated data-center energy, water, and tax-policy issues, so regulatory status should be reverified close to any siting decision.",
  permittingNote: {
    text: "Large facilities in Maine typically require municipal site-plan/zoning review and large-load service coordination with the serving utility (Central Maine Power, Versant Power, Eastern Maine Electric Cooperative, or another cooperative) and ISO New England. Maine enacted 2026 legislation excluding qualifying data centers from the Business Equipment Tax Exemption (BETE) and the Dirigo Business Incentives Program for certain future projects — general economic-development programs would need project-by-project review. Utility interconnection is a separate process from land-use permitting.",
    source: {
      id: "me-permitting-general",
      name: "Maine data-center siting — general regulatory context",
      url: "https://www.maine.gov",
      methodology: "General regulatory context compiled from state/local public reporting, not a jurisdiction-specific legal determination.",
    },
  },
});

const NEW_HAMPSHIRE_BUNDLE = buildStandardBundle({
  fetchers: NH_LAYER_FETCHERS,
  hifldTransmission: NH_SOURCES.hifldTransmission,
  hifldUtilityTerritories: NH_SOURCES.hifldUtilityTerritories,
  usDroughtMonitor: NH_SOURCES.usDroughtMonitor,
  interconnectionAuthorityLabel: "ISO-NE",
  environmentalReviewNote:
    "New Hampshire has no statewide zoning layer — municipal site-plan/zoning review is the primary local gating process, alongside large-load coordination with ISO New England and the serving utility. Southern New Hampshire's proximity to Greater Boston is a notable siting advantage.",
  permittingNote: {
    text: "Large facilities in New Hampshire typically require municipal site-plan/zoning review and large-load service coordination with the serving utility (Eversource Energy New Hampshire, Unitil, New Hampshire Electric Cooperative, or Liberty Utilities) and ISO New England. No major statewide dedicated data-center tax exemption was identified from baseline research; general Business Finance Authority and economic-development programs would need project-by-project review. Utility interconnection is a separate process from land-use permitting.",
    source: {
      id: "nh-permitting-general",
      name: "New Hampshire data-center siting — general regulatory context",
      url: "https://www.puc.nh.gov",
      methodology: "General regulatory context compiled from state/local public reporting, not a jurisdiction-specific legal determination.",
    },
  },
});

const VERMONT_BUNDLE = buildStandardBundle({
  fetchers: VT_LAYER_FETCHERS,
  hifldTransmission: VT_SOURCES.hifldTransmission,
  hifldUtilityTerritories: VT_SOURCES.hifldUtilityTerritories,
  usDroughtMonitor: VT_SOURCES.usDroughtMonitor,
  interconnectionAuthorityLabel: "ISO-NE",
  environmentalReviewNote:
    "Vermont has no statewide zoning system, though many municipalities and regional planning commissions publish local zoning GIS layers — municipal review is the primary local gating process, alongside large-load coordination with ISO New England and the serving utility. Vermont's smaller electric market and generation portfolio favor edge, sustainability-focused, and moderate-scale facilities over hyperscale campuses.",
  permittingNote: {
    text: "Large facilities in Vermont typically require municipal site-plan/zoning review and large-load service coordination with the serving utility (Green Mountain Power, Vermont Electric Cooperative, Burlington Electric Department, Washington Electric Cooperative, or another municipal utility) and ISO New England. Vermont does not currently maintain a dedicated data-center-specific tax incentive program; general programs such as the Vermont Employment Growth Incentive (VEGI) would need project-by-project review. Utility interconnection is a separate process from land-use permitting.",
    source: {
      id: "vt-permitting-general",
      name: "Vermont data-center siting — general regulatory context",
      url: "https://publicservice.vermont.gov",
      methodology: "General regulatory context compiled from state/local public reporting, not a jurisdiction-specific legal determination.",
    },
  },
});

const MASSACHUSETTS_BUNDLE = buildStandardBundle({
  fetchers: MA_LAYER_FETCHERS,
  hifldTransmission: MA_SOURCES.hifldTransmission,
  hifldUtilityTerritories: MA_SOURCES.hifldUtilityTerritories,
  usDroughtMonitor: MA_SOURCES.usDroughtMonitor,
  interconnectionAuthorityLabel: "ISO-NE",
  environmentalReviewNote:
    "Massachusetts has no statewide zoning layer — municipal site-plan/zoning review is the primary local gating process, alongside large-load coordination with ISO New England and the serving utility. Massachusetts electricity prices are often among the highest in the continental United States, which should be weighted heavily in siting and cost analysis.",
  permittingNote: {
    text: "Large facilities in Massachusetts typically require municipal site-plan/zoning review and large-load service coordination with the serving utility (Eversource Energy, National Grid, Unitil, or a Municipal Light Plant) and ISO New England. Massachusetts created a Qualified Data Center Sales and Use Tax Exemption offering up to a 20-year exemption for approved projects, but the Executive Office of Economic Development paused acceptance of new applications on 2026-06-25 pending further regulatory review — treat as a potential incentive only until applications reopen. Utility interconnection is a separate process from land-use permitting.",
    source: {
      id: "ma-permitting-general",
      name: "Massachusetts data-center siting — general regulatory context",
      url: "https://www.mass.gov",
      methodology: "General regulatory context compiled from state/local public reporting, not a jurisdiction-specific legal determination.",
    },
  },
});

const OREGON_BUNDLE = {
  ...buildStandardBundle({
    fetchers: OR_LAYER_FETCHERS,
    hifldTransmission: OR_SOURCES.hifldTransmission,
    hifldUtilityTerritories: OR_SOURCES.hifldUtilityTerritories,
    usDroughtMonitor: OR_SOURCES.usDroughtMonitor,
    interconnectionAuthorityLabel: "BPA and the serving utility (PGE, Pacific Power, Idaho Power, or a consumer-owned utility)",
    environmentalReviewNote:
      "Oregon has no statewide zoning layer - county/municipal land-use review and utility large-load coordination are the primary gating processes. Oregon's 2026 moratorium on new data-center eligibility for portions of the Enterprise Zone property-tax incentive (effective 2026-06-05) and the state Data Center Advisory Committee make current policy status important to verify. Oregon has no general statewide sales tax.",
    permittingNote: {
      text: "Large facilities in Oregon typically require county or municipal land-use/site-plan review (Oregon has no statewide zoning layer) and large-load service coordination with the serving utility and, for the federal system, Bonneville Power Administration (BPA). Potential incentives (e.g. the Strategic Investment Program) may be available but eligibility must be verified; new data-center eligibility for portions of the Enterprise Zone program is affected by a moratorium effective 2026-06-05. Utility interconnection is a separate process from land-use permitting.",
      source: {
        id: "or-permitting-general",
        name: "Oregon data-center siting - general regulatory context",
        url: "https://www.oregon.gov/energy",
        methodology: "General regulatory context compiled from state/local public reporting, not a jurisdiction-specific legal determination.",
      },
    },
  }),
  utilityTerritorySource: OR_SOURCES.odoeUtilityAreas,
  utilityTerritoryCaveats: [
    "Boundary is the Oregon Department of Energy's statewide electric service-area layer - informational, may overlap between utilities, and is not an official service-territory determination.",
  ],
};

const CALIFORNIA_BUNDLE = {
  ...buildStandardBundle({
    fetchers: CA_LAYER_FETCHERS,
    hifldTransmission: CA_SOURCES.hifldTransmission,
    hifldUtilityTerritories: CA_SOURCES.hifldUtilityTerritories,
    usDroughtMonitor: CA_SOURCES.usDroughtMonitor,
    interconnectionAuthorityLabel: "CAISO and the serving utility (PG&E, SCE, SDG&E, or a municipal utility)",
    environmentalReviewNote:
      "California has no statewide zoning layer - city/county review plus CEQA environmental review are the primary gating processes alongside utility and CAISO large-load coordination. Groundwater sustainability (SGMA), wildfire, and seismic exposure are significant siting considerations.",
    permittingNote: {
      text: "Large facilities in California typically require city or county land-use approval and California Environmental Quality Act (CEQA) review, plus large-load service coordination with the serving utility and, where applicable, the California ISO (CAISO). No enacted statewide data-center-specific tax incentive was identified in the supplied research (SB 58 was proposed but not enacted as a statewide program). Utility interconnection is a separate process from land-use permitting.",
      source: {
        id: "ca-permitting-general",
        name: "California data-center siting - general regulatory context",
        url: "https://business.ca.gov",
        methodology: "General regulatory context compiled from state/local public reporting, not a jurisdiction-specific legal determination.",
      },
    },
  }),
  utilityTerritorySource: CA_SOURCES.cecUtilityAreas,
  utilityTerritoryCaveats: [
    "Boundary is the California Energy Commission's IOU/POU service-area layer - per the CEC, boundaries are approximate and not an official service determination. Community choice aggregators (which procure power but do not own the wires) are not represented.",
  ],
};

const ALASKA_BUNDLE = {
  ...buildStandardBundle({
    fetchers: AK_LAYER_FETCHERS,
    hifldTransmission: AK_SOURCES.hifldTransmission,
    hifldUtilityTerritories: AK_SOURCES.hifldUtilityTerritories,
    usDroughtMonitor: AK_SOURCES.usDroughtMonitor,
    interconnectionAuthorityLabel: "the serving utility (e.g. Chugach Electric, Golden Valley Electric, MEA, HEA, or AEL&P)",
    environmentalReviewNote:
      "Alaska has no statewide zoning layer and no organized RTO/ISO market - borough/municipal review and direct utility engagement are the primary gating processes. Alaska has no statewide sales tax, though local sales taxes may apply. Permafrost, seismic activity, and remote logistics are major siting considerations.",
    permittingNote: {
      text: "Large facilities in Alaska typically require borough or municipal land-use review and direct large-load coordination with the serving utility - Alaska is not part of any organized Lower-48 market and its grids are regional (chiefly the Railbelt). Potential economic-development incentives may exist but eligibility must be verified. Utility interconnection is a separate process from land-use permitting.",
      source: {
        id: "ak-permitting-general",
        name: "Alaska data-center siting - general regulatory context",
        url: "https://www.commerce.alaska.gov",
        methodology: "General regulatory context compiled from state/local public reporting, not a jurisdiction-specific legal determination.",
      },
    },
  }),
};

const HAWAII_BUNDLE = buildStandardBundle({
  fetchers: HI_LAYER_FETCHERS,
  hifldTransmission: HI_SOURCES.hifldTransmission,
  hifldUtilityTerritories: HI_SOURCES.hifldUtilityTerritories,
  usDroughtMonitor: HI_SOURCES.usDroughtMonitor,
  interconnectionAuthorityLabel: "the serving island utility (HECO, HELCO, MECO, or KIUC)",
  environmentalReviewNote:
    "Hawaii has no statewide zoning layer - county review is required, and each island operates a separate grid. Water use is permitted through the Commission on Water Resource Management (CWRM). Hurricane, tsunami, coastal flooding and salt-air corrosion are major siting considerations. Hawaii uses a General Excise Tax rather than a sales tax; no active statewide data-center-specific incentive was identified.",
  permittingNote: {
    text: "Large facilities in Hawaii typically require county land-use/zoning review and large-load coordination directly with the island's electric utility (HECO, HELCO, MECO or KIUC) - island grids are isolated and not interconnected. No active statewide data-center-specific tax incentive was identified. Utility interconnection is a separate process from land-use permitting.",
    source: {
      id: "hi-permitting-general",
      name: "Hawaii data-center siting - general regulatory context",
      url: "https://puc.hawaii.gov",
      methodology: "General regulatory context compiled from state/local public reporting, not a jurisdiction-specific legal determination.",
    },
  },
});

const IDAHO_BUNDLE = buildStandardBundle({
  fetchers: ID_LAYER_FETCHERS,
  hifldTransmission: ID_SOURCES.hifldTransmission,
  hifldUtilityTerritories: ID_SOURCES.hifldUtilityTerritories,
  usDroughtMonitor: ID_SOURCES.usDroughtMonitor,
  interconnectionAuthorityLabel: "the serving utility (Idaho Power, Avista, or Rocky Mountain Power)",
  environmentalReviewNote:
    "Idaho has no statewide zoning layer - county/municipal review and large-load coordination with the serving utility are the primary gating processes. Water rights are administered by the Idaho Department of Water Resources under prior appropriation. Wildfire and drought are high-relevance hazards.",
  permittingNote: {
    text: "Large facilities in Idaho typically require county or municipal site-plan/zoning review (no statewide zoning layer) and large-load service coordination with the serving utility (Idaho Power, Avista, Rocky Mountain Power, or a cooperative). Incentive eligibility must be verified project by project. Utility interconnection is a separate process from land-use permitting.",
    source: {
      id: "id-permitting-general",
      name: "Idaho data-center siting - general regulatory context",
      url: "https://commerce.idaho.gov",
      methodology: "General regulatory context compiled from state/local public reporting, not a jurisdiction-specific legal determination.",
    },
  },
});

const MONTANA_BUNDLE = buildStandardBundle({
  fetchers: MT_LAYER_FETCHERS,
  hifldTransmission: MT_SOURCES.hifldTransmission,
  hifldUtilityTerritories: MT_SOURCES.hifldUtilityTerritories,
  usDroughtMonitor: MT_SOURCES.usDroughtMonitor,
  interconnectionAuthorityLabel: "the serving utility (NorthWestern Energy, Montana-Dakota Utilities, or a cooperative)",
  environmentalReviewNote:
    "Montana has no statewide zoning layer - county/municipal review and large-load coordination with the serving utility are the primary gating processes. Missoula County adopted interim zoning restrictions on new or expanded data centers outside city limits (reported through July 2027) - verify current local status. Montana has no general statewide sales tax and offers Class 17 property-tax treatment for qualified data-center property.",
  permittingNote: {
    text: "Large facilities in Montana typically require county or municipal zoning/site-plan review and large-load coordination with the serving utility (NorthWestern Energy, Montana-Dakota Utilities, or a cooperative). Montana has no general sales tax and offers Class 17 property-tax treatment for qualified data-center property (eligibility must be verified); Missoula County has interim data-center zoning restrictions. Water use requires a recorded right through DNRC. Utility interconnection is a separate process from land-use permitting.",
    source: {
      id: "mt-permitting-general",
      name: "Montana data-center siting - general regulatory context",
      url: "https://commerce.mt.gov",
      methodology: "General regulatory context compiled from state/local public reporting, not a jurisdiction-specific legal determination.",
    },
  },
});

const WYOMING_BUNDLE = buildStandardBundle({
  fetchers: WY_LAYER_FETCHERS,
  hifldTransmission: WY_SOURCES.hifldTransmission,
  hifldUtilityTerritories: WY_SOURCES.hifldUtilityTerritories,
  usDroughtMonitor: WY_SOURCES.usDroughtMonitor,
  interconnectionAuthorityLabel: "the serving utility (Rocky Mountain Power, Black Hills Energy, or a cooperative)",
  environmentalReviewNote:
    "Wyoming has no statewide zoning layer - county/municipal review and large-load coordination with the serving utility are the primary gating processes. Water rights are administered by the State Engineer's Office under prior appropriation. Wyoming offers a certified data-center sales/use-tax exemption program (investment thresholds apply) and has no corporate income tax.",
  permittingNote: {
    text: "Large facilities in Wyoming typically require county or municipal site-plan/zoning review and large-load coordination with the serving utility (Rocky Mountain Power, Black Hills Energy, or a cooperative). Wyoming offers a data-center sales/use-tax exemption certified through the Wyoming Business Council (statutory investment thresholds apply; eligibility must be verified). Utility interconnection is a separate process from land-use permitting.",
    source: {
      id: "wy-permitting-general",
      name: "Wyoming data-center siting - general regulatory context",
      url: "https://wyomingbusiness.org",
      methodology: "General regulatory context compiled from state/local public reporting, not a jurisdiction-specific legal determination.",
    },
  },
});

const RHODE_ISLAND_BUNDLE = buildStandardBundle({
  fetchers: RI_LAYER_FETCHERS,
  hifldTransmission: RI_SOURCES.hifldTransmission,
  hifldUtilityTerritories: RI_SOURCES.hifldUtilityTerritories,
  usDroughtMonitor: RI_SOURCES.usDroughtMonitor,
  interconnectionAuthorityLabel: "ISO-NE",
  environmentalReviewNote:
    "Rhode Island has no statewide zoning layer — municipal site-plan/zoning review is the primary local gating process, alongside large-load coordination with ISO New England and the serving utility (Rhode Island Energy). Rhode Island's compact geography simplifies utility analysis, but coastal resiliency and flood exposure should be weighted more heavily than in inland states.",
  permittingNote: {
    text: "Large facilities in Rhode Island typically require municipal site-plan/zoning review and large-load service coordination with Rhode Island Energy (the state's dominant utility) and ISO New England. No major statewide dedicated data-center tax exemption was identified from baseline research; general Commerce RI incentives and local tax-stabilization agreements would need project-by-project review. Utility interconnection is a separate process from land-use permitting.",
    source: {
      id: "ri-permitting-general",
      name: "Rhode Island data-center siting — general regulatory context",
      url: "https://commerceri.com",
      methodology: "General regulatory context compiled from state/local public reporting, not a jurisdiction-specific legal determination.",
    },
  },
});

const CONNECTICUT_BUNDLE = buildStandardBundle({
  fetchers: CT_LAYER_FETCHERS,
  hifldTransmission: CT_SOURCES.hifldTransmission,
  hifldUtilityTerritories: CT_SOURCES.hifldUtilityTerritories,
  usDroughtMonitor: CT_SOURCES.usDroughtMonitor,
  interconnectionAuthorityLabel: "ISO-NE",
  environmentalReviewNote:
    "Connecticut has no statewide zoning layer — municipal site-plan/zoning review is the primary local gating process, alongside large-load coordination with ISO New England and the serving utility (Eversource Energy or United Illuminating).",
  permittingNote: {
    text: "Large facilities in Connecticut typically require municipal site-plan/zoning review and large-load service coordination with the serving utility (Eversource Energy or United Illuminating) and ISO New England. Connecticut operates a Data Center Tax Incentive Program (DECD) offering sales/use-tax and property-tax exemptions for qualifying projects meeting published investment thresholds ($50M in opportunity/enterprise zones, $200M elsewhere), with 20-30 year agreement terms — eligibility must be verified project by project. Utility interconnection is a separate process from land-use permitting.",
    source: {
      id: "ct-permitting-general",
      name: "Connecticut data-center siting — general regulatory context",
      url: "https://portal.ct.gov",
      methodology: "General regulatory context compiled from state/local public reporting, not a jurisdiction-specific legal determination.",
    },
  },
});

const NEW_YORK_BUNDLE = buildStandardBundle({
  fetchers: NY_LAYER_FETCHERS,
  hifldTransmission: NY_SOURCES.hifldTransmission,
  hifldUtilityTerritories: NY_SOURCES.hifldUtilityTerritories,
  usDroughtMonitor: NY_SOURCES.usDroughtMonitor,
  interconnectionAuthorityLabel: "NYISO",
  environmentalReviewNote:
    "New York has no statewide zoning layer — municipality-level review is the primary local gating process, alongside large-load coordination with the New York Independent System Operator (NYISO) and the serving utility. New York's energy and environmental regulatory framework is more complex than many peer states and should be reverified close to any siting decision.",
  permittingNote: {
    text: "Large facilities in New York typically require municipal land-use/zoning review and large-load service coordination with the serving utility (e.g. Con Edison, National Grid, NYSEG, RG&E, Central Hudson, Orange & Rockland, or LIPA) and NYISO. Potential incentives may be available through Empire State Development programs or local Industrial Development Agencies (IDAs), but eligibility must be verified project by project. Utility interconnection is a separate process from land-use permitting.",
    source: {
      id: "ny-permitting-general",
      name: "New York data-center siting — general regulatory context",
      url: "https://esd.ny.gov",
      methodology: "General regulatory context compiled from state/local public reporting, not a jurisdiction-specific legal determination.",
    },
  },
});

const NEW_JERSEY_BUNDLE = buildStandardBundle({
  fetchers: NJ_LAYER_FETCHERS,
  hifldTransmission: NJ_SOURCES.hifldTransmission,
  hifldUtilityTerritories: NJ_SOURCES.hifldUtilityTerritories,
  usDroughtMonitor: NJ_SOURCES.usDroughtMonitor,
  interconnectionAuthorityLabel: "PJM",
  environmentalReviewNote:
    "New Jersey has no statewide zoning dataset — municipal review is the primary local gating process, alongside large-load coordination with PJM Interconnection and the serving utility. New Jersey has one of the most active data-center policy environments in 2025-2026 (including the 2026 End Data Center Tax Credits Act), so regulatory and incentive status should be reverified close to any siting decision.",
  permittingNote: {
    text: "Large facilities in New Jersey typically require municipal site-plan/zoning review and large-load service coordination with the serving utility (PSE&G, JCP&L, Atlantic City Electric, Rockland Electric, or a municipal/cooperative system) and PJM. New Jersey enacted the End Data Center Tax Credits Act in August 2026, eliminating the remaining allocation of certain AI data-center tax credits under the Next NJ Program; general NJEDA and local PILOT programs would need project-by-project review. Utility interconnection is a separate process from land-use permitting.",
    source: {
      id: "nj-permitting-general",
      name: "New Jersey data-center siting — general regulatory context",
      url: "https://nj.gov/njbusiness",
      methodology: "General regulatory context compiled from state/local public reporting, not a jurisdiction-specific legal determination.",
    },
  },
});

const PENNSYLVANIA_BUNDLE = buildStandardBundle({
  fetchers: PA_LAYER_FETCHERS,
  hifldTransmission: PA_SOURCES.hifldTransmission,
  hifldUtilityTerritories: PA_SOURCES.hifldUtilityTerritories,
  usDroughtMonitor: PA_SOURCES.usDroughtMonitor,
  interconnectionAuthorityLabel: "PJM",
  environmentalReviewNote:
    "Pennsylvania has no statewide zoning layer — county/municipal review is the primary local gating process, alongside large-load coordination with PJM Interconnection and the serving utility. Pennsylvania is one of PJM's most important generation and transmission states, but its Computer Data Center Equipment Exemption Program is subject to active legislative debate and possible repeal.",
  permittingNote: {
    text: "Large facilities in Pennsylvania typically require county or municipal site-plan/zoning review and large-load service coordination with the serving utility (PECO, PPL Electric Utilities, Duquesne Light, West Penn Power, Met-Ed, Penelec, Penn Power, or UGI Electric) and PJM. Pennsylvania's Computer Data Center Equipment Exemption Program provides a sales/use-tax exemption for qualifying certified data-center equipment (effective 2022), though 2026 bills have proposed repealing it — treat as a potential incentive only until current status is confirmed. Utility interconnection is a separate process from land-use permitting.",
    source: {
      id: "pa-permitting-general",
      name: "Pennsylvania data-center siting — general regulatory context",
      url: "https://pa.gov",
      methodology: "General regulatory context compiled from state/local public reporting, not a jurisdiction-specific legal determination.",
    },
  },
});

const OHIO_BUNDLE = buildStandardBundle({
  fetchers: OH_LAYER_FETCHERS,
  hifldTransmission: OH_SOURCES.hifldTransmission,
  hifldUtilityTerritories: OH_SOURCES.hifldUtilityTerritories,
  usDroughtMonitor: OH_SOURCES.usDroughtMonitor,
  interconnectionAuthorityLabel: "PJM (with limited MISO influence near the western border)",
  environmentalReviewNote:
    "Ohio has no statewide zoning coverage — township/county/municipal review is the primary local gating process, alongside large-load coordination with PJM Interconnection and the serving utility. Central Ohio's rapid hyperscale growth is increasing competition for transmission capacity and utility infrastructure.",
  permittingNote: {
    text: "Large facilities in Ohio typically require township, county, or municipal zoning/site-plan review and large-load service coordination with the serving utility (AEP Ohio, FirstEnergy, Duke Energy Ohio, AES Ohio, Ohio Valley Electric Corporation, a municipal system, or a cooperative) and PJM (or MISO, near the western border). Potential incentives (job-creation credits, property-tax abatements, local enterprise zones) may be available through JobsOhio and local programs, but eligibility must be verified project by project. Utility interconnection is a separate process from land-use permitting.",
    source: {
      id: "oh-permitting-general",
      name: "Ohio data-center siting — general regulatory context",
      url: "https://jobsohio.com",
      methodology: "General regulatory context compiled from state/local public reporting, not a jurisdiction-specific legal determination.",
    },
  },
});

const MICHIGAN_BUNDLE = buildStandardBundle({
  fetchers: MI_LAYER_FETCHERS,
  hifldTransmission: MI_SOURCES.hifldTransmission,
  hifldUtilityTerritories: MI_SOURCES.hifldUtilityTerritories,
  usDroughtMonitor: MI_SOURCES.usDroughtMonitor,
  interconnectionAuthorityLabel: "MISO",
  environmentalReviewNote:
    "Michigan has no statewide zoning dataset — county/municipal review is the primary local gating process, alongside large-load coordination with MISO and the serving utility. Michigan operates under Great Lakes Compact requirements, so large water withdrawals face a more rigorous review framework (EGLE's Water Withdrawal Assessment Tool) than most states — Great Lakes access does not imply unrestricted withdrawal rights.",
  permittingNote: {
    text: "Large facilities in Michigan typically require county or municipal zoning/site-plan review and large-load service coordination with the serving utility (Consumers Energy, DTE Energy, Indiana Michigan Power, Upper Peninsula Power Company, a municipal utility, or a cooperative) and MISO. Michigan's Enterprise Data Center Sales & Use Tax Exemption (effective 2025) eliminates the 6% sales/use tax on qualifying equipment for projects meeting a $250M minimum investment, 30 qualified jobs, wage, municipal-water, clean-energy, and green-building requirements — eligibility must be verified project by project. Utility interconnection is a separate process from land-use permitting.",
    source: {
      id: "mi-permitting-general",
      name: "Michigan data-center siting — general regulatory context",
      url: "https://michiganbusiness.org",
      methodology: "General regulatory context compiled from state/local public reporting, not a jurisdiction-specific legal determination.",
    },
  },
});

const INDIANA_BUNDLE = buildStandardBundle({
  fetchers: IN_LAYER_FETCHERS,
  hifldTransmission: IN_SOURCES.hifldTransmission,
  hifldUtilityTerritories: IN_SOURCES.hifldUtilityTerritories,
  usDroughtMonitor: IN_SOURCES.usDroughtMonitor,
  interconnectionAuthorityLabel: "MISO/PJM",
  environmentalReviewNote:
    "Indiana has no statewide zoning dataset — local government review is the primary gating process, alongside large-load coordination with the serving utility and the applicable regional grid operator. Indiana sits between the MISO and PJM footprints and is frequently targeted for large industrial and hyperscale loads.",
  permittingNote: {
    text: "Large facilities in Indiana typically require county or municipal zoning/site-plan review and large-load service coordination with the serving utility (Duke Energy Indiana, Indiana Michigan Power, AES Indiana, CenterPoint Energy, NIPSCO, a municipal utility, or a cooperative) and the applicable MISO or PJM process. Indiana's Data Center Gross Retail and Use Tax Exemption can run up to 25 years (up to 50 years for investments exceeding $750M), with county-population-based investment thresholds from $25M to $150M — eligibility must be verified project by project. Utility interconnection is a separate process from land-use permitting.",
    source: {
      id: "in-permitting-general",
      name: "Indiana data-center siting — general regulatory context",
      url: "https://iedc.in.gov",
      methodology: "General regulatory context compiled from state/local public reporting, not a jurisdiction-specific legal determination.",
    },
  },
});

const WISCONSIN_BUNDLE = buildStandardBundle({
  fetchers: WI_LAYER_FETCHERS,
  hifldTransmission: WI_SOURCES.hifldTransmission,
  hifldUtilityTerritories: WI_SOURCES.hifldUtilityTerritories,
  usDroughtMonitor: WI_SOURCES.usDroughtMonitor,
  interconnectionAuthorityLabel: "MISO",
  environmentalReviewNote:
    "Wisconsin has no statewide zoning database — municipal review is the primary local gating process, alongside large-load coordination with MISO and the serving utility. Wisconsin operates under Great Lakes Compact requirements and maintains unusually strong water-withdrawal reporting — Great Lakes/Lake Michigan proximity does not imply unrestricted withdrawal rights.",
  permittingNote: {
    text: "Large facilities in Wisconsin typically require municipal zoning/site-plan review and large-load service coordination with the serving utility (We Energies, Wisconsin Public Service, Alliant Energy, Madison Gas & Electric, Xcel Energy Wisconsin, or a Dairyland Power member system) and MISO. Wisconsin's Data Center Sales and Use Tax Exemption requires minimum investment thresholds that scale with county population ($150M in counties over 100,000; $100M in counties of 50,000-100,000; $50M in counties under 50,000) — eligibility must be verified project by project. Utility interconnection is a separate process from land-use permitting.",
    source: {
      id: "wi-permitting-general",
      name: "Wisconsin data-center siting — general regulatory context",
      url: "https://wedc.org",
      methodology: "General regulatory context compiled from state/local public reporting, not a jurisdiction-specific legal determination.",
    },
  },
});

const IOWA_BUNDLE = buildStandardBundle({
  fetchers: IA_LAYER_FETCHERS,
  hifldTransmission: IA_SOURCES.hifldTransmission,
  hifldUtilityTerritories: IA_SOURCES.hifldUtilityTerritories,
  usDroughtMonitor: IA_SOURCES.usDroughtMonitor,
  interconnectionAuthorityLabel: "MISO (with SPP-connected utilities near the western border)",
  environmentalReviewNote:
    "Iowa has no statewide zoning database — municipal review is the primary local gating process, alongside large-load coordination with MISO and the serving utility. Multiple Iowa cities and counties have begun adopting or considering local data-center regulations and temporary moratoria while updating ordinances (as of 2026), so local status should be reverified close to any siting decision.",
  permittingNote: {
    text: "Large facilities in Iowa typically require municipal zoning/site-plan review and large-load service coordination with the serving utility (MidAmerican Energy, Alliant Energy/Interstate Power and Light, ITC Midwest, a municipal utility, or a cooperative) and MISO. Iowa's Data Center Sales and Use Tax Incentives (Iowa Department of Revenue) provide an exemption pathway for eligible projects meeting a minimum $200M investment and other statutory requirements — eligibility must be verified project by project. Utility interconnection is a separate process from land-use permitting.",
    source: {
      id: "ia-permitting-general",
      name: "Iowa data-center siting — general regulatory context",
      url: "https://revenue.iowa.gov",
      methodology: "General regulatory context compiled from state/local public reporting, not a jurisdiction-specific legal determination.",
    },
  },
});

const MINNESOTA_BUNDLE = buildStandardBundle({
  fetchers: MN_LAYER_FETCHERS,
  hifldTransmission: MN_SOURCES.hifldTransmission,
  hifldUtilityTerritories: MN_SOURCES.hifldUtilityTerritories,
  usDroughtMonitor: MN_SOURCES.usDroughtMonitor,
  interconnectionAuthorityLabel: "MISO",
  environmentalReviewNote:
    "Minnesota has no statewide zoning dataset — municipal review is the primary local gating process, alongside large-load coordination with MISO and the serving utility. Substation headroom and utility-specific available capacity are generally not published and should always be treated as UNKNOWN rather than inferred from equipment size.",
  permittingNote: {
    text: "Large facilities in Minnesota typically require municipal zoning/site-plan review and large-load service coordination with the serving utility (Xcel Energy, Minnesota Power, Otter Tail Power, Rochester Public Utilities, a municipal utility, or a cooperative) and MISO. Potential incentives may be available through Minnesota business-development and sales-tax-exemption programs, but eligibility must be verified project by project. Utility interconnection is a separate process from land-use permitting.",
    source: {
      id: "mn-permitting-general",
      name: "Minnesota data-center siting — general regulatory context",
      url: "https://mn.gov/deed",
      methodology: "General regulatory context compiled from state/local public reporting, not a jurisdiction-specific legal determination.",
    },
  },
});

const KANSAS_BUNDLE = buildStandardBundle({
  fetchers: KS_LAYER_FETCHERS,
  hifldTransmission: KS_SOURCES.hifldTransmission,
  hifldUtilityTerritories: KS_SOURCES.hifldUtilityTerritories,
  usDroughtMonitor: KS_SOURCES.usDroughtMonitor,
  interconnectionAuthorityLabel: "SPP",
  environmentalReviewNote:
    "Kansas has no statewide zoning layer — county/municipal review is the primary local gating process, alongside large-load coordination with the Southwest Power Pool (SPP) and the serving utility. Kansas is one of the nation's leading wind-power states, and groundwater availability (particularly in portions of the Ogallala Aquifer) is an important project consideration, especially in western Kansas.",
  permittingNote: {
    text: "Large facilities in Kansas typically require county or municipal zoning/site-plan review and large-load service coordination with the serving utility (Evergy, Midwest Energy, a Kansas Electric Power Cooperative member, a municipal utility, or a rural cooperative) and SPP. Potential incentives may be available through Promoting Employment Across Kansas (PEAK), the High Performance Incentive Program (HPIP), Industrial Revenue Bonds, or local property-tax abatements, but eligibility must be verified project by project. Utility interconnection is a separate process from land-use permitting.",
    source: {
      id: "ks-permitting-general",
      name: "Kansas data-center siting — general regulatory context",
      url: "https://www.kansascommerce.gov",
      methodology: "General regulatory context compiled from state/local public reporting, not a jurisdiction-specific legal determination.",
    },
  },
});

const NEBRASKA_BUNDLE = buildStandardBundle({
  fetchers: NE_LAYER_FETCHERS,
  hifldTransmission: NE_SOURCES.hifldTransmission,
  hifldUtilityTerritories: NE_SOURCES.hifldUtilityTerritories,
  usDroughtMonitor: NE_SOURCES.usDroughtMonitor,
  interconnectionAuthorityLabel: "SPP (with MISO interfaces)",
  environmentalReviewNote:
    "Nebraska has no statewide zoning layer — county/municipal review is the primary local gating process, alongside large-load coordination with SPP and the serving public-power provider. Nebraska is the only U.S. state served entirely by publicly owned electric utilities, which is frequently viewed as an advantage for large industrial and data-center customers.",
  permittingNote: {
    text: "Large facilities in Nebraska typically require county or municipal zoning/site-plan review and large-load service coordination with the serving public-power provider (Nebraska Public Power District, Omaha Public Power District, Lincoln Electric System, a municipal utility, or a public-power district) and SPP. Potential incentives may be available through Nebraska Advantage or successor economic-development programs, but eligibility must be verified project by project. Utility interconnection is a separate process from land-use permitting.",
    source: {
      id: "ne-permitting-general",
      name: "Nebraska data-center siting — general regulatory context",
      url: "https://opportunity.nebraska.gov",
      methodology: "General regulatory context compiled from state/local public reporting, not a jurisdiction-specific legal determination.",
    },
  },
});

const SOUTH_DAKOTA_BUNDLE = buildStandardBundle({
  fetchers: SD_LAYER_FETCHERS,
  hifldTransmission: SD_SOURCES.hifldTransmission,
  hifldUtilityTerritories: SD_SOURCES.hifldUtilityTerritories,
  usDroughtMonitor: SD_SOURCES.usDroughtMonitor,
  interconnectionAuthorityLabel: "MISO",
  environmentalReviewNote:
    "South Dakota has no statewide zoning layer — county/municipal review is the primary local gating process, alongside large-load coordination with MISO and the serving utility. South Dakota is one of the strongest wind-resource states in the country and benefits from significant Missouri River hydroelectric generation.",
  permittingNote: {
    text: "Large facilities in South Dakota typically require county or municipal zoning/site-plan review and large-load service coordination with the serving utility (Xcel Energy, Black Hills Energy, Otter Tail Power, Montana-Dakota Utilities, an East River Electric or Missouri River Energy Services member, or a cooperative) and MISO. South Dakota has no corporate income tax and is generally recognized for a business-friendly tax environment; specific incentive eligibility must be verified project by project. Utility interconnection is a separate process from land-use permitting.",
    source: {
      id: "sd-permitting-general",
      name: "South Dakota data-center siting — general regulatory context",
      url: "https://sdgoed.com",
      methodology: "General regulatory context compiled from state/local public reporting, not a jurisdiction-specific legal determination.",
    },
  },
});

const NORTH_DAKOTA_BUNDLE = buildStandardBundle({
  fetchers: ND_LAYER_FETCHERS,
  hifldTransmission: ND_SOURCES.hifldTransmission,
  hifldUtilityTerritories: ND_SOURCES.hifldUtilityTerritories,
  usDroughtMonitor: ND_SOURCES.usDroughtMonitor,
  interconnectionAuthorityLabel: "MISO (with limited SPP overlap)",
  environmentalReviewNote:
    "North Dakota has no statewide zoning layer — county/municipal review is the primary local gating process, alongside large-load coordination with MISO and the serving utility. North Dakota is a major net electricity-exporting state with a generation profile combining coal, wind, and natural gas.",
  permittingNote: {
    text: "Large facilities in North Dakota typically require county or municipal zoning/site-plan review and large-load service coordination with the serving utility (Xcel Energy, Montana-Dakota Utilities, Otter Tail Power, Roughrider Electric Cooperative, Cass County Electric Cooperative, or a Basin Electric member cooperative) and MISO. Potential incentives may be available through state economic-development and primary-sector programs, but eligibility must be verified project by project. Utility interconnection is a separate process from land-use permitting.",
    source: {
      id: "nd-permitting-general",
      name: "North Dakota data-center siting — general regulatory context",
      url: "https://commerce.nd.gov",
      methodology: "General regulatory context compiled from state/local public reporting, not a jurisdiction-specific legal determination.",
    },
  },
});

const NEW_MEXICO_BUNDLE = buildStandardBundle({
  fetchers: NM_LAYER_FETCHERS,
  hifldTransmission: NM_SOURCES.hifldTransmission,
  hifldUtilityTerritories: NM_SOURCES.hifldUtilityTerritories,
  usDroughtMonitor: NM_SOURCES.usDroughtMonitor,
  interconnectionAuthorityLabel: "the serving utility (PNM, Xcel Energy New Mexico, El Paso Electric, or Southwestern Public Service), within the Western Interconnection",
  environmentalReviewNote:
    "New Mexico has no statewide zoning layer — county/municipal review is the primary local gating process, alongside large-load coordination with the serving utility. Water-resource limitations administered under New Mexico's prior-appropriation system are one of the most important infrastructure siting considerations in the state, and groundwater availability can be a major constraint in certain basins.",
  permittingNote: {
    text: "Large facilities in New Mexico typically require county or municipal zoning/site-plan review and large-load service coordination with the serving utility (Public Service Company of New Mexico, Xcel Energy New Mexico, El Paso Electric, Southwestern Public Service, a cooperative, or a municipal system) within the Western Interconnection. Potential incentives may be available through the High Wage Jobs Tax Credit, Industrial Revenue Bonds, or Local Economic Development Act (LEDA) funds, but eligibility must be verified project by project. Utility interconnection is a separate process from land-use permitting.",
    source: {
      id: "nm-permitting-general",
      name: "New Mexico data-center siting — general regulatory context",
      url: "https://gonm.biz",
      methodology: "General regulatory context compiled from state/local public reporting, not a jurisdiction-specific legal determination.",
    },
  },
});

const ARIZONA_BUNDLE = buildStandardBundle({
  fetchers: AZ_LAYER_FETCHERS,
  hifldTransmission: AZ_SOURCES.hifldTransmission,
  hifldUtilityTerritories: AZ_SOURCES.hifldUtilityTerritories,
  usDroughtMonitor: AZ_SOURCES.usDroughtMonitor,
  interconnectionAuthorityLabel: "the serving utility (APS, SRP, TEP, or UniSource Energy Services), within the Western Interconnection",
  environmentalReviewNote:
    "Arizona has no statewide zoning layer — county/municipal review is the primary local gating process, alongside large-load coordination with the serving utility. Water availability, regulated through the Arizona Department of Water Resources and its Active Management Areas, is one of the most important site-selection factors for Arizona data-center development, and reclaimed-water use is increasingly important for cooling strategies.",
  permittingNote: {
    text: "Large facilities in Arizona typically require county or municipal zoning/site-plan review and large-load service coordination with the serving utility (Arizona Public Service, Salt River Project, Tucson Electric Power, UniSource Energy Services, a municipal utility, a cooperative, or a tribal utility) within the Western Interconnection. Arizona offers data-center transaction-privilege-tax and equipment-tax exemptions along with other economic-development incentives, but eligibility must be verified project by project. Utility interconnection is a separate process from land-use permitting.",
    source: {
      id: "az-permitting-general",
      name: "Arizona data-center siting — general regulatory context",
      url: "https://www.azcommerce.com",
      methodology: "General regulatory context compiled from state/local public reporting, not a jurisdiction-specific legal determination.",
    },
  },
});

const BUNDLES: Record<string, StateGisBundle> = {
  washington: WASHINGTON_BUNDLE,
  oklahoma: OKLAHOMA_BUNDLE,
  arkansas: ARKANSAS_BUNDLE,
  louisiana: LOUISIANA_BUNDLE,
  mississippi: MISSISSIPPI_BUNDLE,
  alabama: ALABAMA_BUNDLE,
  tennessee: TENNESSEE_BUNDLE,
  kentucky: KENTUCKY_BUNDLE,
  florida: FLORIDA_BUNDLE,
  georgia: GEORGIA_BUNDLE,
  southcarolina: SOUTH_CAROLINA_BUNDLE,
  northcarolina: NORTH_CAROLINA_BUNDLE,
  virginia: VIRGINIA_BUNDLE,
  westvirginia: WEST_VIRGINIA_BUNDLE,
  maryland: MARYLAND_BUNDLE,
  texas: TEXAS_BUNDLE,
  delaware: DELAWARE_BUNDLE,
  missouri: MISSOURI_BUNDLE,
  illinois: ILLINOIS_BUNDLE,
  maine: MAINE_BUNDLE,
  newhampshire: NEW_HAMPSHIRE_BUNDLE,
  vermont: VERMONT_BUNDLE,
  massachusetts: MASSACHUSETTS_BUNDLE,
  oregon: OREGON_BUNDLE,
  california: CALIFORNIA_BUNDLE,
  alaska: ALASKA_BUNDLE,
  hawaii: HAWAII_BUNDLE,
  idaho: IDAHO_BUNDLE,
  montana: MONTANA_BUNDLE,
  wyoming: WYOMING_BUNDLE,
  rhodeisland: RHODE_ISLAND_BUNDLE,
  connecticut: CONNECTICUT_BUNDLE,
  newyork: NEW_YORK_BUNDLE,
  newjersey: NEW_JERSEY_BUNDLE,
  pennsylvania: PENNSYLVANIA_BUNDLE,
  ohio: OHIO_BUNDLE,
  michigan: MICHIGAN_BUNDLE,
  indiana: INDIANA_BUNDLE,
  wisconsin: WISCONSIN_BUNDLE,
  iowa: IOWA_BUNDLE,
  minnesota: MINNESOTA_BUNDLE,
  kansas: KANSAS_BUNDLE,
  nebraska: NEBRASKA_BUNDLE,
  southdakota: SOUTH_DAKOTA_BUNDLE,
  northdakota: NORTH_DAKOTA_BUNDLE,
  newmexico: NEW_MEXICO_BUNDLE,
  arizona: ARIZONA_BUNDLE,
};

export function getStateGisBundle(stateId: string): StateGisBundle {
  return BUNDLES[stateId] ?? WASHINGTON_BUNDLE;
}

const EMPTY_FC: FeatureCollection = { type: "FeatureCollection", features: [] };

/** Always returns a callable fetcher — an unimplemented layer for a state degrades to "no features" rather than throwing. */
export function getFetcher(stateId: string, layerId: string): Fetcher {
  const bundle = getStateGisBundle(stateId);
  return bundle.fetchers[layerId] ?? (async () => EMPTY_FC);
}
