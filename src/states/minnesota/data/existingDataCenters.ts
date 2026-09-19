import type { FeatureCollection, Point } from "geojson";
import type { DataCenterProps } from "@/states/washington/data/existingDataCenters";

/**
 * Hand-curated, illustrative list of publicly reported Minnesota data
 * center/colocation markets. NOT an exhaustive or verified inventory.
 * Coordinates are approximate city/area locations, not parcel-precise.
 */
export const MN_EXISTING_DATA_CENTERS: FeatureCollection<Point, DataCenterProps> = {
  type: "FeatureCollection",
  features: [
    {
      type: "Feature",
      geometry: { type: "Point", coordinates: [-93.265, 44.9778] },
      properties: {
        name: "Twin Cities Metro Facilities",
        operator: "Multiple (e.g. Digital Realty, Flexential, Cologix)",
        city: "Minneapolis, MN",
        approxCriticalMw: null,
        notes: "Enterprise colocation facilities reported in the Minneapolis-St. Paul metro area. City-center coordinates only — not a single campus.",
      },
    },
  ],
};
