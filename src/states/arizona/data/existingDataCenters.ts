import type { FeatureCollection, Point } from "geojson";
import type { DataCenterProps } from "@/states/washington/data/existingDataCenters";

/**
 * Hand-curated, illustrative list of publicly reported Arizona data center
 * campuses, concentrated in the Phoenix metro area. NOT an exhaustive or
 * verified inventory. Coordinates are approximate city/area locations, not
 * parcel-precise.
 */
export const AZ_EXISTING_DATA_CENTERS: FeatureCollection<Point, DataCenterProps> = {
  type: "FeatureCollection",
  features: [
    {
      type: "Feature",
      geometry: { type: "Point", coordinates: [-112.074, 33.4484] },
      properties: {
        name: "Phoenix Metro Facilities",
        operator: "Multiple",
        city: "Phoenix, AZ",
        approxCriticalMw: null,
        notes: "Hyperscale and enterprise colocation facilities reported across the Phoenix metro area. City-center coordinates only — not a single campus.",
      },
    },
    {
      type: "Feature",
      geometry: { type: "Point", coordinates: [-111.8315, 33.3062] },
      properties: {
        name: "Chandler Area Facilities",
        operator: "Multiple",
        city: "Chandler, AZ",
        approxCriticalMw: null,
        notes: "Hyperscale campuses reported near Chandler. City-center coordinates only — not a single campus.",
      },
    },
    {
      type: "Feature",
      geometry: { type: "Point", coordinates: [-112.358, 33.4353] },
      properties: {
        name: "Goodyear Area Facilities",
        operator: "Multiple",
        city: "Goodyear, AZ",
        approxCriticalMw: null,
        notes: "Hyperscale campuses reported near Goodyear on the West Valley. City-center coordinates only — not a single campus.",
      },
    },
    {
      type: "Feature",
      geometry: { type: "Point", coordinates: [-112.5843, 33.3703] },
      properties: {
        name: "Buckeye Area Facilities",
        operator: "Multiple",
        city: "Buckeye, AZ",
        approxCriticalMw: null,
        notes: "Emerging hyperscale development reported near Buckeye. City-center coordinates only — not a single campus.",
      },
    },
    {
      type: "Feature",
      geometry: { type: "Point", coordinates: [-111.8315, 33.4152] },
      properties: {
        name: "Mesa Area Facilities",
        operator: "Multiple",
        city: "Mesa, AZ",
        approxCriticalMw: null,
        notes: "Enterprise and hyperscale-adjacent facilities reported near Mesa. City-center coordinates only — not a single campus.",
      },
    },
  ],
};
