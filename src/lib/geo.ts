import distance from "@turf/distance";
import booleanPointInPolygon from "@turf/boolean-point-in-polygon";
import { point } from "@turf/helpers";
import type { CountyFeature } from "./types";

export function milesBetween(lat1: number, lng1: number, lat2: number, lng2: number): number {
  return distance(point([lng1, lat1]), point([lng2, lat2]), { units: "miles" });
}

/** Real point-in-polygon county lookup (turf), not a centroid nearest-match. */
export function findCounty(
  lat: number,
  lng: number,
  counties: CountyFeature[]
): CountyFeature | null {
  const pt = point([lng, lat]);
  for (const f of counties) {
    if (!f.geometry) continue;
    try {
      if (booleanPointInPolygon(pt, f.geometry as any)) return f;
    } catch {
      // malformed ring — skip rather than crash the click handler
    }
  }
  return null;
}
