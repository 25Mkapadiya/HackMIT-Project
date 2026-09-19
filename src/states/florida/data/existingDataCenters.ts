import type { FeatureCollection, Point } from "geojson";
import type { DataCenterProps } from "@/states/washington/data/existingDataCenters";

/**
 * Hand-curated, illustrative list of publicly reported Florida data center
 * campuses/projects. NOT an exhaustive or verified inventory. Coordinates are
 * approximate campus/area locations, not parcel-precise.
 */
export const FL_EXISTING_DATA_CENTERS: FeatureCollection<Point, DataCenterProps> = {
  type: "FeatureCollection",
  features: [
    {
      type: "Feature",
      geometry: { type: "Point", coordinates: [-80.1937, 25.7743] },
      properties: {
        name: "NAP of the Americas / Equinix MI1",
        operator: "Equinix (and others)",
        city: "Miami, FL",
        approxCriticalMw: null,
        notes: "36 NE 2nd St — one of the most important international internet exchange points in the Western Hemisphere, a key hub for Latin American connectivity.",
      },
    },
    {
      type: "Feature",
      geometry: { type: "Point", coordinates: [-80.1300, 25.7900] },
      properties: {
        name: "Miami / South Florida Colocation Corridor",
        operator: "Multiple (Digital Realty, and others)",
        city: "Miami, FL",
        approxCriticalMw: null,
        notes: "Enterprise colocation and carrier-hotel facilities reported in the Miami metro, a major subsea-cable landing hub. City-area coordinates only — not a single campus.",
      },
    },
    {
      type: "Feature",
      geometry: { type: "Point", coordinates: [-81.3792, 28.5383] },
      properties: {
        name: "Orlando Metro Colocation",
        operator: "Multiple",
        city: "Orlando, FL",
        approxCriticalMw: null,
        notes: "Enterprise colocation facilities reported in the Orlando metro. City-center coordinates only — not a single campus.",
      },
    },
  ],
};
