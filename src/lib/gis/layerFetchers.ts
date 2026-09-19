import { queryArcGisGeoJSON } from "./arcgis";
import { TTL } from "@/lib/cache/memoryCache";
import { WA_SOURCES } from "@/states/washington/sources";
import { WA_EXISTING_DATA_CENTERS } from "@/states/washington/data/existingDataCenters";
import {
  fetchFloodZones,
  fetchHydrographyRivers,
  fetchHydrographyWaterbodies,
  fetchPopulationTracts,
  generalizationFor,
  makeColocationFacilitiesFetcher,
  makeDataCentersFetcher,
  makePowerPlantsFetcher,
  makeUsgsGaugesFetcher,
  withGracefulDegradation,
} from "./nationalLayers";
import type { Bbox, LayerFetcher } from "./types";

export type { Bbox } from "./types";

// ---------------------------------------------------------------- POWER

async function fetchTransmissionLines(bbox: Bbox) {
  return queryArcGisGeoJSON(WA_SOURCES.bpaTransmission.url, {
    bbox,
    outFields: "XRefCd,OperatingLineNm,VoltageMeas",
  });
}

async function fetchUtilityTerritories(bbox: Bbox) {
  return queryArcGisGeoJSON(WA_SOURCES.waUtilityTerritories.url, {
    bbox,
    outFields: "Name",
    maxAllowableOffset: generalizationFor(bbox),
  });
}

// ---------------------------------------------------------------- WATER

async function fetchWaterDiversions(bbox: Bbox) {
  return queryArcGisGeoJSON(WA_SOURCES.waWaterDiversions.url, { bbox });
}

async function fetchInstreamFlow(bbox: Bbox) {
  return queryArcGisGeoJSON(WA_SOURCES.waInstreamFlow.url, { bbox, maxAllowableOffset: generalizationFor(bbox) });
}

async function fetchDroughtAreas(bbox: Bbox) {
  return queryArcGisGeoJSON(WA_SOURCES.waDroughtAreas.url, { bbox, maxAllowableOffset: generalizationFor(bbox) });
}

// ----------------------------------------------------------- ENVIRONMENT

async function fetchStateHighways(bbox: Bbox) {
  return queryArcGisGeoJSON(
    WA_SOURCES.wsdotHighways.url,
    { bbox, outFields: "StateRouteNumber,FederalFunctionalClassCode,FederalFunctionalClassDesc" },
    TTL.ONE_DAY
  );
}

const RAW_FETCHERS: Record<string, LayerFetcher<any>> = {
  "transmission-lines": fetchTransmissionLines,
  "utility-territories": fetchUtilityTerritories,
  "hydrography-rivers": fetchHydrographyRivers,
  "hydrography-waterbodies": fetchHydrographyWaterbodies,
  "water-diversions": fetchWaterDiversions,
  "instream-flow": fetchInstreamFlow,
  "drought-areas": fetchDroughtAreas,
  "usgs-gauges": makeUsgsGaugesFetcher("WA"),
  "colocation-facilities": makeColocationFacilitiesFetcher("WA"),
  "flood-zones": fetchFloodZones,
  "state-highways": fetchStateHighways,
  "population-tracts": fetchPopulationTracts,
  "data-centers": makeDataCentersFetcher("WA", WA_EXISTING_DATA_CENTERS),
  "power-plants": makePowerPlantsFetcher("WA"),
};

/**
 * Every fetcher is wrapped so an upstream failure (rate limit, outage, timeout) degrades
 * just that one layer/metric to "no features" rather than throwing through the analysis
 * pipeline (used directly by src/lib/analysis/*) or the map's GIS route. Callers read an
 * empty FeatureCollection as "unavailable" and label the corresponding metric UNKNOWN —
 * they never see the exception.
 */
export const WA_LAYER_FETCHERS: Record<string, LayerFetcher<any>> = withGracefulDegradation(RAW_FETCHERS);
