import type { FeatureCollection, Point } from "geojson";
import type { DataCenterProps } from "@/states/washington/data/existingDataCenters";

/**
 * Hand-curated, illustrative list of publicly reported New Mexico data
 * center/colocation markets. NOT an exhaustive or verified inventory.
 * Coordinates are approximate city/area locations, not parcel-precise.
 */
export const NM_EXISTING_DATA_CENTERS: FeatureCollection<Point, DataCenterProps> = {
  type: "FeatureCollection",
  features: [
    {
      type: "Feature",
      geometry: { type: "Point", coordinates: [-106.6504, 35.0844] },
      properties: {
        name: "Albuquerque Metro Facilities",
        operator: "Multiple",
        city: "Albuquerque, NM",
        approxCriticalMw: null,
        notes: "Enterprise, defense-adjacent, and research-computing facilities reported in the Albuquerque metro area. City-center coordinates only — not a single campus.",
      },
    },
    {
      type: "Feature",
      geometry: { type: "Point", coordinates: [-106.6900, 35.2328] },
      properties: {
        name: "Rio Rancho Area Facilities",
        operator: "Multiple",
        city: "Rio Rancho, NM",
        approxCriticalMw: null,
        notes: "Enterprise facilities reported near Rio Rancho. City-center coordinates only — not a single campus.",
      },
    },
    {
      type: "Feature",
      geometry: { type: "Point", coordinates: [-105.9378, 35.6870] },
      properties: {
        name: "Santa Fe Corridor Facilities",
        operator: "Multiple",
        city: "Santa Fe, NM",
        approxCriticalMw: null,
        notes: "Government and research-adjacent facilities reported along the Santa Fe corridor. City-center coordinates only — not a single campus.",
      },
    },
  ],
};
