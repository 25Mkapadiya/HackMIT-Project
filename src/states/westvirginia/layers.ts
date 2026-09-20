import type { LayerDefinition } from "@/lib/types";
import { WV_SOURCES } from "./sources";

/**
 * Full layer registry for West Virginia — mirrors src/states/virginia/layers.ts.
 * No "water-diversions" or "state-highways" layers — see sources.ts.
 */
export const WV_LAYERS: LayerDefinition[] = [
  // ---------------------------------------------------------------- POWER
  {
    id: "transmission-lines-high",
    name: "High-Voltage Transmission Lines (≥230 kV)",
    shortName: "Transmission (High)",
    category: "power",
    geometryType: "line",
    source: WV_SOURCES.hifldTransmission,
    confidence: "fact",
    description:
      "HIFLD transmission line geometry and voltage class (nationwide extract, static — see source note). West Virginia is served primarily by Appalachian Power, Monongahela Power, Potomac Edison, and Wheeling Power, within PJM Interconnection.",
    defaultVisible: true,
    endpoint: "/api/gis/transmission-lines-high",
    color: "#ff5470",
    legend: [{ label: "230 kV and above", color: "#ff5470", swatch: "line", lineWidth: 3 }],
  },
  {
    id: "transmission-lines-low",
    name: "Low-Voltage Transmission Lines (<230 kV)",
    shortName: "Transmission (Low)",
    category: "power",
    geometryType: "line",
    source: WV_SOURCES.hifldTransmission,
    confidence: "fact",
    description:
      "HIFLD transmission line geometry and voltage class (nationwide extract, static — see source note). West Virginia is served primarily by Appalachian Power, Monongahela Power, Potomac Edison, and Wheeling Power, within PJM Interconnection.",
    defaultVisible: true,
    endpoint: "/api/gis/transmission-lines-low",
    color: "#f2c94c",
    legend: [{ label: "Below 230 kV / unknown", color: "#f2c94c", swatch: "line", lineWidth: 1.8 }],
  },
  {
    id: "utility-territories",
    name: "Electric Utility Retail Service Territories",
    shortName: "Utility Territories",
    category: "power",
    geometryType: "polygon",
    source: WV_SOURCES.hifldUtilityTerritories,
    confidence: "proxy",
    description:
      "HIFLD electric retail service territory boundaries (static 2025-08-21 snapshot). Informational — not an official service determination and will not reflect subsequent changes.",
    defaultVisible: false,
    endpoint: "/api/gis/utility-territories",
    color: "#5b7a9d",
    legend: [{ label: "Utility territory boundary", color: "#5b7a9d", swatch: "fill" }],
  },
  {
    id: "electric-substations",
    name: "Electric Substations",
    shortName: "Substations",
    category: "power",
    geometryType: "point",
    source: WV_SOURCES.hifldSubstations,
    confidence: "fact",
    description:
      "HIFLD electric substation locations (nationwide legacy extract, static — see source note), split by transmission voltage tier. Distance to the nearest substation is a proxy for interconnection access, not confirmed available capacity.",
    defaultVisible: true,
    endpoint: "/api/gis/electric-substations",
    legend: [
      { label: "345 kV+", color: "#ff5470", swatch: "circle" },
      { label: "115–344 kV", color: "#f2b93b", swatch: "circle" },
      { label: "< 115 kV / unknown", color: "#8fa3bf", swatch: "circle" },
    ],
  },

  // ---------------------------------------------------------------- WATER
  {
    id: "hydrography-rivers",
    name: "Rivers & Streams",
    category: "water",
    geometryType: "line",
    source: WV_SOURCES.usgsNhdFlowline,
    confidence: "fact",
    description: "USGS National Hydrography Dataset flowlines (small-scale), including the Ohio, Kanawha, Monongahela, New, and Potomac River systems.",
    defaultVisible: true,
    endpoint: "/api/gis/hydrography-rivers",
    color: "#3ba9f2",
    legend: [{ label: "River / stream", color: "#3ba9f2", swatch: "line", lineWidth: 1.5 }],
  },
  {
    id: "hydrography-waterbodies",
    name: "Water Bodies (Lakes & Reservoirs)",
    shortName: "Water Bodies",
    category: "water",
    geometryType: "polygon",
    source: WV_SOURCES.usgsNhdWaterbody,
    confidence: "fact",
    description: "USGS National Hydrography Dataset waterbody polygons (small-scale).",
    defaultVisible: true,
    endpoint: "/api/gis/hydrography-waterbodies",
    color: "#1f6fa8",
    legend: [{ label: "Lake / reservoir", color: "#1f6fa8", swatch: "fill" }],
  },
  {
    id: "usgs-gauges",
    name: "USGS Streamflow Gauges",
    category: "water",
    geometryType: "point",
    source: WV_SOURCES.usgsNwisGauges,
    confidence: "fact",
    description: "Active USGS surface-water monitoring stations with current discharge readings.",
    defaultVisible: false,
    endpoint: "/api/gis/usgs-gauges",
    color: "#63d4ff",
    legend: [{ label: "Active gauge", color: "#63d4ff", swatch: "circle" }],
  },
  {
    id: "drought-areas",
    name: "U.S. Drought Monitor — Current Conditions",
    shortName: "Drought",
    category: "water",
    geometryType: "polygon",
    source: WV_SOURCES.usDroughtMonitor,
    confidence: "fact",
    description: "Current weekly drought classification (D0 abnormally dry through D4 exceptional drought), released Thursdays by NDMC/NOAA/USDA. West Virginia generally benefits from abundant water resources relative to many competing regions.",
    defaultVisible: false,
    endpoint: "/api/gis/drought-areas",
    color: "#c9722f",
    legend: [
      { label: "D0 Abnormally dry", color: "#f2d98b", swatch: "fill" },
      { label: "D1–D2 Moderate–severe", color: "#e0a84a", swatch: "fill" },
      { label: "D3–D4 Extreme–exceptional", color: "#c9722f", swatch: "fill" },
    ],
  },

  // --------------------------------------------------------- CONNECTIVITY
  {
    id: "colocation-facilities",
    name: "Colocation / Interconnection Facilities",
    shortName: "Colo Facilities",
    category: "connectivity",
    geometryType: "point",
    source: WV_SOURCES.peeringDb,
    confidence: "fact",
    description:
      "PeeringDB-listed carrier hotels and colocation facilities — a proxy for interconnection density, not a survey of long-haul fiber routes through the Eastern Panhandle toward Northern Virginia.",
    defaultVisible: true,
    endpoint: "/api/gis/colocation-facilities",
    color: "#9b6ef2",
    legend: [{ label: "Colocation / IX facility", color: "#9b6ef2", swatch: "circle" }],
  },

  // ----------------------------------------------------------- ENVIRONMENT
  {
    id: "flood-zones",
    name: "FEMA Flood Hazard Zones",
    shortName: "Flood Zones",
    category: "environment",
    geometryType: "polygon",
    source: WV_SOURCES.femaNfhl,
    confidence: "fact",
    description: "Effective FEMA National Flood Hazard Layer zones, where mapped. The Ohio River Valley, Kanawha Basin, Monongahela Basin, and narrow mountain valleys are priority areas to check.",
    defaultVisible: false,
    endpoint: "/api/gis/flood-zones",
    color: "#e0524a",
    legend: [
      { label: "High risk (A/AE/V zones)", color: "#e0524a", swatch: "fill" },
      { label: "Moderate/minimal (X/other)", color: "#e0a84a", swatch: "fill" },
    ],
  },
  {
    id: "forest-cover",
    name: "Forest / Tree Canopy",
    shortName: "Forests",
    category: "environment",
    geometryType: "raster",
    source: WV_SOURCES.cartoForestCover,
    confidence: "proxy",
    description:
      "Visual forest/wood land-cover polygons from the CARTO basemap's OpenStreetMap-derived landcover layer (e.g. Monongahela National Forest). Optimized for clear map reading; not an authoritative forestry inventory.",
    defaultVisible: false,
    color: "#4f7f50",
    legend: [{ label: "Tree canopy / forest cover", color: "#4f7f50", swatch: "fill" }],
  },
  {
    id: "terrain-hillshade",
    name: "Terrain / Elevation",
    shortName: "Terrain",
    category: "environment",
    geometryType: "raster",
    source: WV_SOURCES.usgsShadedRelief,
    confidence: "fact",
    description:
      "USGS The National Map cached shaded relief, derived from 3DEP at large and medium scales — useful for reading West Virginia's mountainous terrain and narrow valleys.",
    defaultVisible: false,
    color: "#8d8a82",
    legend: [{ label: "Shaded terrain relief", color: "#8d8a82", swatch: "fill" }],
  },

  // -------------------------------------------------------------- COMMUNITY
  {
    id: "population-tracts",
    name: "Census Tract Boundaries",
    category: "community",
    geometryType: "polygon",
    source: WV_SOURCES.censusTiger,
    confidence: "fact",
    description: "US Census tract boundaries, used for population-proximity estimates.",
    defaultVisible: false,
    endpoint: "/api/gis/population-tracts",
    color: "#6b7f99",
    legend: [{ label: "Census tract boundary", color: "#6b7f99", swatch: "line" }],
  },
  {
    id: "population-density",
    name: "County Population Density",
    shortName: "Pop. Density",
    category: "community",
    geometryType: "polygon",
    source: WV_SOURCES.censusCountyDensity,
    confidence: "estimated",
    description:
      "County-level population density (people per sq mi), combining Census Population Estimates with Gazetteer land area, shown as a quiet background wash (no highlight below 25/sq mi). Denser counties tend to carry more existing residential/commercial load on the local grid, competing with a new large facility for available transmission and substation headroom — the same amber-to-red \"demand pressure\" scale also appears as a soft glow along transmission lines that run through these counties.",
    defaultVisible: false,
    endpoint: "/api/gis/population-density",
    legend: [
      { label: "< 25 / sq mi — no highlight (rural)", color: "#2a3342", swatch: "fill" },
      { label: "25–150 / sq mi (suburban)", color: "#f2b93b", swatch: "fill" },
      { label: "150–1,000 / sq mi (urban)", color: "#f2703b", swatch: "fill" },
      { label: "1,000+ / sq mi (dense urban)", color: "#ff5470", swatch: "fill" },
    ],
  },

  // ----------------------------------------------------- EXISTING INFRA
  {
    id: "power-plants",
    name: "Power Generation Facilities",
    shortName: "Generation",
    category: "existing_infrastructure",
    geometryType: "point",
    source: WV_SOURCES.eia,
    confidence: "unknown",
    description:
      "Nearby generating facilities from EIA. West Virginia's generation mix includes coal, natural gas, hydroelectric, and wind. Requires a server-side EIA_API_KEY — shown as unavailable until configured.",
    defaultVisible: true,
    endpoint: "/api/gis/power-plants",
    color: "#f2b93b",
    legend: [{ label: "Generating facility", color: "#f2b93b", swatch: "circle" }],
  },
  {
    id: "data-centers",
    name: "Known / Announced Data Center Campuses",
    shortName: "Data Centers",
    category: "existing_infrastructure",
    geometryType: "point",
    source: WV_SOURCES.curatedDataCenters,
    confidence: "proxy",
    description: "Hand-curated, illustrative list of publicly reported West Virginia data center campuses/projects. Not exhaustive.",
    defaultVisible: true,
    endpoint: "/api/gis/data-centers",
    color: "#8fa3bf",
    legend: [{ label: "Existing / announced data center campus", color: "#8fa3bf", swatch: "circle" }],
  },
];

export function getWvLayer(id: string): LayerDefinition | undefined {
  return WV_LAYERS.find((l) => l.id === id);
}
