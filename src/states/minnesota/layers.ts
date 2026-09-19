import type { LayerDefinition } from "@/lib/types";
import { MN_SOURCES } from "./sources";
import { NATIONAL_SOURCES } from "@/lib/gis/nationalSources";

/**
 * Full layer registry for Minnesota — mirrors src/states/washington/layers.ts.
 * Layer ids that represent the same concept as Washington's (transmission-lines,
 * utility-territories, hydrography-*, flood-zones, population-tracts,
 * power-plants, data-centers, colocation-facilities) reuse WA's exact ids so
 * the map styling, popup content, and layer-control-panel code need zero
 * per-state branching. "substations", "broadband-coverage" and "protected-land"
 * are Minnesota-only bonus layers with no Washington equivalent yet — they
 * render with the generic default styling in layerStyles.ts.
 *
 * No "water-diversions", "drought-areas", or "state-highways" layers: no
 * live public dataset was found for MN water-appropriation permits, a
 * drought-declaration polygon layer, or a statewide roads service — see
 * minnesota/analysisContext.ts for how the analysis engine degrades those
 * to UNKNOWN rather than guessing.
 */
export const MN_LAYERS: LayerDefinition[] = [
  // ---------------------------------------------------------------- POWER
  {
    id: "transmission-lines",
    name: "Electric Transmission Lines",
    shortName: "Transmission",
    category: "power",
    geometryType: "line",
    source: MN_SOURCES.transmissionNational,
    confidence: "fact",
    description: "Transmission line geometry and voltage class (national HIFLD-schema mirror; MN's own MnGeo layer was withdrawn — owner attribution is often unavailable).",
    defaultVisible: true,
    endpoint: "/api/gis/mn/transmission-lines",
    legend: [
      { label: "500 kV+", color: "#ff5470", swatch: "line", lineWidth: 3 },
      { label: "230–499 kV", color: "#f2b93b", swatch: "line", lineWidth: 2.5 },
      { label: "115–229 kV", color: "#f2d98b", swatch: "line", lineWidth: 2 },
      { label: "< 115 kV / unknown", color: "#8fa3bf", swatch: "line", lineWidth: 1.5 },
    ],
  },
  {
    id: "substations",
    name: "Electric Substations",
    category: "power",
    geometryType: "point",
    source: MN_SOURCES.substationsNational,
    confidence: "fact",
    description: "Substation locations (national HIFLD-schema mirror, filtered to MN). Available capacity/headroom is not public data — location only.",
    defaultVisible: false,
    endpoint: "/api/gis/mn/substations",
    color: "#c9722f",
    legend: [{ label: "Substation", color: "#c9722f", swatch: "circle" }],
  },
  {
    id: "utility-territories",
    name: "Electric Utility Service Areas",
    shortName: "Utility Territories",
    category: "power",
    geometryType: "polygon",
    source: MN_SOURCES.utilityServiceAreas,
    confidence: "fact",
    description: "MnGeo/PUC-sourced electric utility service-area boundaries (municipal, cooperative, investor-owned).",
    defaultVisible: false,
    endpoint: "/api/gis/mn/utility-territories",
    color: "#5b7a9d",
    legend: [{ label: "Utility territory boundary", color: "#5b7a9d", swatch: "fill" }],
  },

  // ---------------------------------------------------------------- WATER
  {
    id: "hydrography-rivers",
    name: "Rivers & Streams",
    category: "water",
    geometryType: "line",
    source: MN_SOURCES.dnrPublicWatersLines,
    confidence: "fact",
    description: "Minnesota DNR Public Waters Inventory — statutorily designated watercourses.",
    defaultVisible: true,
    endpoint: "/api/gis/mn/hydrography-rivers",
    color: "#3ba9f2",
    legend: [{ label: "River / stream", color: "#3ba9f2", swatch: "line", lineWidth: 1.5 }],
  },
  {
    id: "hydrography-waterbodies",
    name: "Lakes & Wetlands",
    category: "water",
    geometryType: "polygon",
    source: MN_SOURCES.dnrPublicWatersBasins,
    confidence: "fact",
    description: "Minnesota DNR Public Waters Inventory — statutorily designated lake/wetland basins.",
    defaultVisible: true,
    endpoint: "/api/gis/mn/hydrography-waterbodies",
    color: "#1f6fa8",
    legend: [{ label: "Lake / wetland", color: "#1f6fa8", swatch: "fill" }],
  },
  {
    id: "usgs-gauges",
    name: "USGS Streamflow Gauges",
    category: "water",
    geometryType: "point",
    source: NATIONAL_SOURCES.usgsNwisGauges,
    confidence: "fact",
    description: "Active USGS surface-water monitoring stations with current discharge readings.",
    defaultVisible: false,
    endpoint: "/api/gis/mn/usgs-gauges",
    color: "#63d4ff",
    legend: [{ label: "Active gauge", color: "#63d4ff", swatch: "circle" }],
  },

  // --------------------------------------------------------- CONNECTIVITY
  {
    id: "colocation-facilities",
    name: "Colocation / Interconnection Facilities",
    shortName: "Colo Facilities",
    category: "connectivity",
    geometryType: "point",
    source: NATIONAL_SOURCES.peeringDb,
    confidence: "fact",
    description: "PeeringDB-listed carrier hotels and colocation facilities — a proxy for interconnection density, not a survey of long-haul fiber routes.",
    defaultVisible: true,
    endpoint: "/api/gis/mn/colocation-facilities",
    color: "#9b6ef2",
    legend: [{ label: "Colocation / IX facility", color: "#9b6ef2", swatch: "circle" }],
  },
  {
    id: "broadband-coverage",
    name: "Fiber Broadband Coverage",
    shortName: "Fiber Coverage",
    category: "connectivity",
    geometryType: "polygon",
    source: MN_SOURCES.deedBroadbandFiber,
    confidence: "proxy",
    description: "MN DEED / Connected Nation fiber-technology coverage areas — a coarse dissolved-polygon proxy, not address-level or long-haul route data.",
    defaultVisible: false,
    endpoint: "/api/gis/mn/broadband-coverage",
    color: "#6ed4c8",
    legend: [{ label: "Fiber coverage area (proxy)", color: "#6ed4c8", swatch: "fill" }],
  },

  // ----------------------------------------------------------- ENVIRONMENT
  {
    id: "flood-zones",
    name: "FEMA Flood Hazard Zones",
    shortName: "Flood Zones",
    category: "environment",
    geometryType: "polygon",
    source: NATIONAL_SOURCES.femaNfhl,
    confidence: "fact",
    description: "Effective FEMA National Flood Hazard Layer zones, where mapped.",
    defaultVisible: false,
    endpoint: "/api/gis/mn/flood-zones",
    color: "#e0524a",
    legend: [
      { label: "High risk (A/AE/V zones)", color: "#e0524a", swatch: "fill" },
      { label: "Moderate/minimal (X/other)", color: "#e0a84a", swatch: "fill" },
    ],
  },
  {
    id: "protected-land",
    name: "Conservation Easements (RIM Reserve)",
    shortName: "Conservation Land",
    category: "environment",
    geometryType: "polygon",
    source: MN_SOURCES.bwsrConservationEasements,
    confidence: "fact",
    description: "State-funded perpetual conservation easements (MN Board of Water & Soil Resources).",
    defaultVisible: false,
    endpoint: "/api/gis/mn/protected-land",
    color: "#4fae6a",
    legend: [{ label: "Conservation easement", color: "#4fae6a", swatch: "fill" }],
  },

  // -------------------------------------------------------------- COMMUNITY
  {
    id: "population-tracts",
    name: "Census Tract Boundaries",
    category: "community",
    geometryType: "polygon",
    source: NATIONAL_SOURCES.censusTiger,
    confidence: "fact",
    description: "US Census tract boundaries, used for population-proximity estimates.",
    defaultVisible: false,
    endpoint: "/api/gis/mn/population-tracts",
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
    source: NATIONAL_SOURCES.eia,
    confidence: "unknown",
    description: "Nearby generating facilities from EIA. Requires a server-side EIA_API_KEY — shown as unavailable until configured.",
    defaultVisible: true,
    endpoint: "/api/gis/mn/power-plants",
    color: "#f2b93b",
    legend: [{ label: "Generating facility", color: "#f2b93b", swatch: "circle" }],
  },
  {
    id: "data-centers",
    name: "Known Data Center Campuses",
    shortName: "Data Centers",
    category: "existing_infrastructure",
    geometryType: "point",
    source: MN_SOURCES.curatedDataCenters,
    confidence: "unknown",
    description: "No verified, geolocated Minnesota data center facilities have been catalogued yet.",
    defaultVisible: true,
    endpoint: "/api/gis/mn/data-centers",
    color: "#8fa3bf",
    legend: [{ label: "Existing data center campus", color: "#8fa3bf", swatch: "circle" }],
  },
];

export function getMnLayer(id: string): LayerDefinition | undefined {
  return MN_LAYERS.find((l) => l.id === id);
}
