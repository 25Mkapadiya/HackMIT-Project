import type { FeatureCollection, Point } from "geojson";
import type { DataCenterProps } from "@/states/washington/data/existingDataCenters";

/**
 * Hand-curated, illustrative list of publicly reported Virginia data center
 * campuses/projects. NOT an exhaustive or verified inventory — Northern
 * Virginia alone hosts the largest concentration of data center facilities
 * in the world, so this list is a small, illustrative sample, not a survey.
 * Coordinates are approximate campus/area locations, not parcel-precise.
 */
export const VA_EXISTING_DATA_CENTERS: FeatureCollection<Point, DataCenterProps> = {
  type: "FeatureCollection",
  features: [
    {
      type: "Feature",
      geometry: { type: "Point", coordinates: [-77.4874, 39.0437] },
      properties: {
        name: "Ashburn / Loudoun County \"Data Center Alley\"",
        operator: "Multiple (Equinix, Digital Realty, Amazon Web Services, and dozens more)",
        city: "Ashburn, Loudoun County, VA",
        approxCriticalMw: null,
        notes: "The single densest concentration of data center infrastructure in the world — reportedly carrying a large share of global internet traffic. Area coordinates only; represents dozens of individual campuses, not one facility.",
      },
    },
    {
      type: "Feature",
      geometry: { type: "Point", coordinates: [-77.3411, 38.7509] },
      properties: {
        name: "Prince William County Data Center Corridor",
        operator: "Multiple",
        city: "Prince William County, VA",
        approxCriticalMw: null,
        notes: "Rapidly growing hyperscale/colocation corridor adjacent to Loudoun County. Area coordinates only — not a single campus.",
      },
    },
    {
      type: "Feature",
      geometry: { type: "Point", coordinates: [-77.4291, 37.5883] },
      properties: {
        name: "Richmond / Henrico County Data Center Corridor",
        operator: "Multiple (including QTS)",
        city: "Henrico County, VA",
        approxCriticalMw: null,
        notes: "Secondary Virginia data center market growing alongside Northern Virginia's core cluster. Area coordinates only — not a single campus.",
      },
    },
  ],
};
