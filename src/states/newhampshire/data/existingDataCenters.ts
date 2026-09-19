import type { FeatureCollection, Point } from "geojson";
import type { DataCenterProps } from "@/states/washington/data/existingDataCenters";

/**
 * Hand-curated, illustrative list of publicly reported New Hampshire data
 * center/colocation clusters. NOT an exhaustive or verified inventory.
 * Coordinates are approximate city/area locations, not parcel-precise.
 */
export const NH_EXISTING_DATA_CENTERS: FeatureCollection<Point, DataCenterProps> = {
  type: "FeatureCollection",
  features: [
    {
      type: "Feature",
      geometry: { type: "Point", coordinates: [-71.4548, 42.9956] },
      properties: {
        name: "Manchester Area Colocation",
        operator: "Multiple",
        city: "Manchester, NH",
        approxCriticalMw: null,
        notes: "Enterprise colocation and regional cloud infrastructure reported near Manchester. City-center coordinates only — not a single campus.",
      },
    },
    {
      type: "Feature",
      geometry: { type: "Point", coordinates: [-71.4676, 42.7654] },
      properties: {
        name: "Nashua Area Facilities",
        operator: "Multiple",
        city: "Nashua, NH",
        approxCriticalMw: null,
        notes: "Enterprise/edge facilities reported near Nashua, serving Boston-adjacent demand. City-center coordinates only — not a single campus.",
      },
    },
    {
      type: "Feature",
      geometry: { type: "Point", coordinates: [-70.7626, 43.0718] },
      properties: {
        name: "Portsmouth Region Facilities",
        operator: "Multiple",
        city: "Portsmouth, NH",
        approxCriticalMw: null,
        notes: "Regional facilities reported near Portsmouth. City-center coordinates only — not a single campus.",
      },
    },
  ],
};
