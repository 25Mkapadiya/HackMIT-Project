import type { FeatureCollection } from "geojson";
import { queryArcGisGeoJSON, type Bbox } from "@/lib/gis/arcgis";
import { buildStandardStateLayerFetchers } from "@/lib/gis/standardStateLayerFetchers";
import { TX_SOURCES } from "./sources";
import { TX_EXISTING_DATA_CENTERS } from "./data/existingDataCenters";

async function fetchTceqWaterRights(bbox: Bbox): Promise<FeatureCollection> {
  return queryArcGisGeoJSON(TX_SOURCES.tceqWaterRights.url, {
    bbox,
    outFields: "WR_ID,TYPE,VERIFIED",
  });
}

/**
 * Texas gets the same nationwide layers as every other state in this
 * integration (see standardStateLayerFetchers.ts), plus a real, live
 * "water-diversions" layer from TCEQ's statewide Water Rights Viewer —
 * unlike most other states here, Texas actually publishes this as a
 * queryable point layer.
 */
export const TX_LAYER_FETCHERS: Record<string, (bbox: Bbox) => Promise<FeatureCollection>> = {
  ...buildStandardStateLayerFetchers("TX", TX_EXISTING_DATA_CENTERS),
  "water-diversions": async (bbox: Bbox): Promise<FeatureCollection> => {
    try {
      return await fetchTceqWaterRights(bbox);
    } catch (err) {
      console.error("[tx-layer:water-diversions] fetch failed, treating as unavailable:", err instanceof Error ? err.message : err);
      return { type: "FeatureCollection", features: [] };
    }
  },
};
