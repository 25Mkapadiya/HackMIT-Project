import type { SourceMeta } from "@/lib/types";
import { NATIONAL_SOURCES } from "@/lib/gis/nationalSources";

/**
 * Canonical source metadata for Virginia. Mirrors src/states/northcarolina/sources.ts:
 * Virginia DEQ requires water-withdrawal registration/reporting and publishes
 * Virginia Water Protection (VWP) permit datasets on its GeoHub, but those
 * cover dredge/fill activity in surface waters, not consumptive withdrawal
 * points — no public point-level GIS layer of withdrawal permits was found,
 * and no road functional-classification GIS layer was found either. Both
 * correctly degrade to UNKNOWN in src/lib/gis/stateGis.ts rather than
 * guessing.
 */
export const VA_SOURCES = {
  curatedDataCenters: {
    id: "curated-va-datacenters",
    name: "Curated Known/Announced Data Center Campuses (Virginia)",
    url: "",
    license: "Compiled from public reporting; not an authoritative registry",
    refreshFrequency: "Manually maintained",
    methodology: "Hand-curated illustrative list of publicly reported Virginia data center campuses/projects. NOT exhaustive — Northern Virginia alone is the largest data center market in the world — and NOT independently verified against parcel/operator records.",
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
