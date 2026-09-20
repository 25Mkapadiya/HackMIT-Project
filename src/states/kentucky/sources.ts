import type { SourceMeta } from "@/lib/types";
import { NATIONAL_SOURCES } from "@/lib/gis/nationalSources";

/**
 * Canonical source metadata for Kentucky. Mirrors src/states/tennessee/sources.ts:
 * the Kentucky Division of Water administers withdrawal permits but publishes
 * no public point-level GIS layer we could find, and no road
 * functional-classification GIS layer was found either — both correctly
 * degrade to UNKNOWN in src/lib/gis/stateGis.ts rather than guessing.
 */
export const KY_SOURCES = {
  curatedDataCenters: {
    id: "curated-ky-datacenters",
    name: "Curated Known/Announced Data Center Campuses (Kentucky)",
    url: "",
    license: "Compiled from public reporting; not an authoritative registry",
    refreshFrequency: "Manually maintained",
    methodology: "Hand-curated illustrative list of publicly reported Kentucky data center campuses/projects. NOT exhaustive and NOT independently verified against parcel/operator records.",
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
