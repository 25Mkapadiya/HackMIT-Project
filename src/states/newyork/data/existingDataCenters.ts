import type { FeatureCollection, Point } from "geojson";
import type { DataCenterProps } from "@/states/washington/data/existingDataCenters";

/**
 * Hand-curated, illustrative list of publicly reported New York data
 * center/colocation markets. NOT an exhaustive or verified inventory.
 * Coordinates are approximate city/area locations, not parcel-precise.
 */
export const NY_EXISTING_DATA_CENTERS: FeatureCollection<Point, DataCenterProps> = {
  type: "FeatureCollection",
  features: [
    {
      type: "Feature",
      geometry: { type: "Point", coordinates: [-74.006, 40.7128] },
      properties: {
        name: "New York City Colocation / IX Ecosystem",
        operator: "Multiple (e.g. Digital Realty, Equinix)",
        city: "New York, NY",
        approxCriticalMw: null,
        notes: "One of the world's largest carrier-hotel and colocation ecosystems, reported across Manhattan and outer-borough facilities. City-center coordinates only — not a single campus.",
      },
    },
    {
      type: "Feature",
      geometry: { type: "Point", coordinates: [-78.8784, 42.8864] },
      properties: {
        name: "Buffalo Area Facilities",
        operator: "Multiple",
        city: "Buffalo, NY",
        approxCriticalMw: null,
        notes: "Regional enterprise facilities reported near Buffalo. City-center coordinates only — not a single campus.",
      },
    },
    {
      type: "Feature",
      geometry: { type: "Point", coordinates: [-77.6109, 43.1566] },
      properties: {
        name: "Rochester Area Facilities",
        operator: "Multiple",
        city: "Rochester, NY",
        approxCriticalMw: null,
        notes: "Regional enterprise and research-computing facilities reported near Rochester. City-center coordinates only — not a single campus.",
      },
    },
    {
      type: "Feature",
      geometry: { type: "Point", coordinates: [-73.7562, 42.6526] },
      properties: {
        name: "Albany Area Facilities",
        operator: "Multiple",
        city: "Albany, NY",
        approxCriticalMw: null,
        notes: "State-government and enterprise computing facilities reported near Albany. City-center coordinates only — not a single campus.",
      },
    },
    {
      type: "Feature",
      geometry: { type: "Point", coordinates: [-76.1474, 43.0481] },
      properties: {
        name: "Syracuse Area Facilities",
        operator: "Multiple",
        city: "Syracuse, NY",
        approxCriticalMw: null,
        notes: "Regional enterprise facilities reported near Syracuse. City-center coordinates only — not a single campus.",
      },
    },
  ],
};
