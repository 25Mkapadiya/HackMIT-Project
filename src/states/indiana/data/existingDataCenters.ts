import type { FeatureCollection, Point } from "geojson";
import type { DataCenterProps } from "@/states/washington/data/existingDataCenters";

/**
 * Hand-curated, illustrative list of publicly reported Indiana data
 * center/colocation markets. NOT an exhaustive or verified inventory.
 * Coordinates are approximate city/area locations, not parcel-precise.
 */
export const IN_EXISTING_DATA_CENTERS: FeatureCollection<Point, DataCenterProps> = {
  type: "FeatureCollection",
  features: [
    {
      type: "Feature",
      geometry: { type: "Point", coordinates: [-86.1581, 39.7684] },
      properties: {
        name: "Indianapolis Metro Facilities",
        operator: "Multiple (e.g. Google, Meta, Microsoft, Amazon)",
        city: "Indianapolis, IN",
        approxCriticalMw: null,
        notes: "Hyperscale and enterprise colocation facilities reported in the Indianapolis metro area. City-center coordinates only — not a single campus.",
      },
    },
    {
      type: "Feature",
      geometry: { type: "Point", coordinates: [-85.1394, 41.0793] },
      properties: {
        name: "Fort Wayne Area Facilities",
        operator: "Multiple",
        city: "Fort Wayne, IN",
        approxCriticalMw: null,
        notes: "Regional enterprise facilities reported near Fort Wayne. City-center coordinates only — not a single campus.",
      },
    },
    {
      type: "Feature",
      geometry: { type: "Point", coordinates: [-86.2520, 41.6764] },
      properties: {
        name: "South Bend Area Facilities",
        operator: "Multiple",
        city: "South Bend, IN",
        approxCriticalMw: null,
        notes: "Regional facilities reported near South Bend. City-center coordinates only — not a single campus.",
      },
    },
  ],
};
