import type { FeatureCollection, Point } from "geojson";
import type { DataCenterProps } from "@/states/washington/data/existingDataCenters";

/**
 * Hand-curated, illustrative list of publicly reported Vermont data center
 * activity. NOT an exhaustive or verified inventory. Coordinates are
 * approximate city/area locations, not parcel-precise.
 */
export const VT_EXISTING_DATA_CENTERS: FeatureCollection<Point, DataCenterProps> = {
  type: "FeatureCollection",
  features: [
    {
      type: "Feature",
      geometry: { type: "Point", coordinates: [-73.2121, 44.4759] },
      properties: {
        name: "Burlington / Chittenden County Facilities",
        operator: "Multiple",
        city: "Burlington, VT",
        approxCriticalMw: null,
        notes: "Smaller enterprise, education, and government computing facilities reported in the Burlington/Chittenden County market. City-center coordinates only — not a single campus.",
      },
    },
  ],
};
