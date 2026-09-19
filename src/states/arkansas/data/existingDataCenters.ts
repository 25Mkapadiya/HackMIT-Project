import type { FeatureCollection, Point } from "geojson";
import type { DataCenterProps } from "@/states/washington/data/existingDataCenters";

/**
 * Hand-curated, illustrative list of publicly reported Arkansas data center
 * campuses/projects. NOT an exhaustive or verified inventory — see the
 * Washington/Oklahoma curated lists for the same caveat. Coordinates are
 * approximate campus/area locations, not parcel-precise.
 */
export const AR_EXISTING_DATA_CENTERS: FeatureCollection<Point, DataCenterProps> = {
  type: "FeatureCollection",
  features: [
    {
      type: "Feature",
      geometry: { type: "Point", coordinates: [-92.2143, 34.6746] },
      properties: {
        name: "Google Port of Little Rock Data Center",
        operator: "Google",
        city: "Little Rock, AR",
        approxCriticalMw: null,
        notes: "Announced ~$1B, 300,000 sq ft campus at the Port of Little Rock.",
      },
    },
    {
      type: "Feature",
      geometry: { type: "Point", coordinates: [-92.436, 34.7465] },
      properties: {
        name: "TierPoint Little Rock",
        operator: "TierPoint",
        city: "Little Rock, AR",
        approxCriticalMw: null,
        notes: "Colocation facility on Chenal Parkway, west Little Rock.",
      },
    },
    {
      type: "Feature",
      geometry: { type: "Point", coordinates: [-94.2088, 36.3729] },
      properties: {
        name: "Walmart Bentonville Data Center",
        operator: "Walmart",
        city: "Bentonville, AR",
        approxCriticalMw: null,
        notes: "Corporate data center supporting Walmart's Northwest Arkansas HQ campus. Area coordinates, not parcel-precise.",
      },
    },
    {
      type: "Feature",
      geometry: { type: "Point", coordinates: [-92.05, 34.4] },
      properties: {
        name: "AVAIO Digital Partners — I-530 Campus",
        operator: "AVAIO Digital Partners",
        city: "South of Little Rock (Jefferson/Lonoke County area), AR",
        approxCriticalMw: null,
        notes: "Publicly reported ~$6B, 760-acre planned campus near I-530. Approximate area coordinates — exact parcel not independently verified here.",
      },
    },
  ],
};
