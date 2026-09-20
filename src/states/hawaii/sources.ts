import type { SourceMeta } from "@/lib/types";
import { NATIONAL_SOURCES } from "@/lib/gis/nationalSources";

/**
 * Canonical source metadata for Hawaii. Mirrors src/states/virginia/sources.ts:
 * all layers use nationwide sources; no verified public GIS layer of
 * water-right/withdrawal points or road classification is integrated, so those
 * metrics degrade to UNKNOWN in src/lib/gis/stateGis.ts.
 */
export const HI_SOURCES = {
  curatedDataCenters: {
    id: "curated-hi-datacenters",
    name: "Curated Known/Announced Data Center Campuses (Hawaii)",
    url: "",
    license: "Compiled from public reporting; not an authoritative registry",
    refreshFrequency: "Manually maintained",
    methodology: "No facility points are shown: the research names Honolulu and the Oahu technology corridor as markets but provides no verified facility coordinates.",
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
