import type { LayerDefinition } from "@/lib/types";
import { IA_SOURCES } from "./sources";

/**
 * Full layer registry for Iowa — mirrors src/states/delaware/layers.ts.
 * No "water-diversions" or "state-highways" layers — see sources.ts.
 */
export const IA_LAYERS: LayerDefinition[] = [
  // ---------------------------------------------------------------- POWER
  {
    id: "transmission-lines",
    name: "Electric Power Transmission Lines",
    shortName: "Transmission",
    category: "power",
    geometryType: "line",
    source: IA_SOURCES.hifldTransmission,
    confidence: "fact",
    description:
      "HIFLD transmission line geometry and voltage class (nationwide extract, static — see source note). Iowa contains 345 kV backbone infrastructure and operates largely within MISO, with portions influenced by SPP near western boundaries.",
    defaultVisible: true,
    endpoint: "/api/gis/transmission-lines",
    legend: [
      { label: "500 kV+", color: "#ff5470", swatch: "line", lineWidth: 3 },
      { label: "230–499 kV", color: "#f2b93b", swatch: "line", lineWidth: 2.5 },
      { label: "115–229 kV", color: "#f2d98b", swatch: "line", lineWidth: 2 },
      { label: "< 115 kV / unknown", color: "#8fa3bf", swatch: "line", lineWidth: 1.5 },
    ],
  },
  {
    id: "utility-territories",
    name: "Electric Utility Retail Service Territories",
    shortName: "Utility Territories",
    category: "power",
    geometryType: "polygon",
    source: IA_SOURCES.hifldUtilityTerritories,
    confidence: "proxy",
    description:
      "HIFLD electric retail service territory boundaries (static 2025-08-21 snapshot). Informational — not an official service determination and will not reflect subsequent changes.",
    defaultVisible: false,
    endpoint: "/api/gis/utility-territories",
    color: "#5b7a9d",
    legend: [{ label: "Utility territory boundary", color: "#5b7a9d", swatch: "fill" }],
  },

  // ---------------------------------------------------------------- WATER
  {
    id: "hydrography-rivers",
    name: "Rivers & Streams",
    category: "water",
    geometryType: "line",
    source: IA_SOURCES.usgsNhdFlowline,
    confidence: "fact",
    description: "USGS National Hydrography Dataset flowlines (small-scale), covering Iowa's river network including tributaries of the Mississippi and Missouri Rivers.",
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
    source: IA_SOURCES.usgsNhdWaterbody,
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
    source: IA_SOURCES.usgsNwisGauges,
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
    source: IA_SOURCES.usDroughtMonitor,
    confidence: "fact",
    description: "Current weekly drought classification (D0 abnormally dry through D4 exceptional drought), released Thursdays by NDMC/NOAA/USDA.",
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
    source: IA_SOURCES.peeringDb,
    confidence: "fact",
    description: "PeeringDB-listed carrier hotels and colocation facilities — a proxy for interconnection density.",
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
    source: IA_SOURCES.femaNfhl,
    confidence: "fact",
    description: "Effective FEMA National Flood Hazard Layer zones, where mapped. The Mississippi and Missouri River corridors are priority areas to check.",
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
    source: IA_SOURCES.cartoForestCover,
    confidence: "proxy",
    description:
      "Visual forest/wood land-cover polygons from the CARTO basemap's OpenStreetMap-derived landcover layer. Iowa is predominantly agricultural, so forest cover is limited outside river corridors. Not an authoritative forestry inventory.",
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
    source: IA_SOURCES.usgsShadedRelief,
    confidence: "fact",
    description: "USGS The National Map cached shaded relief, derived from 3DEP at large and medium scales.",
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
    source: IA_SOURCES.censusTiger,
    confidence: "fact",
    description: "US Census tract boundaries, used for population-proximity estimates.",
    defaultVisible: false,
    endpoint: "/api/gis/population-tracts",
    color: "#6b7f99",
    legend: [{ label: "Census tract boundary", color: "#6b7f99", swatch: "line" }],
  },

  // ----------------------------------------------------- EXISTING INFRA
  {
    id: "power-plants",
    name: "Power Generation Facilities",
    shortName: "Generation",
    category: "existing_infrastructure",
    geometryType: "point",
    source: IA_SOURCES.eia,
    confidence: "unknown",
    description:
      "Nearby generating facilities from EIA. Iowa's generation mix is heavily weighted toward wind, alongside natural gas, coal, and solar. Requires a server-side EIA_API_KEY — shown as unavailable until configured.",
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
    source: IA_SOURCES.curatedDataCenters,
    confidence: "proxy",
    description: "Hand-curated, illustrative list of publicly reported Iowa data center/hyperscale clusters. Not exhaustive.",
    defaultVisible: true,
    endpoint: "/api/gis/data-centers",
    color: "#8fa3bf",
    legend: [{ label: "Existing / announced data center campus", color: "#8fa3bf", swatch: "circle" }],
  },
];

export function getIaLayer(id: string): LayerDefinition | undefined {
  return IA_LAYERS.find((l) => l.id === id);
}
