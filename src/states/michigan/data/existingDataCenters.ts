import type { FeatureCollection, Point } from "geojson";
import type { DataCenterProps } from "@/states/washington/data/existingDataCenters";

/**
 * Hand-curated, illustrative list of publicly reported Michigan data
 * center/colocation markets. NOT an exhaustive or verified inventory.
 * Coordinates are approximate city/area locations, not parcel-precise.
 */
export const MI_EXISTING_DATA_CENTERS: FeatureCollection<Point, DataCenterProps> = {
  type: "FeatureCollection",
  features: [
    {
      type: "Feature",
      geometry: { type: "Point", coordinates: [-83.0458, 42.3314] },
      properties: {
        name: "Detroit Metro Facilities",
        operator: "Multiple",
        city: "Detroit, MI",
        approxCriticalMw: null,
        notes: "Enterprise and cloud infrastructure facilities reported in the Detroit metro area. City-center coordinates only — not a single campus.",
      },
    },
    {
      type: "Feature",
      geometry: { type: "Point", coordinates: [-85.6681, 42.9634] },
      properties: {
        name: "Grand Rapids Area Facilities",
        operator: "Multiple (e.g. Switch)",
        city: "Grand Rapids, MI",
        approxCriticalMw: null,
        notes: "Regional and hyperscale-adjacent colocation facilities reported near Grand Rapids. City-center coordinates only — not a single campus.",
      },
    },
    {
      type: "Feature",
      geometry: { type: "Point", coordinates: [-84.5555, 42.7325] },
      properties: {
        name: "Lansing Area Facilities",
        operator: "Multiple",
        city: "Lansing, MI",
        approxCriticalMw: null,
        notes: "State-government and enterprise computing facilities reported near Lansing. City-center coordinates only — not a single campus.",
      },
    },
    {
      type: "Feature",
      geometry: { type: "Point", coordinates: [-83.7430, 42.2808] },
      properties: {
        name: "Ann Arbor Area Facilities",
        operator: "Multiple",
        city: "Ann Arbor, MI",
        approxCriticalMw: null,
        notes: "Research-computing and enterprise facilities reported near Ann Arbor. City-center coordinates only — not a single campus.",
      },
    },
  ],
};
