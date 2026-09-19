import type { FeatureCollection } from "geojson";
import type { SourceMeta } from "@/lib/types";
import type { Bbox } from "./arcgis";
import { WA_LAYER_FETCHERS } from "./layerFetchers";
import { WA_SOURCES } from "@/states/washington/sources";
import { OK_LAYER_FETCHERS } from "@/states/oklahoma/layerFetchers";
import { OK_SOURCES } from "@/states/oklahoma/sources";
import { MN_LAYER_FETCHERS } from "@/states/minnesota/layerFetchers";
import { MN_SOURCES } from "@/states/minnesota/sources";
import { NATIONAL_SOURCES } from "./nationalSources";

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
  /** USPS abbreviation — also the Supabase state_code used by utilities/hazards/incentives/existing_data_centers. */
  stateCode: string;
  fetchers: Record<string, Fetcher>;
  transmissionSource: SourceMeta;
  utilityTerritorySource: SourceMeta;
  utilityTerritoryCaveats: string[];
  /** The hydrography (river/lake) fetch actually used for this state — usually NATIONAL_SOURCES.usgsNhdFlowline, but a state can supply its own (e.g. Minnesota's DNR Public Waters Inventory). */
  hydrographySource: SourceMeta;
  /** null when no verified public water-rights/appropriation-permit GIS layer is integrated. */
  waterRightsSource: SourceMeta | null;
  droughtSource: SourceMeta;
  /** e.g. "BPA" or "SPP" — used in the "Utility/<X> interconnection study..." likely-action copy. */
  interconnectionAuthorityLabel: string;
  /** One-line environmental/regulatory-review bullet added to LandAnalysis.environmentalConstraints. */
  environmentalReviewNote: string;
  permittingNote: { text: string; source: SourceMeta };
  /** null when no verified state road-classification GIS layer is integrated. */
  roads: { layerId: string; source: SourceMeta; label: string } | null;
}

const WASHINGTON_BUNDLE: StateGisBundle = {
  stateCode: "WA",
  fetchers: WA_LAYER_FETCHERS,
  transmissionSource: WA_SOURCES.bpaTransmission,
  utilityTerritorySource: WA_SOURCES.waUtilityTerritories,
  utilityTerritoryCaveats: ["Boundary is informational, compiled by WA Ecology/UTC — not an official service-territory determination."],
  hydrographySource: NATIONAL_SOURCES.usgsNhdFlowline,
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
  stateCode: "OK",
  fetchers: OK_LAYER_FETCHERS,
  transmissionSource: OK_SOURCES.hifldTransmission,
  utilityTerritorySource: OK_SOURCES.hifldUtilityTerritories,
  utilityTerritoryCaveats: [
    "Boundary is a static 2025-08-21 HIFLD Electric Retail Service Territories snapshot — not an official service-territory determination and will not reflect subsequent utility/territory changes.",
  ],
  hydrographySource: NATIONAL_SOURCES.usgsNhdFlowline,
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

const MINNESOTA_BUNDLE: StateGisBundle = {
  stateCode: "MN",
  fetchers: MN_LAYER_FETCHERS,
  transmissionSource: MN_SOURCES.hifldTransmission,
  utilityTerritorySource: MN_SOURCES.utilityServiceAreas,
  utilityTerritoryCaveats: [],
  hydrographySource: MN_SOURCES.dnrPublicWatersLines,
  // Minnesota DNR's water-appropriation-permit system (MPARS) is a login-gated
  // web app with no public REST/GIS endpoint — confirmed by searching the full
  // MnGeo Geospatial Commons catalog (2,563 datasets) and probing likely DNR
  // ArcGIS hostnames. Left null rather than guessed.
  waterRightsSource: null,
  droughtSource: MN_SOURCES.usDroughtMonitor,
  interconnectionAuthorityLabel: "MISO",
  environmentalReviewNote:
    "Minnesota Environmental Policy Act (MEPA) review — potentially including an Environmental Assessment Worksheet (EAW) — is likely required for a project of this scale, in addition to any local conditional-use/site-plan review.",
  permittingNote: {
    text: "Large facilities in Minnesota typically trigger county/city conditional-use or site-plan review and, depending on size, an Environmental Assessment Worksheet (EAW) under the Minnesota Environmental Policy Act (MEPA). Utility interconnection (including any MISO-level review) is a separate process from land-use permitting.",
    source: {
      id: "mn-permitting-general",
      name: "Minnesota data-center siting — general regulatory context",
      url: "https://www.eqb.state.mn.us",
      methodology: "General regulatory context compiled from state public reporting, not a jurisdiction-specific legal determination.",
    },
  },
  roads: null,
};

const BUNDLES: Record<string, StateGisBundle> = {
  washington: WASHINGTON_BUNDLE,
  oklahoma: OKLAHOMA_BUNDLE,
  minnesota: MINNESOTA_BUNDLE,
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

/** A placeholder SourceMeta for a role a state's bundle doesn't define (e.g. no water-rights or roads layer), so Metric.source is never null. */
export function noDatasetSource(label: string): SourceMeta {
  return {
    id: `no-${label.toLowerCase().replace(/[^a-z0-9]+/g, "-")}-dataset`,
    name: `No ${label} dataset integrated for this state`,
    url: "",
  };
}
