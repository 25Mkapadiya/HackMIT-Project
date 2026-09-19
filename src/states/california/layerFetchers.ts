import type { FeatureCollection, Geometry } from "geojson";
import { queryArcGisGeoJSON, type Bbox } from "@/lib/gis/arcgis";
import { sortSmallestAreaFirst } from "@/lib/gis/nationalFetchers";
import { TTL } from "@/lib/cache/memoryCache";
import { buildStandardStateLayerFetchers, type Fetcher } from "@/lib/gis/standardStateLayerFetchers";
import { CA_SOURCES } from "./sources";
import { CA_EXISTING_DATA_CENTERS } from "./data/existingDataCenters";

/** Same generalization heuristic as the shared fetchers - statewide polygon queries get simplified hard. */
function generalizationFor(bbox: Bbox): number {
  return Math.max(0.00005, (bbox[2] - bbox[0]) / 600);
}

/** Same fail-soft behavior as the shared fetchers: an upstream failure degrades to "no features" (UNKNOWN). */
function failSoft(layerId: string, fetcher: Fetcher): Fetcher {
  return async (bbox) => {
    try {
      return await fetcher(bbox);
    } catch (err) {
      console.error(`[ca-layer:${layerId}] fetch failed, treating as unavailable:`, err instanceof Error ? err.message : err);
      return { type: "FeatureCollection", features: [] };
    }
  };
}

async function fetchCecUtilityAreas(bbox: Bbox): Promise<FeatureCollection<Geometry, Record<string, unknown>>> {
  const fc = await queryArcGisGeoJSON<{ Utility?: string; Acronym?: string; Type?: string; URL?: string }>(
    CA_SOURCES.cecUtilityAreas.url,
    { bbox, outFields: "Utility,Acronym,Type,URL", maxAllowableOffset: generalizationFor(bbox) },
    TTL.ONE_DAY
  );
  // Normalized onto the shared `Name` property used by the analysis engine.
  return {
    type: "FeatureCollection",
    features: sortSmallestAreaFirst(fc.features.map((f) => ({
      ...f,
      properties: {
        Name: f.properties?.Utility?.trim() || null,
        Acronym: f.properties?.Acronym ?? null,
        UtilityType: f.properties?.Type ?? null,
        Website: f.properties?.URL ?? null,
      },
    }))),
  };
}

/**
 * California: nationwide sources for everything except utility territories, which use
 * the state-maintained layer (see sources.ts) instead of the static HIFLD snapshot.
 */
export const CA_LAYER_FETCHERS: Record<string, Fetcher> = {
  ...buildStandardStateLayerFetchers("CA", CA_EXISTING_DATA_CENTERS),
  "utility-territories": failSoft("utility-territories", fetchCecUtilityAreas),
};
