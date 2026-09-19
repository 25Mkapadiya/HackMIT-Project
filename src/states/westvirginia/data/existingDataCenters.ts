import type { FeatureCollection, Point } from "geojson";
import type { DataCenterProps } from "@/states/washington/data/existingDataCenters";

/**
 * Hand-curated, illustrative list of publicly reported West Virginia data
 * center campuses/projects. NOT an exhaustive or verified inventory.
 * Coordinates are approximate campus/area locations, not parcel-precise.
 */
export const WV_EXISTING_DATA_CENTERS: FeatureCollection<Point, DataCenterProps> = {
  type: "FeatureCollection",
  features: [
    {
      type: "Feature",
      geometry: { type: "Point", coordinates: [-77.97, 39.4] },
      properties: {
        name: "Penzance Bedington Campus",
        operator: "Penzance Management",
        city: "Falling Waters District, Berkeley County, WV",
        approxCriticalMw: 600,
        notes: "Announced $4B, 548-acre, ~1.9M sq ft campus targeting up to 600 MW of critical IT capacity. Tenant announcement expected later in 2026; no confirmed groundbreaking date. Area coordinates, not parcel-precise.",
      },
    },
    {
      type: "Feature",
      geometry: { type: "Point", coordinates: [-77.8891, 39.3765] },
      properties: {
        name: "QTS Berkeley/Jefferson County Campus",
        operator: "QTS Data Centers",
        city: "Berkeley / Jefferson County line, WV",
        approxCriticalMw: null,
        notes: "300-acre site split between Berkeley County (data center buildings) and Jefferson County (industrial-zoned parcel) near Kearneysville. Area coordinates, not parcel-precise.",
      },
    },
  ],
};
