import type { FeatureCollection, Point } from "geojson";
import type { DataCenterProps } from "@/states/washington/data/existingDataCenters";

/**
 * Hand-curated, illustrative list of publicly reported Connecticut data
 * center/colocation clusters. NOT an exhaustive or verified inventory.
 * Coordinates are approximate city/area locations, not parcel-precise.
 */
export const CT_EXISTING_DATA_CENTERS: FeatureCollection<Point, DataCenterProps> = {
  type: "FeatureCollection",
  features: [
    {
      type: "Feature",
      geometry: { type: "Point", coordinates: [-73.5387, 41.0534] },
      properties: {
        name: "Stamford Area Colocation",
        operator: "Multiple",
        city: "Stamford, CT",
        approxCriticalMw: null,
        notes: "Enterprise colocation facilities reported near Stamford, serving New York-adjacent financial-services demand. City-center coordinates only — not a single campus.",
      },
    },
    {
      type: "Feature",
      geometry: { type: "Point", coordinates: [-73.4079, 41.1177] },
      properties: {
        name: "Norwalk Area Facilities",
        operator: "Multiple",
        city: "Norwalk, CT",
        approxCriticalMw: null,
        notes: "Enterprise/edge facilities reported near Norwalk. City-center coordinates only — not a single campus.",
      },
    },
    {
      type: "Feature",
      geometry: { type: "Point", coordinates: [-72.6851, 41.7658] },
      properties: {
        name: "Hartford Area Facilities",
        operator: "Multiple",
        city: "Hartford, CT",
        approxCriticalMw: null,
        notes: "Enterprise and insurance-sector computing facilities reported near Hartford. City-center coordinates only — not a single campus.",
      },
    },
    {
      type: "Feature",
      geometry: { type: "Point", coordinates: [-72.9279, 41.3083] },
      properties: {
        name: "New Haven Area Facilities",
        operator: "Multiple",
        city: "New Haven, CT",
        approxCriticalMw: null,
        notes: "Regional and research-computing facilities reported near New Haven. City-center coordinates only — not a single campus.",
      },
    },
  ],
};
