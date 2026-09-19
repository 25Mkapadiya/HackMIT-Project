import type { FeatureCollection, Point } from "geojson";
import type { DataCenterProps } from "@/states/washington/data/existingDataCenters";

/**
 * Hand-curated, illustrative list of publicly reported Alabama data center
 * campuses/projects. NOT an exhaustive or verified inventory. Coordinates are
 * approximate campus/area locations, not parcel-precise.
 */
export const AL_EXISTING_DATA_CENTERS: FeatureCollection<Point, DataCenterProps> = {
  type: "FeatureCollection",
  features: [
    {
      type: "Feature",
      geometry: { type: "Point", coordinates: [-85.7191, 34.9376] },
      properties: {
        name: "Google Bridgeport Data Center Campus",
        operator: "Google",
        city: "Bridgeport, Jackson County, AL",
        approxCriticalMw: null,
        notes: "Operating since 2019 on a repurposed former coal power plant site. Google announced a further $1.5B expansion for 2026-2027.",
      },
    },
    {
      type: "Feature",
      geometry: { type: "Point", coordinates: [-86.5861, 34.7304] },
      properties: {
        name: "Meta Huntsville Data Center",
        operator: "Meta",
        city: "Huntsville, AL",
        approxCriticalMw: null,
        notes: "Meta data center campus in Huntsville.",
      },
    },
    {
      type: "Feature",
      geometry: { type: "Point", coordinates: [-86.3077, 32.3792] },
      properties: {
        name: "Meta Montgomery Data Center",
        operator: "Meta",
        city: "Montgomery, AL",
        approxCriticalMw: null,
        notes: "Announced second Alabama Meta campus; combined Huntsville + Montgomery investment reported at ~$3B. City-center coordinates, not parcel-precise.",
      },
    },
    {
      type: "Feature",
      geometry: { type: "Point", coordinates: [-86.8025, 33.5207] },
      properties: {
        name: "DC BLOX Birmingham",
        operator: "DC BLOX",
        city: "Birmingham, AL",
        approxCriticalMw: null,
        notes: "Regional colocation facility; DC BLOX also operates a Huntsville facility.",
      },
    },
  ],
};
