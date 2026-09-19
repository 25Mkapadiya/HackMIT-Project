import type { FeatureCollection, Point } from "geojson";
import type { DataCenterProps } from "@/states/washington/data/existingDataCenters";

/**
 * Hand-curated, illustrative list of publicly reported Maryland data center
 * campuses/projects. NOT an exhaustive or verified inventory. Coordinates are
 * approximate campus/area locations, not parcel-precise.
 */
export const MD_EXISTING_DATA_CENTERS: FeatureCollection<Point, DataCenterProps> = {
  type: "FeatureCollection",
  features: [
    {
      type: "Feature",
      geometry: { type: "Point", coordinates: [-77.485, 39.4] },
      properties: {
        name: "Quantum Frederick (Quantum Loophole)",
        operator: "Multiple, incl. Aligned Data Centers; developed by Catellus",
        city: "Adamstown, Frederick County, MD",
        approxCriticalMw: 264,
        notes: "2,100-acre master-planned hyperscale campus on the former Eastalco aluminum site, ~25 miles north of Ashburn, VA. Aligned's facility alone spans 3.3M sq ft / 264 MW. Connected to Ashburn via the QLoop fiber ring.",
      },
    },
    {
      type: "Feature",
      geometry: { type: "Point", coordinates: [-76.6413, 39.2904] },
      properties: {
        name: "Baltimore Metro Colocation",
        operator: "Multiple",
        city: "Baltimore, MD",
        approxCriticalMw: null,
        notes: "Enterprise colocation facilities reported in the Baltimore metro. City-center coordinates only — not a single campus.",
      },
    },
  ],
};
