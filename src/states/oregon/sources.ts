import type { SourceMeta } from "@/lib/types";
import { NATIONAL_SOURCES } from "@/lib/gis/nationalSources";

/**
 * Canonical source metadata for Oregon. Mirrors src/states/virginia/sources.ts:
 * power/water/environment/community layers use nationwide sources; no verified
 * public GIS layer of water-right/withdrawal points or road classification is
 * integrated, so those metrics degrade to UNKNOWN in src/lib/gis/stateGis.ts.
 */
export const OR_SOURCES = {
  curatedDataCenters: {
    id: "curated-or-datacenters",
    name: "Curated Known/Announced Data Center Campuses (Oregon)",
    url: "",
    license: "Compiled from public reporting; not an authoritative registry",
    refreshFrequency: "Manually maintained",
    methodology: "Hand-curated, illustrative list of publicly reported Oregon data center areas (Hillsboro, Prineville, The Dalles/Columbia corridor, Boardman). NOT exhaustive and NOT independently verified against parcel/operator records; coordinates are approximate area locations.",
  },
  odoeUtilityAreas: {
    id: "odoe-electric-utility-service-areas",
    name: "Oregon Electric Utility Service Areas (Oregon Department of Energy)",
    url: "https://services.arcgis.com/uUvqNMGPm7axC2dD/arcgis/rest/services/OregonElectric_Utilities_WGS_1984_6_26_2023/FeatureServer/0",
    license: "License not stated on the service - confirm with ODOE (gis.odoe@energy.oregon.gov)",
    refreshFrequency: "Static state-maintained layer (service last edited 2024-06-11; PUC orders dated as far back as 2003 in attributes)",
    methodology: "Point-in-polygon lookup against ODOE's statewide electric service-area polygons (feeds the Find Your Utility tool). Polygons may overlap; the first containing polygon is reported. Not an official service-territory determination.",
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
