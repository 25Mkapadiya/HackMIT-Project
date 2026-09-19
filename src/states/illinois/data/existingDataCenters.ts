import type { FeatureCollection, Point } from "geojson";
import type { DataCenterProps } from "@/states/washington/data/existingDataCenters";

/**
 * The Illinois research template names major clusters/operators but does not
 * provide verified facility coordinates. Keep this empty instead of
 * fabricating map points. PeeringDB still provides live interconnection/
 * colocation facilities through the separate connectivity layer.
 */
export const IL_EXISTING_DATA_CENTERS: FeatureCollection<Point, DataCenterProps> = {
  type: "FeatureCollection",
  features: [],
};
