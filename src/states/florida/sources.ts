import type { SourceMeta } from "@/lib/types";
import { NATIONAL_SOURCES } from "@/lib/gis/nationalSources";

/**
 * Canonical source metadata for Florida. Mirrors src/states/kentucky/sources.ts:
 * Florida's five Water Management Districts administer consumptive-use
 * permits, and at least one (SFWMD) does publish a public point-level GIS
 * layer of permitted water-use facilities — but only for its own 16-county
 * South Florida jurisdiction, not statewide. Rather than show a layer that
 * silently returns nothing outside South Florida, water-rights is left
 * UNKNOWN statewide in src/lib/gis/stateGis.ts, consistent with the other
 * states in this integration. No road functional-classification GIS layer
 * was found either.
 */
export const FL_SOURCES = {
  curatedDataCenters: {
    id: "curated-fl-datacenters",
    name: "Curated Known/Announced Data Center Campuses (Florida)",
    url: "",
    license: "Compiled from public reporting; not an authoritative registry",
    refreshFrequency: "Manually maintained",
    methodology: "Hand-curated illustrative list of publicly reported Florida data center campuses/projects. NOT exhaustive and NOT independently verified against parcel/operator records.",
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
