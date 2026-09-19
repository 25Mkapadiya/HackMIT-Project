import type { FeatureCollection, Point } from "geojson";
import type { DataCenterProps } from "@/states/washington/data/existingDataCenters";

/**
 * Hand-curated, illustrative list of publicly reported Texas data center
 * campuses/projects. NOT an exhaustive or verified inventory — Texas is one
 * of the largest data center markets in the country, so this is a small
 * sample, not a survey. Coordinates are approximate campus/area locations,
 * not parcel-precise.
 */
export const TX_EXISTING_DATA_CENTERS: FeatureCollection<Point, DataCenterProps> = {
  type: "FeatureCollection",
  features: [
    {
      type: "Feature",
      geometry: { type: "Point", coordinates: [-96.8903, 32.9756] },
      properties: {
        name: "CyrusOne Carrollton Campus",
        operator: "CyrusOne",
        city: "Carrollton, TX",
        approxCriticalMw: null,
        notes: "Opened 2012 — was the largest data center in Texas at the time; part of the Dallas-Fort Worth hyperscale/colocation cluster.",
      },
    },
    {
      type: "Feature",
      geometry: { type: "Point", coordinates: [-97.3428, 31.0982] },
      properties: {
        name: "Meta Temple AI Data Center",
        operator: "Meta",
        city: "Temple, TX",
        approxCriticalMw: 152,
        notes: "Meta's first AI-optimized data center to go online worldwide — 760,000+ sq ft across two buildings, ~$1.2B+ investment, operational since 2026.",
      },
    },
    {
      type: "Feature",
      geometry: { type: "Point", coordinates: [-97.3428, 32.7357] },
      properties: {
        name: "Meta Fort Worth Data Center",
        operator: "Meta",
        city: "Fort Worth, TX",
        approxCriticalMw: null,
        notes: "One of Meta's original-generation large-scale campuses (broke ground over a decade ago).",
      },
    },
    {
      type: "Feature",
      geometry: { type: "Point", coordinates: [-97.7431, 30.2672] },
      properties: {
        name: "Austin Metro Colocation",
        operator: "Multiple",
        city: "Austin, TX",
        approxCriticalMw: null,
        notes: "Enterprise colocation and cloud-region facilities reported in the Austin metro. City-center coordinates only — not a single campus.",
      },
    },
  ],
};
