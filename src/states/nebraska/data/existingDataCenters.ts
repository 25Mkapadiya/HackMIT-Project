import type { FeatureCollection, Point } from "geojson";
import type { DataCenterProps } from "@/states/washington/data/existingDataCenters";

/**
 * Hand-curated, illustrative list of publicly reported Nebraska data
 * center/colocation markets. NOT an exhaustive or verified inventory.
 * Coordinates are approximate city/area locations, not parcel-precise.
 */
export const NE_EXISTING_DATA_CENTERS: FeatureCollection<Point, DataCenterProps> = {
  type: "FeatureCollection",
  features: [
    {
      type: "Feature",
      geometry: { type: "Point", coordinates: [-95.9345, 41.2565] },
      properties: {
        name: "Omaha Metro Facilities",
        operator: "Multiple",
        city: "Omaha, NE",
        approxCriticalMw: null,
        notes: "Enterprise and financial-services colocation facilities reported in the Omaha metro area, supported by Nebraska's public-power model. City-center coordinates only — not a single campus.",
      },
    },
    {
      type: "Feature",
      geometry: { type: "Point", coordinates: [-96.6852, 40.8136] },
      properties: {
        name: "Lincoln Area Facilities",
        operator: "Multiple",
        city: "Lincoln, NE",
        approxCriticalMw: null,
        notes: "Regional enterprise facilities reported near Lincoln. City-center coordinates only — not a single campus.",
      },
    },
    {
      type: "Feature",
      geometry: { type: "Point", coordinates: [-96.0422, 41.1544] },
      properties: {
        name: "Papillion / Bellevue Area Facilities",
        operator: "Multiple",
        city: "Papillion, NE",
        approxCriticalMw: null,
        notes: "Enterprise facilities reported in the southern Omaha metro suburbs. City-center coordinates only — not a single campus.",
      },
    },
  ],
};
