/** Free, no-API-key vector basemap (CARTO). Dark theme fits the "institutional infra intelligence" look. */
export const BASEMAP_STYLE = "https://basemaps.cartocdn.com/gl/dark-matter-gl-style/style.json";

export function emptyFeatureCollection() {
  return { type: "FeatureCollection" as const, features: [] };
}
