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
