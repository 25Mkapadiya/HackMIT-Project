import type { FeatureCollection, Point } from "geojson";
import type { DataCenterProps } from "@/states/washington/data/existingDataCenters";

/**
 * Missouri research identifies Kansas City, St. Louis, and Springfield as data-center
 * markets, but the supplied research snapshot does not provide parcel- or facility-
 * verified coordinates. Keep this layer empty rather than fabricating point locations.
 */
export const MO_EXISTING_DATA_CENTERS: FeatureCollection<Point, DataCenterProps> = {
  type: "FeatureCollection",
  features: [],
};
