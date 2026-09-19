import type { FeatureCollection, Point } from "geojson";
import type { DataCenterProps } from "@/states/washington/data/existingDataCenters";

/**
 * Hand-curated, illustrative list of publicly reported North Dakota data
 * center/colocation markets. NOT an exhaustive or verified inventory.
 * Coordinates are approximate city/area locations, not parcel-precise.
 */
export const ND_EXISTING_DATA_CENTERS: FeatureCollection<Point, DataCenterProps> = {
  type: "FeatureCollection",
  features: [
    {
      type: "Feature",
      geometry: { type: "Point", coordinates: [-96.7898, 46.8772] },
      properties: {
        name: "Fargo Area Facilities",
        operator: "Multiple",
        city: "Fargo, ND",
        approxCriticalMw: null,
        notes: "Enterprise and growing technology-infrastructure facilities reported near Fargo. City-center coordinates only — not a single campus.",
      },
    },
    {
      type: "Feature",
      geometry: { type: "Point", coordinates: [-100.7837, 46.8083] },
      properties: {
        name: "Bismarck Area Facilities",
        operator: "Multiple",
        city: "Bismarck, ND",
        approxCriticalMw: null,
        notes: "State-government and enterprise facilities reported near Bismarck. City-center coordinates only — not a single campus.",
      },
    },
  ],
};
