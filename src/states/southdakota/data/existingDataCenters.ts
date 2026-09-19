import type { FeatureCollection, Point } from "geojson";
import type { DataCenterProps } from "@/states/washington/data/existingDataCenters";

/**
 * Hand-curated, illustrative list of publicly reported South Dakota data
 * center/colocation markets. NOT an exhaustive or verified inventory.
 * Coordinates are approximate city/area locations, not parcel-precise.
 */
export const SD_EXISTING_DATA_CENTERS: FeatureCollection<Point, DataCenterProps> = {
  type: "FeatureCollection",
  features: [
    {
      type: "Feature",
      geometry: { type: "Point", coordinates: [-96.7311, 43.5446] },
      properties: {
        name: "Sioux Falls Metro Facilities",
        operator: "Multiple",
        city: "Sioux Falls, SD",
        approxCriticalMw: null,
        notes: "Enterprise colocation and financial-services infrastructure facilities reported in the Sioux Falls metro area, the state's primary digital-infrastructure hub. City-center coordinates only — not a single campus.",
      },
    },
    {
      type: "Feature",
      geometry: { type: "Point", coordinates: [-103.2310, 44.0805] },
      properties: {
        name: "Rapid City Area Facilities",
        operator: "Multiple",
        city: "Rapid City, SD",
        approxCriticalMw: null,
        notes: "Regional facilities reported near Rapid City. City-center coordinates only — not a single campus.",
      },
    },
  ],
};
