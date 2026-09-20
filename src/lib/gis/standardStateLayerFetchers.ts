import type { FeatureCollection, Point } from "geojson";
import type { Bbox } from "./arcgis";
import type { DataCenterProps } from "@/states/washington/data/existingDataCenters";
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
  fetchHifldTransmissionLinesHigh,
  fetchHifldTransmissionLinesLow,
  fetchHifldUtilityTerritories,
  fetchHifldSubstations,
  fetchUsDroughtMonitor,
} from "./nationalFetchers";

export type Fetcher = (bbox: Bbox) => Promise<FeatureCollection>;

function inBbox(lng: number, lat: number, bbox: Bbox): boolean {
  return lng >= bbox[0] && lng <= bbox[2] && lat >= bbox[1] && lat <= bbox[3];
}

/**
 * Builds a state's layer-fetcher map for a state whose power/water/environment/
 * community layers are ALL covered by nationwide sources (HIFLD, USGS, FEMA,
 * Census, EIA, PeeringDB, US Drought Monitor) with no state-specific dataset
 * (like Oklahoma's OWRB water rights) integrated. State-specific pieces are
 * still handled per-state: a curated existing-data-centers list here, and any
 * genuinely different regulatory text/labels in src/lib/gis/stateGis.ts.
 *
 * Deliberately omits "water-diversions" and "state-highways" — no verified
 * public GIS layer for state-specific water-rights permits or road
 * classification was found for these states, so those metrics correctly
 * degrade to UNKNOWN (via stateGis.ts's nullable `roads`/placeholder
 * `waterRightsSource`) rather than guessing. See Step 17 in the integration
 * brief this follows ("missing data is okay — never fabricate").
 */
export function buildStandardStateLayerFetchers(
  stateAbbr: string,
  dataCenters: FeatureCollection<Point, DataCenterProps>
): Record<string, Fetcher> {
  async function fetchDataCenters(bbox: Bbox): Promise<FeatureCollection<Point, DataCenterProps>> {
    const features = dataCenters.features.filter((f) =>
      inBbox(f.geometry.coordinates[0]!, f.geometry.coordinates[1]!, bbox)
    );
    return { type: "FeatureCollection", features };
  }

  const rawFetchers: Record<string, Fetcher> = {
    // Kept for the analysis engine's nearest-115/230/500kV distance calcs
    // (power.ts) — the map itself now shows the two split layers below.
    "transmission-lines": fetchHifldTransmissionLines,
    "transmission-lines-high": fetchHifldTransmissionLinesHigh,
    "transmission-lines-low": fetchHifldTransmissionLinesLow,
    "utility-territories": fetchHifldUtilityTerritories,
    "electric-substations": fetchHifldSubstations,
    "hydrography-rivers": fetchNhdFlowline,
    "hydrography-waterbodies": fetchNhdWaterbody,
    "drought-areas": fetchUsDroughtMonitor,
    "usgs-gauges": (bbox) => fetchUsgsGauges(bbox, stateAbbr),
    "colocation-facilities": (bbox) => fetchColocationFacilities(bbox, stateAbbr),
    "flood-zones": fetchFemaFloodZones,
    "population-tracts": fetchPopulationTracts,
    "population-density": fetchCountyPopulationDensity,
    "data-centers": fetchDataCenters,
    "power-plants": (bbox) => fetchEiaPowerPlants(bbox, stateAbbr),
  };

  // Same fail-soft wrapping as WA_LAYER_FETCHERS/OK_LAYER_FETCHERS.
  return Object.fromEntries(
    Object.entries(rawFetchers).map(([layerId, fetcher]) => [
      layerId,
      async (bbox: Bbox): Promise<FeatureCollection> => {
        try {
          return await fetcher(bbox);
        } catch (err) {
          console.error(
            `[${stateAbbr.toLowerCase()}-layer:${layerId}] fetch failed, treating as unavailable:`,
            err instanceof Error ? err.message : err
          );
          return { type: "FeatureCollection", features: [] };
        }
      },
    ])
  );
}
