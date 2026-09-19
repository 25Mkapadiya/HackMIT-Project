import type { FeatureCollection, Point } from "geojson";
import type { DataCenterProps } from "@/states/washington/data/existingDataCenters";

/**
 * Hand-curated, illustrative list of publicly reported Ohio data center
 * campuses, concentrated around the Central Ohio hyperscale cluster. NOT an
 * exhaustive or verified inventory. Coordinates are approximate city/area
 * locations, not parcel-precise.
 */
export const OH_EXISTING_DATA_CENTERS: FeatureCollection<Point, DataCenterProps> = {
  type: "FeatureCollection",
  features: [
    {
      type: "Feature",
      geometry: { type: "Point", coordinates: [-83.0007, 40.0992] },
      properties: {
        name: "Columbus Metro Hyperscale Cluster",
        operator: "Multiple (e.g. AWS, Google, Meta, Microsoft)",
        city: "Columbus, OH",
        approxCriticalMw: null,
        notes: "One of the largest hyperscale development clusters in the U.S., reported across Columbus and surrounding suburbs. City-center coordinates only — not a single campus.",
      },
    },
    {
      type: "Feature",
      geometry: { type: "Point", coordinates: [-82.8079, 40.0817] },
      properties: {
        name: "New Albany Area Facilities",
        operator: "Multiple",
        city: "New Albany, OH",
        approxCriticalMw: null,
        notes: "Major hyperscale campuses reported near New Albany. City-center coordinates only — not a single campus.",
      },
    },
    {
      type: "Feature",
      geometry: { type: "Point", coordinates: [-83.1582, 40.0334] },
      properties: {
        name: "Hilliard Area Facilities",
        operator: "Multiple",
        city: "Hilliard, OH",
        approxCriticalMw: null,
        notes: "Enterprise and hyperscale-adjacent facilities reported near Hilliard. City-center coordinates only — not a single campus.",
      },
    },
    {
      type: "Feature",
      geometry: { type: "Point", coordinates: [-83.1141, 40.0992] },
      properties: {
        name: "Dublin Area Facilities",
        operator: "Multiple",
        city: "Dublin, OH",
        approxCriticalMw: null,
        notes: "Enterprise facilities reported near Dublin, part of the broader Central Ohio cluster. City-center coordinates only — not a single campus.",
      },
    },
  ],
};
