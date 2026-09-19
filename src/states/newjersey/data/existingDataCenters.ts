import type { FeatureCollection, Point } from "geojson";
import type { DataCenterProps } from "@/states/washington/data/existingDataCenters";

/**
 * Hand-curated, illustrative list of publicly reported New Jersey data
 * center/colocation clusters. NOT an exhaustive or verified inventory.
 * Coordinates are approximate city/area locations, not parcel-precise.
 */
export const NJ_EXISTING_DATA_CENTERS: FeatureCollection<Point, DataCenterProps> = {
  type: "FeatureCollection",
  features: [
    {
      type: "Feature",
      geometry: { type: "Point", coordinates: [-74.1724, 40.7357] },
      properties: {
        name: "Newark Area Colocation",
        operator: "Multiple (e.g. Equinix, Digital Realty)",
        city: "Newark, NJ",
        approxCriticalMw: null,
        notes: "Major carrier-hotel and colocation facilities reported near Newark, part of the broader New York metro connectivity market. City-center coordinates only — not a single campus.",
      },
    },
    {
      type: "Feature",
      geometry: { type: "Point", coordinates: [-74.0776, 40.7178] },
      properties: {
        name: "Jersey City Area Facilities",
        operator: "Multiple",
        city: "Jersey City, NJ",
        approxCriticalMw: null,
        notes: "Financial-services-adjacent enterprise and colocation facilities reported near Jersey City. City-center coordinates only — not a single campus.",
      },
    },
    {
      type: "Feature",
      geometry: { type: "Point", coordinates: [-74.0565, 40.7895] },
      properties: {
        name: "Secaucus Area Facilities",
        operator: "Multiple (e.g. Cologix, CoreWeave)",
        city: "Secaucus, NJ",
        approxCriticalMw: null,
        notes: "Enterprise and cloud infrastructure facilities reported near Secaucus. City-center coordinates only — not a single campus.",
      },
    },
    {
      type: "Feature",
      geometry: { type: "Point", coordinates: [-74.4121, 40.5187] },
      properties: {
        name: "Edison Area Facilities",
        operator: "Multiple",
        city: "Edison, NJ",
        approxCriticalMw: null,
        notes: "Enterprise and colocation facilities reported near Edison. City-center coordinates only — not a single campus.",
      },
    },
    {
      type: "Feature",
      geometry: { type: "Point", coordinates: [-74.4668, 40.4995] },
      properties: {
        name: "Piscataway Area Facilities",
        operator: "Multiple (e.g. DataBank)",
        city: "Piscataway, NJ",
        approxCriticalMw: null,
        notes: "Regional enterprise/colocation facilities reported near Piscataway, central New Jersey. City-center coordinates only — not a single campus.",
      },
    },
  ],
};
