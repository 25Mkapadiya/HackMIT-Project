import type { FeatureCollection, Geometry } from "geojson";
import { cached, TTL } from "@/lib/cache/memoryCache";

/**
 * Server-only helper for querying ArcGIS REST FeatureServer/MapServer layers and
 * normalizing the response to GeoJSON. Several state GIS servers (e.g. WA Ecology)
 * reject requests without a browser-like User-Agent, so we always send one.
 */

export type Bbox = [number, number, number, number];

export interface ArcGisQueryOptions {
  where?: string;
  outFields?: string;
  /** [xmin, ymin, xmax, ymax] in WGS84 */
  bbox?: [number, number, number, number];
  geometryPrecision?: number;
  resultRecordCount?: number;
  orderByFields?: string;
  /** Degrees of generalization tolerance — drastically shrinks payload for wide-area polygon/line queries. */
  maxAllowableOffset?: number;
}

const DEFAULT_HEADERS = {
  "User-Agent": "Mozilla/5.0 (compatible; DataCenterSitingPlatform/1.0; +https://vercel.com)",
  Accept: "application/json",
};

export async function queryArcGisGeoJSON<P = Record<string, unknown>>(
  layerUrl: string,
  options: ArcGisQueryOptions = {},
  cacheTtlMs: number = TTL.FIFTEEN_MINUTES
): Promise<FeatureCollection<Geometry, P>> {
  const params = new URLSearchParams();
  params.set("where", options.where ?? "1=1");
  params.set("outFields", options.outFields ?? "*");
  params.set("outSR", "4326");
  params.set("f", "geojson");
  params.set("geometryPrecision", String(options.geometryPrecision ?? 5));
  if (options.maxAllowableOffset) params.set("maxAllowableOffset", String(options.maxAllowableOffset));
  if (options.resultRecordCount) params.set("resultRecordCount", String(options.resultRecordCount));
  if (options.orderByFields) params.set("orderByFields", options.orderByFields);
  if (options.bbox) {
    const [xmin, ymin, xmax, ymax] = options.bbox;
    params.set("geometry", `${xmin},${ymin},${xmax},${ymax}`);
    params.set("geometryType", "esriGeometryEnvelope");
    params.set("inSR", "4326");
    params.set("spatialRel", "esriSpatialRelIntersects");
  }

  const url = `${layerUrl}/query?${params.toString()}`;
  const cacheKey = `arcgis:${url}`;

  return cached(cacheKey, cacheTtlMs, async () => {
    const res = await fetch(url, { headers: DEFAULT_HEADERS, cache: "no-store" });
    if (!res.ok) {
      throw new Error(`ArcGIS query failed (${res.status}) for ${layerUrl}`);
    }
    const body = (await res.json()) as FeatureCollection<Geometry, P> | { error: unknown };
    if ("error" in body) {
      throw new Error(`ArcGIS service error: ${JSON.stringify((body as { error: unknown }).error)}`);
    }
    return body as FeatureCollection<Geometry, P>;
  });
}

/** Fetches layer metadata (fields, geometry type) — used sparingly, mostly for debugging/dev. */
export async function fetchArcGisLayerInfo(layerUrl: string): Promise<unknown> {
  return cached(`arcgis:meta:${layerUrl}`, TTL.ONE_DAY, async () => {
    const res = await fetch(`${layerUrl}?f=json`, { headers: DEFAULT_HEADERS, cache: "no-store" });
    if (!res.ok) throw new Error(`ArcGIS layer info failed (${res.status})`);
    return res.json();
  });
}
