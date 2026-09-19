import type { FeatureCollection, Point } from "geojson";
import type { DataCenterProps } from "@/states/washington/data/existingDataCenters";

/**
 * Hand-curated, illustrative list of publicly reported Kansas data
 * center/colocation markets. NOT an exhaustive or verified inventory.
 * Coordinates are approximate city/area locations, not parcel-precise.
 */
export const KS_EXISTING_DATA_CENTERS: FeatureCollection<Point, DataCenterProps> = {
  type: "FeatureCollection",
  features: [
    {
      type: "Feature",
      geometry: { type: "Point", coordinates: [-94.6708, 38.9822] },
      properties: {
        name: "Overland Park Area Facilities",
        operator: "Multiple",
        city: "Overland Park, KS",
        approxCriticalMw: null,
        notes: "Enterprise colocation facilities reported on the Kansas side of the Kansas City metro. City-center coordinates only — not a single campus.",
      },
    },
    {
      type: "Feature",
      geometry: { type: "Point", coordinates: [-94.8191, 38.8814] },
      properties: {
        name: "Olathe Area Facilities",
        operator: "Multiple",
        city: "Olathe, KS",
        approxCriticalMw: null,
        notes: "Enterprise/edge facilities reported near Olathe. City-center coordinates only — not a single campus.",
      },
    },
    {
      type: "Feature",
      geometry: { type: "Point", coordinates: [-97.3375, 37.6872] },
      properties: {
        name: "Wichita Area Facilities",
        operator: "Multiple",
        city: "Wichita, KS",
        approxCriticalMw: null,
        notes: "Regional enterprise facilities reported near Wichita. City-center coordinates only — not a single campus.",
      },
    },
  ],
};
