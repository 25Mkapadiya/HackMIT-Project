import type { FeatureCollection, Point } from "geojson";
import type { DataCenterProps } from "@/states/washington/data/existingDataCenters";

/**
 * Hand-curated, illustrative list of publicly reported Oklahoma data center
 * campuses/projects. NOT an exhaustive or verified inventory — there is no free
 * authoritative national/state registry of data center facilities. Treat as a
 * "proxy" confidence layer, same as Washington's curated list. Coordinates are
 * approximate campus/area locations (town-center precision for planned/announced
 * projects where an exact parcel wasn't published), not parcel-precise.
 */
export const OK_EXISTING_DATA_CENTERS: FeatureCollection<Point, DataCenterProps> = {
  type: "FeatureCollection",
  features: [
    {
      type: "Feature",
      geometry: { type: "Point", coordinates: [-95.3181, 36.2917] },
      properties: {
        name: "Google Mayes County Data Center Campus",
        operator: "Google",
        city: "Pryor, OK (MidAmerica Industrial Park)",
        approxCriticalMw: null,
        notes: "Operating since 2011, multiple expansions (2012/2015/2018/2019). Google has committed $5.7B+ in Oklahoma since 2007.",
      },
    },
    {
      type: "Feature",
      geometry: { type: "Point", coordinates: [-95.3697, 35.7479] },
      properties: {
        name: "Core Scientific Muskogee / Port Muskogee HPC Facility",
        operator: "Core Scientific",
        city: "Muskogee, OK",
        approxCriticalMw: 100,
        notes: "High-performance computing (HPC/AI) facility developed with the Port of Muskogee; publicly reported operational target 2026. Approximate area coordinates, not parcel-precise.",
      },
    },
    {
      type: "Feature",
      geometry: { type: "Point", coordinates: [-95.8547, 36.2695] },
      properties: {
        name: "Project Clydesdale (Cherokee Industrial Park area)",
        operator: "Beale Infrastructure (reported hyperscale tenant involvement)",
        city: "Owasso, OK",
        approxCriticalMw: null,
        notes: "Publicly reported ~506-acre data center campus development near the Cherokee Industrial Park. Approximate area coordinates — exact site boundary not independently verified here.",
      },
    },
    {
      type: "Feature",
      geometry: { type: "Point", coordinates: [-97.5164, 35.4676] },
      properties: {
        name: "Oklahoma City Metro Colocation (TierPoint + others)",
        operator: "Multiple (TierPoint, Cerebras Systems, others)",
        city: "Oklahoma City, OK",
        approxCriticalMw: null,
        notes: "Enterprise colocation and AI-compute facilities reported in the OKC metro. City-center coordinates only — not a single campus.",
      },
    },
    {
      type: "Feature",
      geometry: { type: "Point", coordinates: [-95.9928, 36.154] },
      properties: {
        name: "Tulsa Metro Colocation (TierPoint + others)",
        operator: "Multiple (TierPoint, others)",
        city: "Tulsa, OK",
        approxCriticalMw: null,
        notes: "Enterprise colocation facilities reported in the Tulsa metro. City-center coordinates only — not a single campus.",
      },
    },
  ],
};
