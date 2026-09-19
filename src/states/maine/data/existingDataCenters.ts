import type { FeatureCollection, Point } from "geojson";
import type { DataCenterProps } from "@/states/washington/data/existingDataCenters";

/**
 * Hand-curated, illustrative list of publicly reported Maine data
 * center/colocation clusters. NOT an exhaustive or verified inventory.
 * Coordinates are approximate city/area locations, not parcel-precise.
 */
export const ME_EXISTING_DATA_CENTERS: FeatureCollection<Point, DataCenterProps> = {
  type: "FeatureCollection",
  features: [
    {
      type: "Feature",
      geometry: { type: "Point", coordinates: [-70.2553, 43.6591] },
      properties: {
        name: "Portland Area Colocation",
        operator: "Multiple",
        city: "Portland, ME",
        approxCriticalMw: null,
        notes: "Enterprise and edge colocation facilities reported in the Greater Portland/Southern Maine market. City-center coordinates only — not a single campus.",
      },
    },
    {
      type: "Feature",
      geometry: { type: "Point", coordinates: [-68.7712, 44.8016] },
      properties: {
        name: "Bangor Area Facilities",
        operator: "Multiple",
        city: "Bangor, ME",
        approxCriticalMw: null,
        notes: "Regional enterprise and institutional computing facilities reported near Bangor. City-center coordinates only — not a single campus.",
      },
    },
    {
      type: "Feature",
      geometry: { type: "Point", coordinates: [-70.2148, 44.1004] },
      properties: {
        name: "Lewiston-Auburn Area Facilities",
        operator: "Multiple",
        city: "Lewiston, ME",
        approxCriticalMw: null,
        notes: "Regional facilities reported in the Lewiston-Auburn market. City-center coordinates only — not a single campus.",
      },
    },
  ],
};
