import type { FeatureCollection, Point } from "geojson";
import type { DataCenterProps } from "@/states/washington/data/existingDataCenters";

/**
 * Hand-curated, illustrative list of publicly reported California data center markets. NOT exhaustive or verified - Silicon Valley alone hosts a very large concentration of facilities. Coordinates are approximate area locations, not parcel-precise. MW is UNKNOWN (no operator-stated figures supplied).
 */
export const CA_EXISTING_DATA_CENTERS: FeatureCollection<Point, DataCenterProps> = {
  type: "FeatureCollection",
  features: [
    {
      type: "Feature",
      geometry: { type: "Point", coordinates: [-121.9552, 37.3541] },
      properties: {
        name: "Santa Clara / Silicon Valley Data Center Cluster",
        operator: "Multiple",
        city: "Santa Clara, CA",
        approxCriticalMw: null,
        notes: "Dense enterprise/colocation cluster in the core Silicon Valley market. Area coordinates only - represents many facilities.",
      },
    },
    {
      type: "Feature",
      geometry: { type: "Point", coordinates: [-121.5301, 38.5816] },
      properties: {
        name: "Sacramento Data Center Area",
        operator: "Multiple",
        city: "Sacramento / West Sacramento, CA",
        approxCriticalMw: null,
        notes: "Secondary California market. Area coordinates only.",
      },
    },
    {
      type: "Feature",
      geometry: { type: "Point", coordinates: [-118.2564, 34.0486] },
      properties: {
        name: "Los Angeles Carrier Hotel District",
        operator: "Multiple",
        city: "Los Angeles, CA",
        approxCriticalMw: null,
        notes: "Downtown Los Angeles carrier hotel / colocation core. Area coordinates only.",
      },
    },
    {
      type: "Feature",
      geometry: { type: "Point", coordinates: [-117.3961, 33.9806] },
      properties: {
        name: "Inland Empire Data Center Area",
        operator: "Multiple",
        city: "Riverside / San Bernardino counties, CA",
        approxCriticalMw: null,
        notes: "Growing Southern California market east of Los Angeles. Area coordinates only.",
      },
    },
  ],
};
