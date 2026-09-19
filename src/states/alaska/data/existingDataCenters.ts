import type { FeatureCollection, Point } from "geojson";
import type { DataCenterProps } from "@/states/washington/data/existingDataCenters";

/**
 * No facility points are shown. The Alaska research names Anchorage, Fairbanks and Juneau as markets but supplies no facility-verified coordinates or operators, so this layer is empty rather than fabricating locations.
 */
export const AK_EXISTING_DATA_CENTERS: FeatureCollection<Point, DataCenterProps> = {
  type: "FeatureCollection",
  features: [
  ],
};
