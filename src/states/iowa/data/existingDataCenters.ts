import type { FeatureCollection, Point } from "geojson";
import type { DataCenterProps } from "@/states/washington/data/existingDataCenters";

/**
 * Hand-curated, illustrative list of publicly reported Iowa data
 * center/hyperscale clusters. NOT an exhaustive or verified inventory.
 * Coordinates are approximate city/area locations, not parcel-precise.
 */
export const IA_EXISTING_DATA_CENTERS: FeatureCollection<Point, DataCenterProps> = {
  type: "FeatureCollection",
  features: [
    {
      type: "Feature",
      geometry: { type: "Point", coordinates: [-95.8608, 41.2619] },
      properties: {
        name: "Council Bluffs Hyperscale Cluster",
        operator: "Multiple (e.g. Google, Microsoft)",
        city: "Council Bluffs, IA",
        approxCriticalMw: null,
        notes: "Major hyperscale campuses reported near Council Bluffs, one of Iowa's largest data-center clusters. City-center coordinates only — not a single campus.",
      },
    },
    {
      type: "Feature",
      geometry: { type: "Point", coordinates: [-93.7108, 41.5793] },
      properties: {
        name: "West Des Moines Area Facilities",
        operator: "Multiple (e.g. Meta, Apple)",
        city: "West Des Moines, IA",
        approxCriticalMw: null,
        notes: "Hyperscale and enterprise facilities reported near West Des Moines. City-center coordinates only — not a single campus.",
      },
    },
    {
      type: "Feature",
      geometry: { type: "Point", coordinates: [-93.4646, 41.6461] },
      properties: {
        name: "Altoona Area Facilities",
        operator: "Multiple (e.g. Facebook/Meta)",
        city: "Altoona, IA",
        approxCriticalMw: null,
        notes: "Hyperscale facilities reported near Altoona. City-center coordinates only — not a single campus.",
      },
    },
    {
      type: "Feature",
      geometry: { type: "Point", coordinates: [-91.6656, 41.9779] },
      properties: {
        name: "Cedar Rapids Area Facilities",
        operator: "Multiple",
        city: "Cedar Rapids, IA",
        approxCriticalMw: null,
        notes: "Enterprise and regional facilities reported near Cedar Rapids. City-center coordinates only — not a single campus.",
      },
    },
  ],
};
