import type { SourceMeta } from "@/lib/types";
import { NATIONAL_SOURCES } from "@/lib/gis/nationalSources";

export const MO_SOURCES = {
  curatedDataCenters: {
    id: "curated-mo-datacenters",
    name: "Missouri known data-center campuses — research placeholder",
    url: "",
    license: "Compiled from public reporting; no verified facility coordinates ingested",
    refreshFrequency: "Manually maintained",
    methodology:
      "Missouri research identifies Kansas City, St. Louis, and Springfield as markets, but no point is emitted until a facility coordinate is independently verified.",
  },
  pscUtilityLocator: {
    id: "mo-psc-utility-locator",
    name: "Missouri Public Service Commission — Utility Locator",
    url: "https://psc.mo.gov/utilitylocator.aspx",
    license: "Public agency information",
    refreshFrequency: "Agency-maintained",
    methodology:
      "General-reference utility lookup. Exact serving utility still depends on the property location; map analysis uses the nationwide HIFLD territory layer as a proxy.",
  },
  groundwaterObservationWells: {
    id: "mo-dnr-observation-wells",
    name: "Missouri DNR — Groundwater Observation Wells",
    url: "https://gis.dnr.mo.gov/host/rest/services/water/observ_well/MapServer/0",
    license: "Public (Missouri DNR / OGI)",
    refreshFrequency: "Live ArcGIS MapServer",
    methodology:
      "Missouri DNR observation-well locations and published well specifications, queried live by bounding box.",
  },
  publicDrinkingWaterWells: {
    id: "mo-dnr-public-water-wells",
    name: "Missouri DNR — Public Drinking Water Wells",
    url: "https://gis.dnr.mo.gov/host/rest/services/water/PubDrinkingWater_SDWIS/MapServer/0",
    license: "Public (Missouri DNR)",
    refreshFrequency: "Live ArcGIS MapServer",
    methodology:
      "Public drinking-water well locations from Missouri DNR. Presence is infrastructure context, not a guarantee of industrial service or spare capacity.",
  },
  publicDrinkingWaterIntakes: {
    id: "mo-dnr-public-water-intakes",
    name: "Missouri DNR — Public Drinking Water Intakes",
    url: "https://gis.dnr.mo.gov/host/rest/services/water/PubDrinkingWater_SDWIS/MapServer/1",
    license: "Public (Missouri DNR)",
    refreshFrequency: "Live ArcGIS MapServer",
    methodology:
      "Public drinking-water surface-intake locations from Missouri DNR. Presence is infrastructure context, not a guarantee of industrial service or spare capacity.",
  },
  majorWaterUsers: {
    id: "mo-dnr-major-water-users",
    name: "Missouri DNR — Major Water Users",
    url: "https://dnr.mo.gov/water/business-industry-other-entities/reporting/major-water-users",
    license: "Public agency information",
    refreshFrequency: "Agency-maintained",
    methodology:
      "Missouri reporting program for entities capable of producing 100,000 gallons/day or more; not a point-level water-right allocation dataset.",
  },
  missouriBroadband: {
    id: "mo-broadband-map",
    name: "Missouri Office of Broadband Development — Missouri Broadband Map",
    url: "https://broadbandmap.mo.gov/",
    license: "Public map; some location-fabric data is license-restricted",
    refreshFrequency: "Agency-maintained",
    methodology:
      "Broadband availability/funding context only. Treat as a CONNECTIVITY PROXY, never proof of long-haul or dark fiber.",
  },
  msdis: {
    id: "mo-msdis",
    name: "Missouri Spatial Data Information Service (MSDIS)",
    url: "https://msdis.missouri.edu/",
    license: "Varies by dataset",
    refreshFrequency: "Agency/data-provider dependent",
    methodology:
      "Missouri primary spatial-data clearinghouse for vector data, imagery, LiDAR, and other statewide geospatial resources.",
  },
  dataCenterIncentive: {
    id: "mo-data-center-tax-exemption",
    name: "Missouri DED — Data Center Sales Tax Exemption Program",
    url: "https://ded.mo.gov/programs/business/data-center-sales-tax-exemption-program",
    license: "Public program guidance",
    refreshFrequency: "Agency-maintained",
    methodology:
      "Program guidance for qualifying new/expanded data-center facilities. Eligibility must be verified for each project.",
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
  censusBroadband: NATIONAL_SOURCES.censusBroadband,
} satisfies Record<string, SourceMeta>;
