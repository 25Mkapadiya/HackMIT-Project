import type { FeatureCollection, Point } from "geojson";
import type { DataCenterProps } from "@/states/washington/data/existingDataCenters";

/**
 * Hand-curated, illustrative list of publicly reported Rhode Island data
 * center/colocation activity. NOT an exhaustive or verified inventory.
 * Coordinates are approximate city/area locations, not parcel-precise.
 */
export const RI_EXISTING_DATA_CENTERS: FeatureCollection<Point, DataCenterProps> = {
  type: "FeatureCollection",
  features: [
    {
      type: "Feature",
      geometry: { type: "Point", coordinates: [-71.4128, 41.824] },
      properties: {
        name: "Providence Metro Facilities",
        operator: "Multiple",
        city: "Providence, RI",
        approxCriticalMw: null,
        notes: "Enterprise colocation, healthcare, and education/research computing facilities reported in the Providence metro area. City-center coordinates only — not a single campus.",
      },
    },
    {
      type: "Feature",
      geometry: { type: "Point", coordinates: [-71.4162, 41.7001] },
      properties: {
        name: "Warwick Area Facilities",
        operator: "Multiple",
        city: "Warwick, RI",
        approxCriticalMw: null,
        notes: "Regional enterprise facilities reported near Warwick. City-center coordinates only — not a single campus.",
      },
    },
  ],
};
