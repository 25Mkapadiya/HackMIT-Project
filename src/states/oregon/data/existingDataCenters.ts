import type { FeatureCollection, Point } from "geojson";
import type { DataCenterProps } from "@/states/washington/data/existingDataCenters";

/**
 * Hand-curated, illustrative list of publicly reported Oregon data center areas. NOT exhaustive or verified. Coordinates are approximate area locations, not parcel-precise. MW is UNKNOWN (no operator-stated figures supplied).
 */
export const OR_EXISTING_DATA_CENTERS: FeatureCollection<Point, DataCenterProps> = {
  type: "FeatureCollection",
  features: [
    {
      type: "Feature",
      geometry: { type: "Point", coordinates: [-122.9898, 45.5229] },
      properties: {
        name: "Hillsboro Data Center Cluster",
        operator: "Multiple (including Google, Amazon and others)",
        city: "Hillsboro, OR",
        approxCriticalMw: null,
        notes: "Major Portland-metro data center and fiber hub. Area coordinates only - represents multiple campuses, not one facility.",
      },
    },
    {
      type: "Feature",
      geometry: { type: "Point", coordinates: [-120.8447, 44.2999] },
      properties: {
        name: "Prineville Data Center Area",
        operator: "Multiple (including Meta)",
        city: "Prineville, OR",
        approxCriticalMw: null,
        notes: "Central Oregon hyperscale cluster. Area coordinates only.",
      },
    },
    {
      type: "Feature",
      geometry: { type: "Point", coordinates: [-121.1787, 45.5946] },
      properties: {
        name: "The Dalles / Columbia River Corridor",
        operator: "Multiple (including Google)",
        city: "The Dalles, OR",
        approxCriticalMw: null,
        notes: "Columbia River corridor hyperscale development. Area coordinates only.",
      },
    },
    {
      type: "Feature",
      geometry: { type: "Point", coordinates: [-119.7006, 45.8401] },
      properties: {
        name: "Boardman / Morrow County Data Center Area",
        operator: "Multiple (including Amazon)",
        city: "Boardman, OR",
        approxCriticalMw: null,
        notes: "Eastern Oregon Columbia corridor hyperscale development. Area coordinates only.",
      },
    },
  ],
};
