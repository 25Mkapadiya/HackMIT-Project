import type { FeatureCollection, Point } from "geojson";
import { queryArcGisGeoJSON, type Bbox } from "@/lib/gis/arcgis";
import {
  fetchNhdFlowline,
  fetchNhdWaterbody,
  fetchUsgsGauges,
  fetchColocationFacilities,
  fetchFemaFloodZones,
  fetchPopulationTracts,
  fetchEiaPowerPlants,
  fetchHifldTransmissionLines,
  fetchHifldUtilityTerritories,
  fetchUsDroughtMonitor,
} from "@/lib/gis/nationalFetchers";
import { OK_SOURCES } from "./sources";
import { OK_EXISTING_DATA_CENTERS } from "./data/existingDataCenters";

function inBbox(lng: number, lat: number, bbox: Bbox): boolean {
  return lng >= bbox[0] && lng <= bbox[2] && lat >= bbox[1] && lat <= bbox[3];
}

// ---------------------------------------------------------------- WATER
// OWRB's "Permitted Surface Water Diversion Points" and "Permitted Groundwater
// Wells" layers share an identical schema (entity_name, permit_number, status,
// total_permitted_acre_feet, primary_purpose, county, water, ...) — merged here
// into one "water-diversions" layer, matching Washington's single diversions
// layer shape so the popup (generic property dump) and water.ts analysis work
// unmodified.

async function fetchOwrbWaterRights(bbox: Bbox): Promise<FeatureCollection> {
  const [surface, groundwater] = await Promise.all([
    queryArcGisGeoJSON(OK_SOURCES.owrbSurfaceWaterRights.url, {
      bbox,
      outFields: "entity_name,permit_number,status,water,primary_purpose,total_permitted_acre_feet,county,permit_type",
    }),
    queryArcGisGeoJSON(OK_SOURCES.owrbGroundwaterWells.url, {
      bbox,
      outFields: "entity_name,permit_number,status,water,primary_purpose,total_permitted_acre_feet,county,permit_type",
    }),
  ]);
  return { type: "FeatureCollection", features: [...surface.features, ...groundwater.features] };
}

// ----------------------------------------------------- EXISTING INFRA

async function fetchDataCenters(bbox: Bbox): Promise<FeatureCollection<Point>> {
  const features = OK_EXISTING_DATA_CENTERS.features.filter((f) =>
    inBbox(f.geometry.coordinates[0]!, f.geometry.coordinates[1]!, bbox)
  );
  return { type: "FeatureCollection", features };
}

const RAW_FETCHERS: Record<string, (bbox: Bbox) => Promise<FeatureCollection>> = {
  "transmission-lines": fetchHifldTransmissionLines,
  "utility-territories": fetchHifldUtilityTerritories,
  "hydrography-rivers": fetchNhdFlowline,
  "hydrography-waterbodies": fetchNhdWaterbody,
  "water-diversions": fetchOwrbWaterRights,
  "drought-areas": fetchUsDroughtMonitor,
  "usgs-gauges": (bbox) => fetchUsgsGauges(bbox, "OK"),
  "colocation-facilities": (bbox) => fetchColocationFacilities(bbox, "OK"),
  "flood-zones": fetchFemaFloodZones,
  "population-tracts": fetchPopulationTracts,
  "data-centers": fetchDataCenters,
  "power-plants": (bbox) => fetchEiaPowerPlants(bbox, "OK"),
  // No "state-highways" entry: no verified Oklahoma road-classification GIS
  // service was found for this integration. land.ts's nearestMajorRoadMiles
  // metric degrades to UNKNOWN for Oklahoma rather than guessing.
};

/** Same fail-soft wrapping as WA_LAYER_FETCHERS — see that file for rationale. */
export const OK_LAYER_FETCHERS: Record<string, (bbox: Bbox) => Promise<FeatureCollection>> = Object.fromEntries(
  Object.entries(RAW_FETCHERS).map(([layerId, fetcher]) => [
    layerId,
    async (bbox: Bbox): Promise<FeatureCollection> => {
      try {
        return await fetcher(bbox);
      } catch (err) {
        console.error(`[ok-layer:${layerId}] fetch failed, treating as unavailable:`, err instanceof Error ? err.message : err);
        return { type: "FeatureCollection", features: [] };
      }
    },
  ])
);
