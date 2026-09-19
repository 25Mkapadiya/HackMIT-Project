import type { FeatureCollection, Point } from "geojson";
import type { DataCenterProps } from "@/states/washington/data/existingDataCenters";

/**
 * Hand-curated, illustrative list of publicly reported South Carolina data
 * center campuses/projects. NOT an exhaustive or verified inventory.
 * Coordinates are approximate campus/area locations, not parcel-precise.
 */
export const SC_EXISTING_DATA_CENTERS: FeatureCollection<Point, DataCenterProps> = {
  type: "FeatureCollection",
  features: [
    {
      type: "Feature",
      geometry: { type: "Point", coordinates: [-80.0289, 33.1959] },
      properties: {
        name: "Google Berkeley County Data Center",
        operator: "Google",
        city: "Moncks Corner, Berkeley County, SC",
        approxCriticalMw: null,
        notes: "Mount Holly Commerce Park — Google's first South Carolina facility, operating since 2007; a further $1.3B expansion was announced.",
      },
    },
    {
      type: "Feature",
      geometry: { type: "Point", coordinates: [-81.05, 34.98] },
      properties: {
        name: "QTS York County Campus",
        operator: "QTS Data Centers",
        city: "York County, SC",
        approxCriticalMw: null,
        notes: "$1B first South Carolina facility for QTS, near Hands Mill Highway. Area coordinates, not parcel-precise.",
      },
    },
    {
      type: "Feature",
      geometry: { type: "Point", coordinates: [-81.0348, 34.0007] },
      properties: {
        name: "Columbia Metro Colocation",
        operator: "Multiple",
        city: "Columbia, SC",
        approxCriticalMw: null,
        notes: "Enterprise colocation facilities reported in the Columbia metro. City-center coordinates only — not a single campus.",
      },
    },
  ],
};
