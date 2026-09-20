import type { SourceMeta } from "@/lib/types";
import { NATIONAL_SOURCES } from "@/lib/gis/nationalSources";

/**
 * Canonical source metadata for Texas. Mirrors src/states/oklahoma/sources.ts:
 * unlike most states in this integration, TCEQ publishes a real statewide
 * point-level GIS layer of surface water rights ("Water Rights As Single
 * Points" in the Texas Water Rights Viewer), so Texas gets a live
 * water-diversions layer instead of the UNKNOWN placeholder most other
 * states use. No road functional-classification GIS layer was found.
 */
export const TX_SOURCES = {
  tceqWaterRights: {
    id: "tceq-water-rights-points",
    name: "Texas Commission on Environmental Quality — Water Rights (Single Points)",
    url: "https://gisweb.tceq.texas.gov/arcgis/rest/services/WaterRights/WaterRightsViewer/MapServer/3",
    license: "Public (TCEQ open data)",
    refreshFrequency: "Live ArcGIS MapServer",
    methodology: "Statewide surface-water-rights diversion/authorization points from TCEQ's Water Rights Viewer, queried live by bounding box.",
  },
  curatedDataCenters: {
    id: "curated-tx-datacenters",
    name: "Curated Known/Announced Data Center Campuses (Texas)",
    url: "",
    license: "Compiled from public reporting; not an authoritative registry",
    refreshFrequency: "Manually maintained",
    methodology: "Hand-curated illustrative list of publicly reported Texas data center campuses/projects. NOT exhaustive — Texas is one of the largest data center markets in the country — and NOT independently verified against parcel/operator records.",
  },
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
  censusCountyDensity: NATIONAL_SOURCES.censusCountyDensity,
  censusGeocoder: NATIONAL_SOURCES.censusGeocoder,
  eia: NATIONAL_SOURCES.eia,
  peeringDb: NATIONAL_SOURCES.peeringDb,
  fccBroadband: NATIONAL_SOURCES.fccBroadband,
} satisfies Record<string, SourceMeta>;
