import type { FeatureCollection } from "geojson";
import { queryArcGisGeoJSON, type Bbox } from "./arcgis";
import { TTL } from "@/lib/cache/memoryCache";
import { WA_SOURCES } from "@/states/washington/sources";
import { WA_EXISTING_DATA_CENTERS } from "@/states/washington/data/existingDataCenters";
import {
  fetchNhdFlowline,
  fetchNhdWaterbody,
  fetchUsgsGauges,
  fetchColocationFacilities,
  fetchFemaFloodZones,
  fetchPopulationTracts,
  fetchEiaPowerPlants,
  makeExistingDataCentersFetcher,
} from "./nationalFetchers";

export type { Bbox };

/**
 * Geometry generalization tolerance (degrees), scaled to query width.
 * A statewide query (~8° wide) gets generalized hard (huge polygon layers like
 * FEMA flood zones and census tracts are multi-tens-of-MB at full resolution);
 * a small analysis-radius query (a few tenths of a degree) stays effectively
 * full-resolution, since exact-boundary precision matters there.
 */
function generalizationFor(bbox: Bbox): number {
  const width = bbox[2] - bbox[0];
  return Math.max(0.00005, width / 600);
}

// ---------------------------------------------------------------- POWER
// Washington has its own dedicated BPA feed (line-level, better than the
// nationwide HIFLD extract) — kept as-is rather than routed through the
// shared national transmission fetcher other states use.

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
// National Forest System boundaries (USFS) are no longer fetched as a layer —
// forest cover is now shown via the CARTO basemap's own vector landcover
// (see MapView.tsx's "forest-cover" effect), which reads better at every zoom
// and isn't limited to federally-administered land.

async function fetchStateHighways(bbox: Bbox) {
  return queryArcGisGeoJSON(
    WA_SOURCES.wsdotHighways.url,
    { bbox, outFields: "StateRouteNumber,FederalFunctionalClassCode,FederalFunctionalClassDesc" },
    TTL.ONE_DAY
  );
}

// ----------------------------------------------------- EXISTING INFRA

const RAW_FETCHERS: Record<string, (bbox: Bbox) => Promise<FeatureCollection>> = {
  "transmission-lines": fetchTransmissionLines,
  "utility-territories": fetchUtilityTerritories,
  "hydrography-rivers": fetchNhdFlowline,
  "hydrography-waterbodies": fetchNhdWaterbody,
  "water-diversions": fetchWaterDiversions,
  "instream-flow": fetchInstreamFlow,
  "drought-areas": fetchDroughtAreas,
  "usgs-gauges": (bbox) => fetchUsgsGauges(bbox, "WA"),
  "colocation-facilities": (bbox) => fetchColocationFacilities(bbox, "WA"),
  "flood-zones": fetchFemaFloodZones,
  "state-highways": fetchStateHighways,
  "population-tracts": fetchPopulationTracts,
  "data-centers": makeExistingDataCentersFetcher("WA", WA_EXISTING_DATA_CENTERS),
  "power-plants": (bbox) => fetchEiaPowerPlants(bbox, "WA"),
};

/**
 * Every fetcher is wrapped so an upstream failure (rate limit, outage, timeout) degrades
 * just that one layer/metric to "no features" rather than throwing through the analysis
 * pipeline (used directly by src/lib/analysis/*) or the map's GIS route. Callers read an
 * empty FeatureCollection as "unavailable" and label the corresponding metric UNKNOWN —
 * they never see the exception.
 */
export const WA_LAYER_FETCHERS: Record<string, (bbox: Bbox) => Promise<FeatureCollection>> = Object.fromEntries(
  Object.entries(RAW_FETCHERS).map(([layerId, fetcher]) => [
    layerId,
    async (bbox: Bbox): Promise<FeatureCollection> => {
      try {
        return await fetcher(bbox);
      } catch (err) {
        console.error(`[layer:${layerId}] fetch failed, treating as unavailable:`, err instanceof Error ? err.message : err);
        return { type: "FeatureCollection", features: [] };
      }
    },
  ])
);
