import type { SourceMeta } from "@/lib/types";

/**
 * Source metadata for datasets that are genuinely nationwide (bbox-driven, no
 * state-specific hosting) — shared by every StateDefinition instead of being
 * re-declared per state. See src/lib/gis/nationalFetchers.ts for the matching
 * fetch functions and src/lib/gis/stateGis.ts for how a state's LayerDefinition
 * list wires these in alongside its own state-specific sources.
 */
export const NATIONAL_SOURCES = {
  usgsNhdFlowline: {
    id: "usgs-nhd-flowline",
    name: "USGS National Hydrography Dataset — Flowlines (small scale)",
    url: "https://hydro.nationalmap.gov/arcgis/rest/services/nhd/MapServer/4",
    license: "Public domain (USGS)",
    refreshFrequency: "Live ArcGIS MapServer",
    methodology: "Small-scale river/stream centerlines queried by bounding box.",
  },
  usgsNhdWaterbody: {
    id: "usgs-nhd-waterbody",
    name: "USGS National Hydrography Dataset — Waterbodies (small scale)",
    url: "https://hydro.nationalmap.gov/arcgis/rest/services/nhd/MapServer/10",
    license: "Public domain (USGS)",
    refreshFrequency: "Live ArcGIS MapServer",
    methodology: "Small-scale lake/reservoir polygons queried by bounding box.",
  },
  usgsNwisGauges: {
    id: "usgs-nwis-gauges",
    name: "USGS NWIS — Active Streamflow Gauges",
    url: "https://waterservices.usgs.gov/nwis/iv/",
    license: "Public domain (USGS)",
    refreshFrequency: "Near real-time instantaneous values",
    methodology: "Active surface-water gauge sites with current discharge reading, filtered by state and bounding box.",
  },
  usgsEpqs: {
    id: "usgs-epqs",
    name: "USGS Elevation Point Query Service",
    url: "https://epqs.nationalmap.gov/v1/json",
    license: "Public domain (USGS)",
    refreshFrequency: "Live point query",
    methodology: "3DEP-derived elevation at the queried point.",
  },
  femaNfhl: {
    id: "fema-nfhl",
    name: "FEMA National Flood Hazard Layer — Flood Hazard Zones",
    url: "https://hazards.fema.gov/arcgis/rest/services/public/NFHL/MapServer/28",
    license: "Public (FEMA)",
    refreshFrequency: "Live ArcGIS MapServer; coverage varies by county study status",
    methodology: "Effective FIRM flood zone polygon containing the point, where mapped.",
  },
  peeringDb: {
    id: "peeringdb-fac",
    name: "PeeringDB — Colocation / Interconnection Facilities",
    url: "https://www.peeringdb.com/api/fac",
    license: "PeeringDB (CC BY-SA-ish community data, see peeringdb.com/about)",
    refreshFrequency: "Live API, community-maintained",
    methodology: "Facility records self-reported by network operators; used as a proxy for interconnection-dense sites, not a survey of long-haul fiber routes.",
  },
  censusAcs: {
    id: "census-acs5",
    name: "US Census Bureau — ACS 5-Year Population Estimates",
    url: "https://api.census.gov/data/2022/acs/acs5",
    license: "Public domain (US Census Bureau)",
    refreshFrequency: "Annual (ACS 5-year release)",
    methodology: "Tract-level population, area-weighted against a 5-mile radius buffer.",
  },
  censusTiger: {
    id: "census-tigerweb",
    name: "US Census Bureau — TIGERweb Tract Boundaries",
    url: "https://tigerweb.geo.census.gov/arcgis/rest/services/TIGERweb/tigerWMS_Current/MapServer",
    license: "Public domain (US Census Bureau)",
    refreshFrequency: "Live ArcGIS MapServer",
    methodology: "Current tract boundaries queried by bounding box.",
  },
  eia: {
    id: "eia-v2",
    name: "US Energy Information Administration — Open Data API v2",
    url: "https://api.eia.gov/v2",
    license: "Public domain (EIA)",
    refreshFrequency: "Varies by dataset (generally monthly/annual)",
    methodology: "Server-side query using an EIA API key, filtered to the state; requires EIA_API_KEY to be configured.",
  },
  fccBroadband: {
    id: "fcc-broadband-map",
    name: "FCC National Broadband Map (BDC)",
    url: "https://broadbandmap.fcc.gov/",
    license: "Public (FCC)",
    refreshFrequency: "Semiannual BDC collection",
    methodology: "Retail fixed-broadband availability by provider/technology at a location — a proxy for connectivity, not long-haul fiber routes. Requires FCC_BDC_API_KEY.",
  },
  cartoForestCover: {
    id: "carto-osm-forest-cover",
    name: "CARTO Vector Basemap — OSM Landcover (wood)",
    url: "https://tiles.basemaps.cartocdn.com/vector/carto.streets/v1/tiles.json",
    license: "CARTO basemap / OpenStreetMap-derived data (ODbL attribution applies)",
    refreshFrequency: "Basemap provider refresh cycle",
    methodology: "Visual forest overlay using the basemap vector landcover layer filtered to the 'wood' class. This is a cartographic forest proxy, not an authoritative forestry inventory.",
  },
  usgsShadedRelief: {
    id: "usgs-shaded-relief",
    name: "USGS The National Map — Shaded Relief",
    url: "https://basemap.nationalmap.gov/arcgis/rest/services/USGSShadedReliefOnly/MapServer",
    license: "Public domain (USGS)",
    refreshFrequency: "USGS cached basemap service",
    methodology: "Cached shaded-relief tiles derived from 3DEP at large/medium scales, displayed as a low-opacity terrain context layer with no 3D extrusion.",
  },
  censusGeocoder: {
    id: "census-geocoder",
    name: "US Census Bureau Geocoder",
    url: "https://geocoding.geo.census.gov/geocoder/",
    license: "Public domain (US Census Bureau)",
    refreshFrequency: "Live geocoder",
    methodology: "Reverse point-in-polygon lookup against current county boundaries.",
  },
  /**
   * HIFLD's own Open Data hub was deactivated 2025-08-26. This is a live ArcGIS
   * Online mirror of the same HIFLD "Electric Power Transmission Lines" extract
   * (sourced from Oak Ridge National Laboratory / EIA-861 / EIA-860), hosted by
   * the DOE NETL Energy Transition Atlas. Nationwide, bbox-queryable.
   */
  hifldTransmission: {
    id: "hifld-transmission-lines",
    name: "HIFLD — Electric Power Transmission Lines (via DOE NETL Energy Transition Atlas mirror)",
    url: "https://arcgis.netl.doe.gov/server/rest/services/Hosted/Energy_Transition_Atlas_493d6/FeatureServer/18",
    license: "Public (HIFLD / Oak Ridge National Laboratory)",
    refreshFrequency: "Static extract mirrored from HIFLD Open (last HIFLD refresh: 2025)",
    methodology: "Nationwide high-voltage transmission line geometry queried by bounding box; voltage/owner normalized from the HIFLD VOLTAGE/OWNER attributes.",
  },
  /**
   * Same HIFLD-deactivation situation — this is a live ArcGIS Online mirror
   * (re-hosted 2025-08-21, "will not be updated") of HIFLD's nationwide
   * "Electric Retail Service Territories" polygons.
   */
  hifldUtilityTerritories: {
    id: "hifld-electric-retail-service-territories",
    name: "HIFLD — Electric Retail Service Territories (static 2025-08-21 mirror)",
    url: "https://services3.arcgis.com/OYP7N6mAJJCyH6hd/arcgis/rest/services/Electric_Retail_Service_Territories_HIFLD/FeatureServer/0",
    license: "Public (HIFLD / Oak Ridge National Laboratory, DOE CESER)",
    refreshFrequency: "Static snapshot (downloaded from HIFLD 2025-08-21; source dataset will not be updated further)",
    methodology: "Point-in-polygon lookup against nationwide retail electric service territory boundaries.",
  },
  /**
   * County-level population density, built by scripts/county_population_density.py
   * (Census Gazetteer land area ÷ Population Estimates Program headcount) and
   * bundled as a static asset — see src/lib/gis/data/countyPopulationDensity.json.
   * Joined at request time to live TIGERweb county polygons by GEOID. Used both
   * as a "community" map layer and, in power.ts, as a proxy for how much
   * existing residential/commercial load is already competing for headroom on
   * the local grid near a proposed site.
   */
  censusCountyDensity: {
    id: "census-county-population-density",
    name: "US Census Bureau — County Population Density (PEP + Gazetteer)",
    url: "https://www2.census.gov/programs-surveys/popest/datasets/",
    license: "Public domain (US Census Bureau)",
    refreshFrequency: "Annual (Population Estimates Program vintage; land area from the Census Gazetteer)",
    methodology:
      "County population (Census Bureau Population Estimates Program, most recent published vintage) divided by land area (Census Gazetteer ALAND_SQMI) to give people per square mile, joined to live TIGERweb county boundaries by GEOID. A higher-density county carries more existing residential/commercial demand on the same distribution and transmission system, which is one factor (not a substitute for a utility interconnection study) in how much headroom may remain for a new large load.",
  },
  usDroughtMonitor: {
    id: "us-drought-monitor",
    name: "U.S. Drought Monitor — Current Conditions",
    url: "https://services5.arcgis.com/0OTVzJS4K09zlixn/arcgis/rest/services/USDM_current/FeatureServer/0",
    license: "Public (NDMC / NOAA / USDA)",
    refreshFrequency: "Weekly, released Thursdays",
    methodology: "Point-in-polygon lookup against the current weekly drought classification (D0 abnormally dry through D4 exceptional drought).",
  },
} satisfies Record<string, SourceMeta>;
