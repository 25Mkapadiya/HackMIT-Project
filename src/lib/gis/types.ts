import type { FeatureCollection, Geometry } from "geojson";

export type Bbox = [number, number, number, number];

/** A layer fetcher takes a WGS84 bbox and resolves to a GeoJSON FeatureCollection, never throwing. */
export type LayerFetcher<P = Record<string, unknown>> = (bbox: Bbox) => Promise<FeatureCollection<Geometry, P>>;
