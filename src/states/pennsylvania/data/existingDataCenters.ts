import type { FeatureCollection, Point } from "geojson";
import type { DataCenterProps } from "@/states/washington/data/existingDataCenters";

/**
 * Hand-curated, illustrative list of publicly reported Pennsylvania data
 * center/colocation markets. NOT an exhaustive or verified inventory.
 * Coordinates are approximate city/area locations, not parcel-precise.
 */
export const PA_EXISTING_DATA_CENTERS: FeatureCollection<Point, DataCenterProps> = {
  type: "FeatureCollection",
  features: [
    {
      type: "Feature",
      geometry: { type: "Point", coordinates: [-75.1652, 39.9526] },
      properties: {
        name: "Philadelphia Region Facilities",
        operator: "Multiple (e.g. QTS, Flexential, TierPoint)",
        city: "Philadelphia, PA",
        approxCriticalMw: null,
        notes: "Enterprise and colocation facilities reported in the Philadelphia region. City-center coordinates only — not a single campus.",
      },
    },
    {
      type: "Feature",
      geometry: { type: "Point", coordinates: [-79.9959, 40.4406] },
      properties: {
        name: "Pittsburgh Region Facilities",
        operator: "Multiple",
        city: "Pittsburgh, PA",
        approxCriticalMw: null,
        notes: "Enterprise and hyperscale-adjacent facilities reported in the Pittsburgh region. City-center coordinates only — not a single campus.",
      },
    },
    {
      type: "Feature",
      geometry: { type: "Point", coordinates: [-75.4902, 40.6023] },
      properties: {
        name: "Lehigh Valley Facilities",
        operator: "Multiple",
        city: "Allentown, PA",
        approxCriticalMw: null,
        notes: "Regional facilities reported in the Lehigh Valley. City-center coordinates only — not a single campus.",
      },
    },
    {
      type: "Feature",
      geometry: { type: "Point", coordinates: [-75.6624, 41.4089] },
      properties: {
        name: "Northeast Pennsylvania Facilities",
        operator: "Multiple",
        city: "Scranton, PA",
        approxCriticalMw: null,
        notes: "Regional facilities reported in Northeast Pennsylvania. City-center coordinates only — not a single campus.",
      },
    },
  ],
};
