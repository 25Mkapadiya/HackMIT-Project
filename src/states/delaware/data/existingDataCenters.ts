import type { FeatureCollection, Point } from "geojson";
import type { DataCenterProps } from "@/states/washington/data/existingDataCenters";

/**
 * Hand-curated, illustrative list of publicly reported Delaware data center
 * campuses/projects. NOT an exhaustive or verified inventory. Coordinates are
 * approximate campus/area locations, not parcel-precise.
 */
export const DE_EXISTING_DATA_CENTERS: FeatureCollection<Point, DataCenterProps> = {
  type: "FeatureCollection",
  features: [
    {
      type: "Feature",
      geometry: { type: "Point", coordinates: [-75.5466, 39.7391] },
      properties: {
        name: "Wilmington / Northern Delaware Colocation",
        operator: "Multiple",
        city: "Wilmington, DE",
        approxCriticalMw: null,
        notes: "Enterprise colocation facilities reported in the Wilmington/Northern Delaware corridor, serving the region's financial-services sector. City-center coordinates only — not a single campus.",
      },
    },
    {
      type: "Feature",
      geometry: { type: "Point", coordinates: [-75.7497, 39.6837] },
      properties: {
        name: "Newark, DE Area Facilities",
        operator: "Multiple",
        city: "Newark, DE",
        approxCriticalMw: null,
        notes: "Enterprise/edge facilities reported near Newark, close to the Maryland and Pennsylvania borders. City-area coordinates only — not a single campus.",
      },
    },
  ],
};
