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
 * Camera floor for the primary map. Keep the zoom-out framing centered on the
 * contiguous U.S.; Hawaii is represented in a dedicated inset map so including
 * its longitude here would pull the whole nationwide view far into the Pacific.
 *
 * This only affects the primary camera framing. Placement validation still uses
 * the authoritative full U.S. state boundary, and US_MAX_BOUNDS remains generous
 * enough to reach Alaska/Hawaii when a dedicated state view needs them.
 */
export const US_MAINLAND_VIEW_BOUNDS: [[number, number], [number, number]] = [
  [-125.1, 24.2],
  [-66.3, 49.8],
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
