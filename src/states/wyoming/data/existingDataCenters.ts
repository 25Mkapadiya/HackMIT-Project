import type { FeatureCollection, Point } from "geojson";
import type { DataCenterProps } from "@/states/washington/data/existingDataCenters";

/**
 * Hand-curated, illustrative marker for the Cheyenne data center market (publicly reported hyperscale and colocation presence). Area coordinates only; MW is UNKNOWN.
 * Empty layers are deliberate: no facility points are fabricated.
 */
export const WY_EXISTING_DATA_CENTERS: FeatureCollection<Point, DataCenterProps> = {
  type: "FeatureCollection",
  features: [
    {
      type: "Feature",
      geometry: { type: "Point", coordinates: [-104.8202, 41.14] },
      properties: {
        name: "Cheyenne Data Center Market",
        operator: "Multiple",
        city: "Cheyenne, WY",
        approxCriticalMw: null,
        notes: "Wyoming's most established data center market. Area coordinates only - represents multiple facilities, not one campus.",
      },
    },
  ],
};
