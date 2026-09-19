import type { FeatureCollection, Point } from "geojson";
import type { DataCenterProps } from "@/states/washington/data/existingDataCenters";

/**
 * Hand-curated, illustrative list of publicly reported Kentucky data center
 * campuses/projects. NOT an exhaustive or verified inventory. Coordinates are
 * approximate campus/area locations, not parcel-precise.
 */
export const KY_EXISTING_DATA_CENTERS: FeatureCollection<Point, DataCenterProps> = {
  type: "FeatureCollection",
  features: [
    {
      type: "Feature",
      geometry: { type: "Point", coordinates: [-84.5037, 38.0406] },
      properties: {
        name: "DartPoints Lexington Data Center Campus",
        operator: "DartPoints",
        city: "Lexington, KY",
        approxCriticalMw: 20,
        notes: "343,000 sq ft campus on 29.5 acres with ~81,000 sq ft existing raised-floor space, acquired for AI/hyperscale/neocloud use; initial phase ~20-30MW with expansion potential to ~70MW. On-site substation; KU/LG&E service.",
      },
    },
    {
      type: "Feature",
      geometry: { type: "Point", coordinates: [-85.7585, 38.2527] },
      properties: {
        name: "Louisville Metro Colocation",
        operator: "Multiple",
        city: "Louisville, KY",
        approxCriticalMw: null,
        notes: "Enterprise colocation facilities reported in the Louisville metro. City-center coordinates only — not a single campus.",
      },
    },
  ],
};
