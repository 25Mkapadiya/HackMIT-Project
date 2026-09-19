import type { FeatureCollection, Point } from "geojson";
import type { DataCenterProps } from "@/states/washington/data/existingDataCenters";

/**
 * Hand-curated, illustrative list of publicly reported Tennessee data center
 * campuses/projects. NOT an exhaustive or verified inventory. Coordinates are
 * approximate campus/area locations, not parcel-precise.
 */
export const TN_EXISTING_DATA_CENTERS: FeatureCollection<Point, DataCenterProps> = {
  type: "FeatureCollection",
  features: [
    {
      type: "Feature",
      geometry: { type: "Point", coordinates: [-90.062, 35.028] },
      properties: {
        name: "xAI Colossus AI Supercomputer Campus",
        operator: "xAI",
        city: "Memphis, TN",
        approxCriticalMw: 1000,
        notes: "Built on a former Electrolux appliance factory (3231 Riverport Rd / Paul Lowry Rd) starting mid-2024; now a multi-building cluster with ~770,000 GPUs reportedly straddling the TN-MS line, targeting up to 2 GW.",
      },
    },
    {
      type: "Feature",
      geometry: { type: "Point", coordinates: [-86.7816, 36.1627] },
      properties: {
        name: "Nashville Metro Colocation",
        operator: "Multiple",
        city: "Nashville, TN",
        approxCriticalMw: null,
        notes: "Enterprise colocation facilities reported in the Nashville metro. City-center coordinates only — not a single campus.",
      },
    },
    {
      type: "Feature",
      geometry: { type: "Point", coordinates: [-85.3097, 35.0456] },
      properties: {
        name: "Chattanooga / EPB Fiber Metro",
        operator: "Multiple",
        city: "Chattanooga, TN",
        approxCriticalMw: null,
        notes: "Chattanooga's EPB municipal gigabit fiber network has attracted enterprise and colocation facilities. City-center coordinates only.",
      },
    },
  ],
};
