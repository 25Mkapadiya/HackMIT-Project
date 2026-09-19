import type { FeatureCollection, Point } from "geojson";
import type { DataCenterProps } from "@/states/washington/data/existingDataCenters";

/**
 * Hand-curated, illustrative list of publicly reported Georgia data center
 * campuses/projects. NOT an exhaustive or verified inventory. Coordinates are
 * approximate campus/area locations, not parcel-precise.
 */
export const GA_EXISTING_DATA_CENTERS: FeatureCollection<Point, DataCenterProps> = {
  type: "FeatureCollection",
  features: [
    {
      type: "Feature",
      geometry: { type: "Point", coordinates: [-84.7488, 33.68] },
      properties: {
        name: "Google Douglas County Data Center",
        operator: "Google",
        city: "Douglasville, Douglas County, GA",
        approxCriticalMw: null,
        notes: "Operating since 2007 — one of Google's earliest large-scale data center campuses.",
      },
    },
    {
      type: "Feature",
      geometry: { type: "Point", coordinates: [-84.554, 33.457] },
      properties: {
        name: "South Metro Atlanta Hyperscale Corridor",
        operator: "Multiple",
        city: "Fayette / Coweta County, GA",
        approxCriticalMw: null,
        notes: "One of the densest hyperscale/colocation development corridors in the Southeast, spanning Fayette, Coweta, and the Lithia Springs area. Area coordinates only — not a single campus.",
      },
    },
    {
      type: "Feature",
      geometry: { type: "Point", coordinates: [-84.39, 33.749] },
      properties: {
        name: "Atlanta Metro Colocation (incl. 56 Marietta / carrier hotels)",
        operator: "Multiple",
        city: "Atlanta, GA",
        approxCriticalMw: null,
        notes: "Downtown Atlanta carrier-hotel and colocation cluster. City-center coordinates only — not a single campus.",
      },
    },
  ],
};
