import type { SourceMeta } from "@/lib/types";

/**
 * Source metadata for datasets that are genuinely nationwide (same URL/schema
 * for any US state) — shared by every state's own sources.ts rather than
 * copy-pasted. Per the two-layer build principle: national layer once, state
 * layers add only what's actually state-specific.
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
    methodology: "Active surface-water gauge sites with current discharge reading, filtered by state code and radius.",
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
    methodology: "Tract-level population, area-weighted against a radius buffer.",
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
} satisfies Record<string, SourceMeta>;
