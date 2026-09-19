/** Free, no-API-key vector basemap (CARTO). Dark theme fits the "institutional infra intelligence" look. */
export const BASEMAP_STYLE = "https://basemaps.cartocdn.com/gl/dark-matter-gl-style/style.json";

/**
 * Generous rectangle covering the US (CONUS + Alaska + Hawaii, with padding) used as
 * the map's hard pan/zoom limit — a single lng/lat box can't hug the country's actual
 * shape, so this necessarily includes slivers of Canada/Mexico/ocean along the edges,
 * but it keeps the map from wandering off into other continents. State-picker flights
 * to Alaska/Hawaii still land correctly since both are inside this box.
 */
export const US_MAX_BOUNDS: [[number, number], [number, number]] = [
  [-179.9, 15],
  [-63, 72],
];

/**
 * Absolute floor for the pan/zoom-out limit — a last-resort fallback if the dynamic
 * fit-to-viewport calculation in MapView (see `fitMinZoomToBounds`) can't run yet.
 * Deliberately low: the real floor is computed per-viewport size so US_MAX_BOUNDS
 * always fills the screen instead of floating in blank space at a fixed zoom that
 * only happens to fit one window size.
 */
export const US_MIN_ZOOM = 2;

export function emptyFeatureCollection() {
  return { type: "FeatureCollection" as const, features: [] };
}
