/** @type {import('next').NextConfig} */
const nextConfig = {
  // MapLibre GL owns a WebGL context + in-flight network requests that don't tolerate
  // StrictMode's dev-only synthetic mount->unmount->mount cycle (the style fetch gets
  // aborted on the phantom unmount). This is a widely-documented incompatibility between
  // React 18 StrictMode and mapbox-gl/maplibre-gl; disabling it is the standard fix.
  reactStrictMode: false,
  eslint: {
    ignoreDuringBuilds: false,
  },
};

export default nextConfig;
