import * as turf from "@turf/turf";
import type { Feature, FeatureCollection, Geometry, Point as GeoPoint } from "geojson";

export interface NearestFeatureResult<P = Record<string, unknown>> {
  feature: Feature<Geometry, P> | null;
  distanceMiles: number | null;
}

/**
 * Finds the nearest feature (of any geometry type) in a FeatureCollection to a point,
 * using the correct turf distance primitive per geometry type.
 */
export function nearestFeature<P = Record<string, unknown>>(
  originLng: number,
  originLat: number,
  fc: FeatureCollection<Geometry, P> | null | undefined
): NearestFeatureResult<P> {
  if (!fc || !fc.features || fc.features.length === 0) {
    return { feature: null, distanceMiles: null };
  }
  const origin = turf.point([originLng, originLat]);

  let best: Feature<Geometry, P> | null = null;
  let bestDist = Infinity;

  for (const feature of fc.features) {
    if (!feature.geometry) continue;
    let dist: number;
    try {
      switch (feature.geometry.type) {
        case "Point":
          dist = turf.distance(origin, feature as Feature<GeoPoint>, { units: "miles" });
          break;
        case "MultiPoint": {
          dist = Math.min(
            ...(feature.geometry.coordinates as [number, number][]).map((c) =>
              turf.distance(origin, turf.point(c), { units: "miles" })
            )
          );
          break;
        }
        case "LineString":
        case "MultiLineString": {
          const p = turf.nearestPointOnLine(feature as any, origin, { units: "miles" });
          dist = p.properties.dist ?? Infinity;
          break;
        }
        case "Polygon":
        case "MultiPolygon": {
          if (turf.booleanPointInPolygon(origin, feature as any)) {
            dist = 0;
          } else {
            const boundary = turf.polygonToLine(feature as any);
            const p = turf.nearestPointOnLine(boundary as any, origin, { units: "miles" });
            dist = p.properties.dist ?? Infinity;
          }
          break;
        }
        default:
          continue;
      }
    } catch {
      continue;
    }
    if (dist < bestDist) {
      bestDist = dist;
      best = feature;
    }
  }

  if (!best) return { feature: null, distanceMiles: null };
  return { feature: best, distanceMiles: Math.round(bestDist * 100) / 100 };
}

/** Filters a FeatureCollection to features matching a predicate before finding nearest. */
export function nearestFeatureWhere<P = Record<string, unknown>>(
  originLng: number,
  originLat: number,
  fc: FeatureCollection<Geometry, P> | null | undefined,
  predicate: (props: P) => boolean
): NearestFeatureResult<P> {
  if (!fc) return { feature: null, distanceMiles: null };
  const filtered: FeatureCollection<Geometry, P> = {
    type: "FeatureCollection",
    features: fc.features.filter((f) => predicate(f.properties as P)),
  };
  return nearestFeature(originLng, originLat, filtered);
}

/** Finds all point features within a radius (miles) of an origin. */
export function featuresWithinRadius<P = Record<string, unknown>>(
  originLng: number,
  originLat: number,
  fc: FeatureCollection<Geometry, P> | null | undefined,
  radiusMiles: number
): Feature<Geometry, P>[] {
  if (!fc) return [];
  const origin = turf.point([originLng, originLat]);
  const buffer = turf.buffer(origin, radiusMiles, { units: "miles" });
  if (!buffer) return [];
  return fc.features.filter((f) => {
    if (!f.geometry) return false;
    try {
      if (f.geometry.type === "Point") {
        return turf.booleanPointInPolygon(f as Feature<GeoPoint>, buffer);
      }
      return turf.booleanIntersects(f as any, buffer as any);
    } catch {
      return false;
    }
  });
}

/** Finds the polygon feature (if any) containing the point. */
export function polygonContaining<P = Record<string, unknown>>(
  originLng: number,
  originLat: number,
  fc: FeatureCollection<Geometry, P> | null | undefined
): Feature<Geometry, P> | null {
  if (!fc) return null;
  const origin = turf.point([originLng, originLat]);
  for (const feature of fc.features) {
    if (!feature.geometry) continue;
    if (feature.geometry.type !== "Polygon" && feature.geometry.type !== "MultiPolygon") continue;
    try {
      if (turf.booleanPointInPolygon(origin, feature as any)) return feature;
    } catch {
      continue;
    }
  }
  return null;
}

/** Returns an ArcGIS-REST-friendly bbox string in WGS84 [xmin,ymin,xmax,ymax] around a center point. */
export function bboxAroundMiles(lng: number, lat: number, radiusMiles: number): [number, number, number, number] {
  const circle = turf.circle([lng, lat], radiusMiles, { units: "miles" });
  const bbox = turf.bbox(circle);
  return [bbox[0], bbox[1], bbox[2], bbox[3]];
}

export function milesBetween(aLng: number, aLat: number, bLng: number, bLat: number): number {
  return turf.distance(turf.point([aLng, aLat]), turf.point([bLng, bLat]), { units: "miles" });
}
