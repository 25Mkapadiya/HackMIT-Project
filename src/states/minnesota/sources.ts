import type { SourceMeta } from "@/lib/types";
import { NATIONAL_SOURCES } from "@/lib/gis/nationalSources";

/**
 * Canonical source metadata for Minnesota. Minnesota DNR administers water
 * withdrawal permitting through its Water Appropriation Program, but no
 * confirmed public point-level GIS layer of individual withdrawal permits
 * was found, so water rights correctly degrade to UNKNOWN in
 * src/lib/gis/stateGis.ts rather than guessing.
 */
export const MN_SOURCES = {
  curatedDataCenters: {
    id: "curated-mn-datacenters",
    name: "Curated Known/Announced Data Center Campuses (Minnesota)",
    url: "",
    license: "Compiled from public reporting; not an authoritative registry",
    refreshFrequency: "Manually maintained",
    methodology: "Hand-curated illustrative list of publicly reported Minnesota data center/colocation markets. NOT exhaustive and NOT independently verified against parcel/operator records.",
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
