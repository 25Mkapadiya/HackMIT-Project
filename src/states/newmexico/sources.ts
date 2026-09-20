import type { SourceMeta } from "@/lib/types";
import { NATIONAL_SOURCES } from "@/lib/gis/nationalSources";

/**
 * Canonical source metadata for New Mexico. The New Mexico Office of the
 * State Engineer administers water rights under a prior-appropriation
 * system (permits, adjudications, groundwater basins), but no confirmed
 * public point-level GIS layer of individual water rights was found, so
 * water rights correctly degrade to UNKNOWN in src/lib/gis/stateGis.ts
 * rather than guessing.
 */
export const NM_SOURCES = {
  curatedDataCenters: {
    id: "curated-nm-datacenters",
    name: "Curated Known/Announced Data Center Campuses (New Mexico)",
    url: "",
    license: "Compiled from public reporting; not an authoritative registry",
    refreshFrequency: "Manually maintained",
    methodology: "Hand-curated illustrative list of publicly reported New Mexico data center/colocation markets. NOT exhaustive and NOT independently verified against parcel/operator records.",
  },
  hifldTransmission: NATIONAL_SOURCES.hifldTransmission,
  hifldSubstations: NATIONAL_SOURCES.hifldSubstations,
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
