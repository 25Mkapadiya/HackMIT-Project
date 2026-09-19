import type { SourceMeta } from "@/lib/types";
import { NATIONAL_SOURCES } from "@/lib/gis/nationalSources";

/**
 * Canonical source metadata for every Oklahoma dataset the platform uses.
 * Mirrors src/states/washington/sources.ts: referenced by both layer
 * definitions (legend/provenance UI) and the analysis engine (per-metric
 * attribution). Nationwide datasets are re-exported from NATIONAL_SOURCES
 * rather than re-declared — see Step 4 in the integration brief this follows
 * ("do not duplicate national data").
 */
export const OK_SOURCES = {
  // ---- Oklahoma-specific ----
  owrbSurfaceWaterRights: {
    id: "owrb-surface-water-rights",
    name: "Oklahoma Water Resources Board — Permitted Surface Water Diversion Points",
    url: "https://owrb.csa.ou.edu/server/rest/services/Water_Rights/Water_Rights/MapServer/2",
    license: "Public (OWRB open data)",
    refreshFrequency: "Long-term permits updated monthly (per OWRB service description)",
    methodology: "Permitted surface-water diversion point locations from the OWRB Water Rights Database, queried live by bounding box.",
  },
  owrbGroundwaterWells: {
    id: "owrb-groundwater-wells",
    name: "Oklahoma Water Resources Board — Permitted Groundwater Wells",
    url: "https://owrb.csa.ou.edu/server/rest/services/Water_Rights/Water_Rights/MapServer/5",
    license: "Public (OWRB open data)",
    refreshFrequency: "Long-term permits updated monthly (per OWRB service description)",
    methodology: "Permitted groundwater well locations from the OWRB Water Rights Database, queried live by bounding box.",
  },
  curatedDataCenters: {
    id: "curated-ok-datacenters",
    name: "Curated Known/Announced Data Center Campuses (Oklahoma)",
    url: "",
    license: "Compiled from public reporting; not an authoritative registry",
    refreshFrequency: "Manually maintained",
    methodology: "Hand-curated illustrative list of publicly reported Oklahoma data center campuses/projects. NOT exhaustive and NOT independently verified against parcel/operator records.",
  },
  // ---- Nationwide (shared — see NATIONAL_SOURCES for the canonical definitions) ----
  hifldTransmission: NATIONAL_SOURCES.hifldTransmission,
  hifldUtilityTerritories: NATIONAL_SOURCES.hifldUtilityTerritories,
  usgsNhdFlowline: NATIONAL_SOURCES.usgsNhdFlowline,
  usgsNhdWaterbody: NATIONAL_SOURCES.usgsNhdWaterbody,
  usgsNwisGauges: NATIONAL_SOURCES.usgsNwisGauges,
  usgsEpqs: NATIONAL_SOURCES.usgsEpqs,
  usDroughtMonitor: NATIONAL_SOURCES.usDroughtMonitor,
  femaNfhl: NATIONAL_SOURCES.femaNfhl,
  cartoForestCover: NATIONAL_SOURCES.cartoForestCover,
  usgsShadedRelief: NATIONAL_SOURCES.usgsShadedRelief,
  censusAcs: NATIONAL_SOURCES.censusAcs,
  censusTiger: NATIONAL_SOURCES.censusTiger,
  censusGeocoder: NATIONAL_SOURCES.censusGeocoder,
  eia: NATIONAL_SOURCES.eia,
  peeringDb: NATIONAL_SOURCES.peeringDb,
  fccBroadband: NATIONAL_SOURCES.fccBroadband,
} satisfies Record<string, SourceMeta>;
