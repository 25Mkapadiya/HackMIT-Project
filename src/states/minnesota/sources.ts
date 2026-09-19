import type { SourceMeta } from "@/lib/types";
import { NATIONAL_SOURCES } from "@/lib/gis/nationalSources";

/**
 * Canonical source metadata for every Minnesota dataset the platform uses.
 * Mirrors src/states/oklahoma/sources.ts: nationwide datasets are re-exported
 * from NATIONAL_SOURCES rather than re-declared. Minnesota-specific URLs
 * below were live-verified (actual test queries run, not guessed from naming
 * patterns) on 2026-09-19. Two items a state research doc named turned out
 * not to exist as public, queryable endpoints — MnGeo's own official
 * transmission-line dataset was withdrawn ("Commerce could not keep it
 * accurate"), and the DNR's water-appropriation-permit system (MPARS) is a
 * login-gated web app, not a REST service — so transmission falls back to
 * the shared nationwide HIFLD mirror and water rights is left unintegrated
 * (see minnesota/layerFetchers.ts).
 */
export const MN_SOURCES = {
  // ---- Minnesota-specific ----
  substationsNational: {
    id: "hifld-mirror-substations",
    name: "Electric Substations (national HIFLD-schema mirror)",
    url: "https://services5.arcgis.com/HDRa0B57OVrv2E1q/ArcGIS/rest/services/Electric_Substations/FeatureServer/0",
    license: "Public (HIFLD-derived, hosted mirror)",
    refreshFrequency: "Live ArcGIS FeatureServer",
    methodology: "Queried by bounding box, filtered where STATE='MN'. No Oklahoma/Washington equivalent layer is wired in yet.",
  },
  utilityServiceAreas: {
    id: "mn-eusa",
    name: "Minnesota Electric Utility Service Areas (EUSA)",
    url: "https://enterprise.gisdata.mn.gov/aghost/rest/services/us_mn_state_mngeo/util_eusa/FeatureServer/0",
    license: "Public (MnGeo / MN PUC)",
    refreshFrequency: "Live ArcGIS FeatureServer (Jan 2026 vintage)",
    methodology: "Point-in-polygon lookup against MnGeo/PUC-sourced utility service-area boundaries (municipal/cooperative/investor-owned) — more current and MN-specific than the nationwide HIFLD territories mirror.",
  },
  dnrPublicWatersLines: {
    id: "mn-dnr-pwi-watercourses",
    name: "Minnesota DNR Public Waters Inventory — Watercourses",
    url: "https://enterprise.gisdata.mn.gov/aghost/rest/services/us_mn_state_dnr/water_mn_public_waters/FeatureServer/0",
    license: "Public (Minnesota DNR)",
    refreshFrequency: "Live ArcGIS FeatureServer",
    methodology: "Statutorily-designated public-water watercourse centerlines queried by bounding box.",
  },
  dnrPublicWatersBasins: {
    id: "mn-dnr-pwi-basins",
    name: "Minnesota DNR Public Waters Inventory — Basin Delineations (lakes/wetlands)",
    url: "https://enterprise.gisdata.mn.gov/aghost/rest/services/us_mn_state_dnr/water_mn_public_waters/FeatureServer/1",
    license: "Public (Minnesota DNR)",
    refreshFrequency: "Live ArcGIS FeatureServer",
    methodology: "Statutorily-designated public-water basin (lake/wetland) polygons queried by bounding box.",
  },
  deedBroadbandFiber: {
    id: "mn-deed-fiber-coverage",
    name: "Minnesota Broadband Fiber Coverage (DEED Office of Broadband Development / Connected Nation MN)",
    url: "https://services.arcgis.com/R0IGaIgf2sox9aCY/arcgis/rest/services/MN_Thiessen_ByTech_2024_12_16/FeatureServer/12",
    license: "Public (MN DEED)",
    refreshFrequency: "Live ArcGIS FeatureServer (2024-12-16)",
    methodology: "Dissolved coverage-area polygons by technology type, filtered to TechType='Fiber'. Coarse (Thiessen-polygon dissolve), not address-level or route-level.",
  },
  bwsrConservationEasements: {
    id: "mn-bwsr-rim-easements",
    name: "Minnesota Conservation Easements — RIM Reserve (BWSR)",
    url: "https://enterprise.gisdata.mn.gov/aghost/rest/services/us_mn_state_bwsr/bdry_bwsr_rim_cons_easements/FeatureServer/0",
    license: "Public (MN Board of Water & Soil Resources)",
    refreshFrequency: "Live ArcGIS FeatureServer",
    methodology: "State-funded perpetual conservation easement polygons queried by bounding box.",
  },
  curatedDataCenters: {
    id: "curated-mn-datacenters",
    name: "Curated Known Data Center Campuses (Minnesota)",
    url: "",
    license: "n/a — no facilities currently catalogued",
    refreshFrequency: "Manually maintained",
    methodology: "No verified, geolocated Minnesota data center facilities have been catalogued yet — deliberately empty rather than guessed. Falls back to whatever Supabase's existing_data_centers table has for state_code='MN'.",
  },
  // ---- Nationwide (shared — see NATIONAL_SOURCES for the canonical definitions) ----
  hifldTransmission: NATIONAL_SOURCES.hifldTransmission,
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
