import type { FeatureCollection, Point } from "geojson";
import type { DataCenterProps } from "@/states/washington/data/existingDataCenters";

/**
 * Hand-curated, illustrative list of publicly reported Massachusetts data
 * center/colocation clusters. NOT an exhaustive or verified inventory.
 * Coordinates are approximate city/area locations, not parcel-precise.
 */
export const MA_EXISTING_DATA_CENTERS: FeatureCollection<Point, DataCenterProps> = {
  type: "FeatureCollection",
  features: [
    {
      type: "Feature",
      geometry: { type: "Point", coordinates: [-71.2356, 42.3765] },
      properties: {
        name: "Waltham Area Colocation",
        operator: "Multiple",
        city: "Waltham, MA",
        approxCriticalMw: null,
        notes: "Enterprise colocation facilities reported along the Route 128 tech corridor near Waltham. City-center coordinates only — not a single campus.",
      },
    },
    {
      type: "Feature",
      geometry: { type: "Point", coordinates: [-71.1912, 42.5048] },
      properties: {
        name: "Burlington, MA Area Facilities",
        operator: "Multiple",
        city: "Burlington, MA",
        approxCriticalMw: null,
        notes: "Enterprise and cloud infrastructure facilities reported near Burlington, MA. City-center coordinates only — not a single campus.",
      },
    },
    {
      type: "Feature",
      geometry: { type: "Point", coordinates: [-71.5523, 42.3459] },
      properties: {
        name: "Marlborough Area Facilities",
        operator: "Multiple",
        city: "Marlborough, MA",
        approxCriticalMw: null,
        notes: "Enterprise and colocation facilities reported near Marlborough. City-center coordinates only — not a single campus.",
      },
    },
    {
      type: "Feature",
      geometry: { type: "Point", coordinates: [-71.0023, 42.2529] },
      properties: {
        name: "Quincy Area Facilities",
        operator: "Multiple",
        city: "Quincy, MA",
        approxCriticalMw: null,
        notes: "Facilities reported near Quincy, south of Boston. City-center coordinates only — not a single campus.",
      },
    },
    {
      type: "Feature",
      geometry: { type: "Point", coordinates: [-71.1097, 42.3736] },
      properties: {
        name: "Cambridge Corridor Facilities",
        operator: "Multiple",
        city: "Cambridge, MA",
        approxCriticalMw: null,
        notes: "Research-computing and enterprise facilities reported in the Cambridge/Kendall Square corridor, tied to biotech and research demand. City-center coordinates only — not a single campus.",
      },
    },
  ],
};
