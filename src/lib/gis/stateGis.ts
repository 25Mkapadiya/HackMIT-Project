import type { FeatureCollection } from "geojson";
import type { SourceMeta } from "@/lib/types";
import type { Bbox } from "./arcgis";
import { WA_LAYER_FETCHERS } from "./layerFetchers";
import { WA_SOURCES } from "@/states/washington/sources";
import { OK_LAYER_FETCHERS } from "@/states/oklahoma/layerFetchers";
import { OK_SOURCES } from "@/states/oklahoma/sources";

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
  utilityTerritoryCaveats: [
    "Boundary is a static 2025-08-21 HIFLD Electric Retail Service Territories snapshot — not an official service-territory determination and will not reflect subsequent utility/territory changes.",
  ],
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

const BUNDLES: Record<string, StateGisBundle> = {
  washington: WASHINGTON_BUNDLE,
  oklahoma: OKLAHOMA_BUNDLE,
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
