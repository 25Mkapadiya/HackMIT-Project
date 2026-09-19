import type { SourceMeta } from "@/lib/types";
import { NATIONAL_SOURCES } from "@/lib/gis/nationalSources";

/**
 * Canonical source metadata for California. Mirrors src/states/virginia/sources.ts:
 * power/water/environment/community layers use nationwide sources; no verified
 * public GIS layer of water-right/withdrawal points or road classification is
 * integrated, so those metrics degrade to UNKNOWN in src/lib/gis/stateGis.ts.
 */
export const CA_SOURCES = {
  curatedDataCenters: {
    id: "curated-ca-datacenters",
    name: "Curated Known/Announced Data Center Campuses (California)",
    url: "",
    license: "Compiled from public reporting; not an authoritative registry",
    refreshFrequency: "Manually maintained",
    methodology: "Hand-curated, illustrative list of publicly reported California data center markets (Silicon Valley/Santa Clara, Sacramento, Los Angeles, Inland Empire). NOT exhaustive and NOT independently verified against parcel/operator records; coordinates are approximate area locations.",
  },
  cecUtilityAreas: {
    id: "cec-electric-load-serving-entities",
    name: "Electric Load Serving Entities (IOU & POU) - California Energy Commission",
    url: "https://services3.arcgis.com/bWPjFyq029ChCGur/arcgis/rest/services/ElectricLoadServingEntities_IOU_POU/FeatureServer/0",
    license: "License not stated on the service - CEC / California State Geoportal open data",
    refreshFrequency: "State-maintained layer, updated by CEC staff",
    methodology: "Point-in-polygon lookup against CEC statewide IOU and publicly owned utility service-area polygons. Per the CEC, boundaries are approximate (compiled from georeferenced territory maps and DHS data); contact the load-serving entity for authoritative territory. Community choice aggregators/other LSEs are in a separate CEC layer not integrated here.",
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
  censusGeocoder: NATIONAL_SOURCES.censusGeocoder,
  eia: NATIONAL_SOURCES.eia,
  peeringDb: NATIONAL_SOURCES.peeringDb,
  fccBroadband: NATIONAL_SOURCES.fccBroadband,
} satisfies Record<string, SourceMeta>;
