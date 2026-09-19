import type { FeatureCollection, Point } from "geojson";
import type { DataCenterProps } from "@/states/washington/data/existingDataCenters";

/**
 * Hand-curated, illustrative list of publicly reported North Carolina data
 * center campuses/projects. NOT an exhaustive or verified inventory.
 * Coordinates are approximate campus/area locations, not parcel-precise.
 */
export const NC_EXISTING_DATA_CENTERS: FeatureCollection<Point, DataCenterProps> = {
  type: "FeatureCollection",
  features: [
    {
      type: "Feature",
      geometry: { type: "Point", coordinates: [-81.1873, 35.6015] },
      properties: {
        name: "Apple Maiden Data Center Campus",
        operator: "Apple",
        city: "Maiden, Catawba County, NC",
        approxCriticalMw: null,
        notes: "Operating since 2011 — one of Apple's flagship data center campuses, paired with an on-site solar array.",
      },
    },
    {
      type: "Feature",
      geometry: { type: "Point", coordinates: [-81.5449, 35.9098] },
      properties: {
        name: "Google Lenoir Data Center",
        operator: "Google",
        city: "Lenoir, Caldwell County, NC",
        approxCriticalMw: null,
        notes: "Operating since 2007/2009 — one of Google's earliest large-scale campuses.",
      },
    },
    {
      type: "Feature",
      geometry: { type: "Point", coordinates: [-81.8598, 35.3273] },
      properties: {
        name: "Meta Forest City Data Center",
        operator: "Meta",
        city: "Forest City, Rutherford County, NC",
        approxCriticalMw: null,
        notes: "Operating since 2012, part of Meta's original build-out generation of large-scale campuses.",
      },
    },
    {
      type: "Feature",
      geometry: { type: "Point", coordinates: [-80.8431, 35.2271] },
      properties: {
        name: "Charlotte Metro Colocation",
        operator: "Multiple",
        city: "Charlotte, NC",
        approxCriticalMw: null,
        notes: "Enterprise colocation and carrier-hotel facilities reported in the Charlotte metro (a major banking-sector data hub). City-center coordinates only — not a single campus.",
      },
    },
  ],
};
