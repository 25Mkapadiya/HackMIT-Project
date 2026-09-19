import type { FeatureCollection, Point } from "geojson";
import type { DataCenterProps } from "@/states/washington/data/existingDataCenters";

/**
 * Hand-curated, illustrative list of publicly reported Mississippi data center
 * campuses/projects. NOT an exhaustive or verified inventory. Coordinates are
 * approximate campus/area locations, not parcel-precise.
 */
export const MS_EXISTING_DATA_CENTERS: FeatureCollection<Point, DataCenterProps> = {
  type: "FeatureCollection",
  features: [
    {
      type: "Feature",
      geometry: { type: "Point", coordinates: [-90.0554, 32.6126] },
      properties: {
        name: "AWS Madison County Mega Site",
        operator: "Amazon Web Services",
        city: "Canton, Madison County, MS",
        approxCriticalMw: null,
        notes: "Part of AWS's $10B, two-campus Mississippi investment announced January 2024 — the largest capital investment in state history. Area coordinates for the Madison County Mega Site, not parcel-precise.",
      },
    },
    {
      type: "Feature",
      geometry: { type: "Point", coordinates: [-90.1301, 32.4285] },
      properties: {
        name: "AWS Ridgeland / Tougaloo Campus",
        operator: "Amazon Web Services",
        city: "Ridgeland, Madison County, MS",
        approxCriticalMw: null,
        notes: "Second AWS Mississippi campus site, near County Line Road west of Tougaloo College. Area coordinates, not parcel-precise.",
      },
    },
    {
      type: "Feature",
      geometry: { type: "Point", coordinates: [-88.7037, 32.3643] },
      properties: {
        name: "Compass Datacenters Meridian Campus",
        operator: "Compass Datacenters",
        city: "Meridian, Lauderdale County, MS",
        approxCriticalMw: null,
        notes: "$10B commitment announced January 2025; 303-acre site in the I-20 Industrial Development Park, planned for eight data centers over ~8 years.",
      },
    },
  ],
};
