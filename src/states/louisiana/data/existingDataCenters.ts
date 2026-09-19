import type { FeatureCollection, Point } from "geojson";
import type { DataCenterProps } from "@/states/washington/data/existingDataCenters";

/**
 * Hand-curated, illustrative list of publicly reported Louisiana data center
 * campuses/projects. NOT an exhaustive or verified inventory. Coordinates are
 * approximate campus/area locations, not parcel-precise.
 */
export const LA_EXISTING_DATA_CENTERS: FeatureCollection<Point, DataCenterProps> = {
  type: "FeatureCollection",
  features: [
    {
      type: "Feature",
      geometry: { type: "Point", coordinates: [-91.7876, 32.304] },
      properties: {
        name: "Meta Hyperion AI Data Center Campus",
        operator: "Meta",
        city: "Holly Ridge, Richland Parish, LA",
        approxCriticalMw: null,
        notes: "Meta's largest data center to date — a ~$10B+ (reported up to $50B total investment), 4M sq ft, 2,250+ acre AI-optimized campus at the former Franklin Farm megasite between Rayville and Delhi. Construction began December 2024.",
      },
    },
    {
      type: "Feature",
      geometry: { type: "Point", coordinates: [-90.0715, 29.9511] },
      properties: {
        name: "New Orleans Metro Colocation",
        operator: "Multiple",
        city: "New Orleans, LA",
        approxCriticalMw: null,
        notes: "Enterprise colocation and carrier-hotel facilities reported in the New Orleans metro. City-center coordinates only — not a single campus.",
      },
    },
    {
      type: "Feature",
      geometry: { type: "Point", coordinates: [-91.1871, 30.4515] },
      properties: {
        name: "Baton Rouge Metro Colocation",
        operator: "Multiple",
        city: "Baton Rouge, LA",
        approxCriticalMw: null,
        notes: "Enterprise colocation facilities reported in the Baton Rouge metro, supporting the state capital and nearby petrochemical corridor. City-center coordinates only.",
      },
    },
  ],
};
