import type { FeatureCollection, Point } from "geojson";
import type { DataCenterProps } from "@/states/washington/data/existingDataCenters";

/**
 * No facility points are shown: the research names the Salt Lake Valley, West Jordan, Eagle Mountain, Saratoga Springs, Lehi and the Provo corridor as markets but provides no verified facility coordinates.
 * Empty layers are deliberate: no facility points are fabricated.
 */
export const UT_EXISTING_DATA_CENTERS: FeatureCollection<Point, DataCenterProps> = {
  type: "FeatureCollection",
  features: [
  ],
};
