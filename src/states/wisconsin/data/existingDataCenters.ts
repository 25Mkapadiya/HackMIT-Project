import type { FeatureCollection, Point } from "geojson";
import type { DataCenterProps } from "@/states/washington/data/existingDataCenters";

/**
 * Hand-curated, illustrative list of publicly reported Wisconsin data
 * center/colocation markets. NOT an exhaustive or verified inventory.
 * Coordinates are approximate city/area locations, not parcel-precise.
 */
export const WI_EXISTING_DATA_CENTERS: FeatureCollection<Point, DataCenterProps> = {
  type: "FeatureCollection",
  features: [
    {
      type: "Feature",
      geometry: { type: "Point", coordinates: [-87.9065, 43.0389] },
      properties: {
        name: "Milwaukee Area Facilities",
        operator: "Multiple (e.g. Oracle)",
        city: "Milwaukee, WI",
        approxCriticalMw: null,
        notes: "Enterprise and cloud infrastructure facilities reported near Milwaukee. City-center coordinates only — not a single campus.",
      },
    },
    {
      type: "Feature",
      geometry: { type: "Point", coordinates: [-89.4012, 43.0731] },
      properties: {
        name: "Madison Area Facilities",
        operator: "Multiple (e.g. Epic Hosting)",
        city: "Madison, WI",
        approxCriticalMw: null,
        notes: "Healthcare-technology and enterprise computing facilities reported near Madison. City-center coordinates only — not a single campus.",
      },
    },
    {
      type: "Feature",
      geometry: { type: "Point", coordinates: [-87.8834, 42.7261] },
      properties: {
        name: "Mount Pleasant Area Facilities",
        operator: "Multiple (e.g. Microsoft)",
        city: "Mount Pleasant, WI",
        approxCriticalMw: null,
        notes: "Large-scale hyperscale development reported near Mount Pleasant in Racine County. City-center coordinates only — not a single campus.",
      },
    },
    {
      type: "Feature",
      geometry: { type: "Point", coordinates: [-87.8654, 43.3878] },
      properties: {
        name: "Port Washington Area Facilities",
        operator: "Multiple (e.g. Microsoft)",
        city: "Port Washington, WI",
        approxCriticalMw: null,
        notes: "Hyperscale development reported near Port Washington. City-center coordinates only — not a single campus.",
      },
    },
  ],
};
