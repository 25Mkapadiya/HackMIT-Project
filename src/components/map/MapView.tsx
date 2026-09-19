"use client";

import { useEffect, useRef, useState } from "react";
import maplibregl from "maplibre-gl";
import type { FeatureCollection } from "geojson";
import "maplibre-gl/dist/maplibre-gl.css";
import { WASHINGTON } from "@/states/washington";
import { getWaLayer } from "@/states/washington/layers";
import { getState } from "@/states/registry";
import { useAppStore } from "@/store/useAppStore";
import { generateCampusFootprint } from "@/lib/spatial/campus";
import { BASEMAP_STYLE, US_MAX_BOUNDS, US_MIN_ZOOM, emptyFeatureCollection } from "./mapStyle";
import { buildLayerSpecs, interactiveLayerIds } from "./layerStyles";
import { buildPopupHtml } from "./popupContent";

const STATEWIDE_BBOX = [
  WASHINGTON.bounds[0][0],
  WASHINGTON.bounds[0][1],
  WASHINGTON.bounds[1][0],
  WASHINGTON.bounds[1][1],
].join(",");

export default function MapView() {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<maplibregl.Map | null>(null);
  const loadedLayerIds = useRef<Set<string>>(new Set());
  const loadingLayerIds = useRef<Set<string>>(new Set());
  const popupRef = useRef<maplibregl.Popup | null>(null);
  const [mapReady, setMapReady] = useState(false);

  const layerVisibility = useAppStore((s) => s.layerVisibility);
  const proposeMode = useAppStore((s) => s.proposeMode);
  const scenarios = useAppStore((s) => s.scenarios);
  const activeScenarioId = useAppStore((s) => s.activeScenarioId);
  const activeStateId = useAppStore((s) => s.activeStateId);
  const addScenario = useAppStore((s) => s.addScenario);
  const setActiveScenario = useAppStore((s) => s.setActiveScenario);

  // ---- init map (once) ----
  useEffect(() => {
    if (!containerRef.current || mapRef.current) return;
    const map = new maplibregl.Map({
      container: containerRef.current,
      style: BASEMAP_STYLE,
      center: WASHINGTON.center,
      zoom: WASHINGTON.defaultZoom,
      pitch: 0,
      maxPitch: 68,
      maxBounds: US_MAX_BOUNDS,
      minZoom: US_MIN_ZOOM,
      renderWorldCopies: false,
      attributionControl: { compact: true },
    });
    map.addControl(new maplibregl.NavigationControl({ visualizePitch: true }), "top-right");
    map.addControl(new maplibregl.ScaleControl({ unit: "imperial", maxWidth: 120 }), "bottom-left");

    fitMinZoomToBounds(map);
    map.on("resize", () => fitMinZoomToBounds(map));

    map.on("load", () => {
      map.addSource("proposed-points", { type: "geojson", data: emptyFeatureCollection() });
      map.addLayer({
        id: "proposed-points-glow",
        type: "circle",
        source: "proposed-points",
        paint: {
          "circle-radius": 16,
          "circle-color": "#ff5470",
          "circle-opacity": 0.16,
          "circle-blur": 0.4,
        },
      });
      map.addLayer({
        id: "proposed-points-core",
        type: "circle",
        source: "proposed-points",
        paint: {
          "circle-radius": ["case", ["==", ["get", "active"], true], 7, 5.5],
          "circle-color": "#ff5470",
          "circle-stroke-width": 2,
          "circle-stroke-color": "#ffffff",
        },
      });
      map.addLayer({
        id: "proposed-points-label",
        type: "symbol",
        source: "proposed-points",
        layout: {
          "text-field": ["get", "label"],
          "text-offset": [0, -1.7],
          "text-size": 12,
          "text-font": ["Open Sans Bold", "Arial Unicode MS Bold"],
          "text-allow-overlap": true,
        },
        paint: {
          "text-color": "#ff8fa3",
          "text-halo-color": "#0a0d12",
          "text-halo-width": 1.6,
        },
      });

      map.addSource("campus-buildings", { type: "geojson", data: emptyFeatureCollection() });
      map.addLayer({
        id: "campus-extrusion",
        type: "fill-extrusion",
        source: "campus-buildings",
        paint: {
          "fill-extrusion-color": "#ff5470",
          "fill-extrusion-height": ["coalesce", ["get", "heightM"], 15],
          "fill-extrusion-base": 0,
          "fill-extrusion-opacity": 0.88,
        },
      });

      setMapReady(true);
    });

    mapRef.current = map;
    return () => {
      map.remove();
      mapRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ---- propose-mode cursor + click handling ----
  useEffect(() => {
    if (!mapReady || !mapRef.current) return;
    const map = mapRef.current;
    const canvas = map.getCanvas();
    canvas.style.cursor = proposeMode ? "crosshair" : "";

    if (!proposeMode) return;
    const handleClick = (e: maplibregl.MapMouseEvent) => {
      addScenario(e.lngLat.lng, e.lngLat.lat);
    };
    map.on("click", handleClick);
    return () => {
      map.off("click", handleClick);
    };
  }, [mapReady, proposeMode, addScenario]);

  // ---- fly to the picked state's real bounds (state picker in TopBar) ----
  const isFirstStateSync = useRef(true);
  useEffect(() => {
    if (!mapReady || !mapRef.current) return;
    if (isFirstStateSync.current) {
      // Skip the initial mount — the map already opens on Washington's bounds.
      isFirstStateSync.current = false;
      return;
    }
    const state = getState(activeStateId);
    if (!state) return;
    mapRef.current.fitBounds(state.bounds, { padding: 60, duration: 1200 });
  }, [mapReady, activeStateId]);

  // ---- load/toggle infrastructure layers ----
  useEffect(() => {
    if (!mapReady || !mapRef.current) return;
    const map = mapRef.current;

    async function syncLayers() {
      for (const layer of WASHINGTON.layers) {
        // Terrain uses a raster-dem source loaded directly by MapLibre, not the GeoJSON API.
        if (layer.id === "terrain-hillshade") continue;
        const wantVisible = Boolean(layerVisibility[layer.id]);
        const sourceId = `src-${layer.id}`;

        if (!loadedLayerIds.current.has(layer.id)) {
          if (!wantVisible) continue;
          if (loadingLayerIds.current.has(layer.id)) continue;
          loadingLayerIds.current.add(layer.id);
          try {
            const res = await fetch(`${layer.endpoint}?bbox=${STATEWIDE_BBOX}`);
            const data = (await res.json()) as FeatureCollection;
            if (!mapRef.current) return;
            if (!map.getSource(sourceId)) {
              map.addSource(sourceId, { type: "geojson", data });
              const specs = buildLayerSpecs(layer, sourceId);
              for (const spec of specs) {
                if (!map.getLayer(spec.id)) map.addLayer(spec);
              }
              attachInteractivity(map, layer.id, popupRef);
            }
            loadedLayerIds.current.add(layer.id);
          } catch (err) {
            console.error(`Failed to load layer ${layer.id}`, err);
          } finally {
            loadingLayerIds.current.delete(layer.id);
          }
        } else {
          const specs = buildLayerSpecs(layer, sourceId);
          for (const spec of specs) {
            if (map.getLayer(spec.id)) {
              map.setLayoutProperty(spec.id, "visibility", wantVisible ? "visible" : "none");
            }
          }
        }
      }
    }

    syncLayers();
  }, [mapReady, layerVisibility]);

  // ---- terrain / mountains (public Mapzen Terrain Tiles on AWS) ----
  useEffect(() => {
    if (!mapReady || !mapRef.current) return;
    const map = mapRef.current;
    const visible = Boolean(layerVisibility["terrain-hillshade"]);
    const sourceId = "terrain-dem";
    const hillshadeId = "terrain-hillshade-map";

    if (!map.getSource(sourceId)) {
      map.addSource(sourceId, {
        type: "raster-dem",
        tiles: ["https://s3.amazonaws.com/elevation-tiles-prod/terrarium/{z}/{x}/{y}.png"],
        tileSize: 256,
        maxzoom: 15,
        encoding: "terrarium",
        attribution: "Terrain Tiles © Mapzen / Tilezen contributors",
      });
    }

    if (!map.getLayer(hillshadeId)) {
      map.addLayer(
        {
          id: hillshadeId,
          type: "hillshade",
          source: sourceId,
          paint: {
            "hillshade-exaggeration": 0.5,
            "hillshade-shadow-color": "#10151b",
            "hillshade-highlight-color": "#d8d1c2",
            "hillshade-accent-color": "#7b7469",
          },
          layout: { visibility: visible ? "visible" : "none" },
        },
        "proposed-points-glow"
      );
    } else {
      map.setLayoutProperty(hillshadeId, "visibility", visible ? "visible" : "none");
    }

    if (visible) {
      map.setTerrain({ source: sourceId, exaggeration: 1.15 });
    } else if (map.getTerrain()) {
      map.setTerrain(null);
    }
  }, [mapReady, layerVisibility]);

  // ---- sync proposed scenarios (points + 3D campus) ----
  useEffect(() => {
    if (!mapReady || !mapRef.current) return;
    const map = mapRef.current;

    const pointsFc: FeatureCollection = {
      type: "FeatureCollection",
      features: scenarios.map((s) => ({
        type: "Feature",
        geometry: { type: "Point", coordinates: [s.lng, s.lat] },
        properties: { label: s.label, id: s.id, active: s.id === activeScenarioId },
      })),
    };
    const campusFc: FeatureCollection = {
      type: "FeatureCollection",
      features: scenarios.flatMap((s) => generateCampusFootprint(s).features),
    };

    const pointsSource = map.getSource("proposed-points") as maplibregl.GeoJSONSource | undefined;
    pointsSource?.setData(pointsFc);
    const campusSource = map.getSource("campus-buildings") as maplibregl.GeoJSONSource | undefined;
    campusSource?.setData(campusFc);
  }, [mapReady, scenarios, activeScenarioId]);

  // ---- click a proposed site marker to select it ----
  useEffect(() => {
    if (!mapReady || !mapRef.current) return;
    const map = mapRef.current;
    const handler = (e: maplibregl.MapLayerMouseEvent) => {
      const id = e.features?.[0]?.properties?.id as string | undefined;
      if (id) setActiveScenario(id);
    };
    map.on("click", "proposed-points-core", handler);
    map.on("mouseenter", "proposed-points-core", () => (map.getCanvas().style.cursor = "pointer"));
    map.on("mouseleave", "proposed-points-core", () => (map.getCanvas().style.cursor = proposeMode ? "crosshair" : ""));
    return () => {
      map.off("click", "proposed-points-core", handler);
    };
  }, [mapReady, setActiveScenario, proposeMode]);

  // Inline style (not a Tailwind class) is required here: maplibre-gl.css ships its own
  // `.maplibregl-map { position: relative }` rule which otherwise wins the cascade over
  // the `absolute` utility class and collapses this container to zero height.
  return <div ref={containerRef} style={{ position: "absolute", inset: 0 }} />;
}

// A fixed minZoom that "roughly" fits US_MAX_BOUNDS only works for one window width — on a
// wider viewport (or with the sidebar taking less room) the box ends up smaller than the
// screen, and maxBounds' pan clamp can't stop you zooming out past that, leaving the map
// floating in blank space. Recomputing the floor from the actual container size keeps the
// box flush with the viewport at any window size.
//
// map.cameraForBounds()/fitBounds() intentionally compute a "contain" fit (the whole box
// stays fully visible, so the *less* constraining axis is left with blank margin) — that's
// backwards for a pan/zoom floor, which needs a "cover" fit (the box fills the viewport, so
// the *more* constraining axis wins). MapLibre has no built-in "cover" helper, so this does
// the Web Mercator math directly: the zoom needed to make each axis exactly fill the
// container, then takes the larger (more-zoomed-in) of the two.
function mercatorYFraction(lat: number) {
  const rad = (lat * Math.PI) / 180;
  return (1 - Math.log(Math.tan(Math.PI / 4 + rad / 2)) / Math.PI) / 2;
}

const MAPLIBRE_TILE_SIZE = 512;

function coverZoomForBounds(
  bounds: [[number, number], [number, number]],
  width: number,
  height: number
) {
  const lngFraction = Math.abs(bounds[1][0] - bounds[0][0]) / 360;
  const latFraction = Math.abs(mercatorYFraction(bounds[1][1]) - mercatorYFraction(bounds[0][1]));
  const zoomForWidth = Math.log2(width / (MAPLIBRE_TILE_SIZE * lngFraction));
  const zoomForHeight = Math.log2(height / (MAPLIBRE_TILE_SIZE * latFraction));
  return Math.max(zoomForWidth, zoomForHeight);
}

function fitMinZoomToBounds(map: maplibregl.Map) {
  const { width, height } = map.getContainer().getBoundingClientRect();
  if (width < 1 || height < 1) return;
  const zoom = coverZoomForBounds(US_MAX_BOUNDS, width, height);
  map.setMinZoom(Math.max(zoom, US_MIN_ZOOM));
}

function attachInteractivity(
  map: maplibregl.Map,
  layerId: string,
  popupRef: React.MutableRefObject<maplibregl.Popup | null>
) {
  for (const mlLayerId of interactiveLayerIds(getWaLayer(layerId)!)) {
    map.on("mouseenter", mlLayerId, () => {
      map.getCanvas().style.cursor = "pointer";
    });
    map.on("mouseleave", mlLayerId, () => {
      map.getCanvas().style.cursor = "";
    });
    map.on("click", mlLayerId, (e) => {
      const feature = e.features?.[0];
      if (!feature) return;
      popupRef.current?.remove();
      popupRef.current = new maplibregl.Popup({ closeButton: true, maxWidth: "280px" })
        .setLngLat(e.lngLat)
        .setHTML(buildPopupHtml(layerId, feature.properties ?? {}))
        .addTo(map);
    });
  }
}
