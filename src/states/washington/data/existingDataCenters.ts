import type { FeatureCollection, Point } from "geojson";
import type { DataCenterProps } from "@/lib/gis/nationalLayers";

export type { DataCenterProps };

/**
 * Hand-curated, illustrative list of publicly reported major WA data center campuses.
 * This is NOT an exhaustive or verified inventory — there is no free authoritative
 * national/state registry of data center facilities. Treat as a "proxy" confidence layer.
 * Coordinates are approximate campus locations, not parcel-precise.
 */
export const WA_EXISTING_DATA_CENTERS: FeatureCollection<Point, DataCenterProps> = {
  type: "FeatureCollection",
  features: [
    {
      type: "Feature",
      geometry: { type: "Point", coordinates: [-119.8342, 47.2343] },
      properties: {
        name: "Microsoft Quincy Data Center Campus",
        operator: "Microsoft",
        city: "Quincy, WA",
        approxCriticalMw: null,
        notes: "One of Microsoft's largest cloud campuses; multiple buildings, expanded over 15+ years.",
      },
    },
    {
      type: "Feature",
      geometry: { type: "Point", coordinates: [-119.858, 47.2295] },
      properties: {
        name: "Vantage Data Centers Quincy Campus",
        operator: "Vantage Data Centers",
        city: "Quincy, WA",
        approxCriticalMw: null,
        notes: "Former Yahoo/Sabey-area campus site, multi-building hyperscale campus.",
      },
    },
    {
      type: "Feature",
      geometry: { type: "Point", coordinates: [-119.8506, 47.2367] },
      properties: {
        name: "Sabey Intergate.Quincy",
        operator: "Sabey Data Centers",
        city: "Quincy, WA",
        approxCriticalMw: null,
        notes: "Multi-tenant colocation campus in the Quincy data center corridor.",
      },
    },
    {
      type: "Feature",
      geometry: { type: "Point", coordinates: [-120.3103, 47.4235] },
      properties: {
        name: "Sabey Intergate.Wenatchee",
        operator: "Sabey Data Centers",
        city: "Wenatchee, WA",
        approxCriticalMw: null,
        notes: "Multi-tenant colocation campus near the Columbia River / Rocky Reach hydro corridor.",
      },
    },
    {
      type: "Feature",
      geometry: { type: "Point", coordinates: [-122.3389, 47.6144] },
      properties: {
        name: "Seattle Carrier Hotel District (Westin Building area)",
        operator: "Multiple (Digital Realty, Equinix, others)",
        city: "Seattle, WA",
        approxCriticalMw: null,
        notes: "Dense urban colocation / interconnection cluster, not a single campus.",
      },
    },
    {
      type: "Feature",
      geometry: { type: "Point", coordinates: [-119.0022, 47.1301] },
      properties: {
        name: "Moses Lake Data Center Area",
        operator: "Multiple",
        city: "Moses Lake, WA",
        approxCriticalMw: null,
        notes: "Grant County PUD service territory; low-cost hydropower has attracted industrial/data facilities.",
      },
    },
  ],
};
