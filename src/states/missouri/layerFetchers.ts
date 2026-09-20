import type { FeatureCollection, Point } from "geojson";
import { queryArcGisGeoJSON, type Bbox } from "@/lib/gis/arcgis";
import {
  fetchNhdFlowline,
  fetchNhdWaterbody,
  fetchUsgsGauges,
  fetchColocationFacilities,
  fetchFemaFloodZones,
  fetchPopulationTracts,
  fetchCountyPopulationDensity,
  fetchEiaPowerPlants,
  fetchHifldTransmissionLines,
  fetchHifldUtilityTerritories,
  fetchUsDroughtMonitor,
} from "@/lib/gis/nationalFetchers";
import { MO_SOURCES } from "./sources";
import { MO_EXISTING_DATA_CENTERS } from "./data/existingDataCenters";

function inBbox(lng: number, lat: number, bbox: Bbox): boolean {
  return lng >= bbox[0] && lng <= bbox[2] && lat >= bbox[1] && lat <= bbox[3];
}

async function fetchGroundwaterObservationWells(bbox: Bbox): Promise<FeatureCollection> {
  return queryArcGisGeoJSON(MO_SOURCES.groundwaterObservationWells.url, {
    bbox,
    outFields: "SITENAME,OBJECTID",
    resultRecordCount: 2000,
  });
}

async function fetchPublicWaterSources(bbox: Bbox): Promise<FeatureCollection> {
  const [wells, intakes] = await Promise.all([
    queryArcGisGeoJSON(MO_SOURCES.publicDrinkingWaterWells.url, {
      bbox,
      outFields: "PWSSNAME,LOCALNAME,STATUS,COUNTY,YIELD,PUMPCAPACI,D_POPULATION_COUNT,D_TTL_STOR_CAP_MSR",
      resultRecordCount: 2000,
    }),
    queryArcGisGeoJSON(MO_SOURCES.publicDrinkingWaterIntakes.url, {
      bbox,
      outFields: "PWSSNAME,LOCALNAME,STATUS,SOURCENAME,COUNTY,D_POPULATION_COUNT,D_TTL_STOR_CAP_MSR",
      resultRecordCount: 2000,
    }),
  ]);
  return { type: "FeatureCollection", features: [...wells.features, ...intakes.features] };
}

async function fetchDataCenters(bbox: Bbox): Promise<FeatureCollection<Point>> {
  const features = MO_EXISTING_DATA_CENTERS.features.filter((f) =>
    inBbox(f.geometry.coordinates[0]!, f.geometry.coordinates[1]!, bbox)
  );
  return { type: "FeatureCollection", features };
}

const RAW_FETCHERS: Record<string, (bbox: Bbox) => Promise<FeatureCollection>> = {
  "transmission-lines": fetchHifldTransmissionLines,
  "utility-territories": fetchHifldUtilityTerritories,
  "hydrography-rivers": fetchNhdFlowline,
  "hydrography-waterbodies": fetchNhdWaterbody,
  "usgs-gauges": (bbox) => fetchUsgsGauges(bbox, "MO"),
  "drought-areas": fetchUsDroughtMonitor,
  "groundwater-observation-wells": fetchGroundwaterObservationWells,
  "public-water-sources": fetchPublicWaterSources,
  "colocation-facilities": (bbox) => fetchColocationFacilities(bbox, "MO"),
  "flood-zones": fetchFemaFloodZones,
  "population-tracts": fetchPopulationTracts,
  "population-density": fetchCountyPopulationDensity,
  "data-centers": fetchDataCenters,
  "power-plants": (bbox) => fetchEiaPowerPlants(bbox, "MO"),
};

export const MO_LAYER_FETCHERS: Record<string, (bbox: Bbox) => Promise<FeatureCollection>> = Object.fromEntries(
  Object.entries(RAW_FETCHERS).map(([layerId, fetcher]) => [
    layerId,
    async (bbox: Bbox): Promise<FeatureCollection> => {
      try {
        return await fetcher(bbox);
      } catch (err) {
        console.error(
          `[mo-layer:${layerId}] fetch failed, treating as unavailable:`,
          err instanceof Error ? err.message : err
        );
        return { type: "FeatureCollection", features: [] };
      }
    },
  ])
);
