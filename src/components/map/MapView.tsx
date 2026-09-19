"use client";

import { useEffect, useRef, useState } from "react";
import maplibregl from "maplibre-gl";
import type { FeatureCollection } from "geojson";
import "maplibre-gl/dist/maplibre-gl.css";
import type { LayerDefinition } from "@/lib/types";
import { getState, DEFAULT_STATE_ID } from "@/states/registry";
import { useAppStore } from "@/store/useAppStore";
import { generateCampusFootprint } from "@/lib/spatial/campus";
import { BASEMAP_STYLE, US_MAX_BOUNDS, US_MIN_ZOOM, emptyFeatureCollection } from "./mapStyle";
import { buildLayerSpecs, interactiveLayerIds } from "./layerStyles";
import { buildPopupHtml } from "./popupContent";

function statewideBbox(state: { bounds: [[number, number], [number, number]] }): string {
  return [state.bounds[0][0], state.bounds[0][1], state.bounds[1][0], state.bounds[1][1]].join(",");
}

export default function MapView() {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<maplibregl.Map | null>(null);
  const loadedLayerIds = useRef<Set<string>>(new Set());
  const loadingLayerIds = useRef<Set<string>>(new Set());
  const popupRef = useRef<maplibregl.Popup | null>(null);
  const activeScenarioRef = useRef<{ id: string; label: string; lng: number; lat: number } | null>(null);
  const focusAnimatingRef = useRef(false);
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
    const defaultState = getState(DEFAULT_STATE_ID)!;
    const map = new maplibregl.Map({
      container: containerRef.current,
      style: BASEMAP_STYLE,
      center: defaultState.center,
      zoom: defaultState.defaultZoom,
      pitch: 0,
      maxPitch: 68,
      maxBounds: US_MAX_BOUNDS,
      minZoom: US_MIN_ZOOM,
      renderWorldCopies: false,
      attributionControl: { compact: true },
    });
    const navigationControl = new maplibregl.NavigationControl({ visualizePitch: true });
    map.addControl(navigationControl, "top-right");
    map.addControl(new maplibregl.ScaleControl({ unit: "imperial", maxWidth: 120 }), "bottom-left");

    // Repurpose the existing white compass button as a guided "focus active site"
    // control once a data-center scenario exists. Before that, it keeps its normal
    // north-reset behavior.
    const compassButton = map
      .getContainer()
      .querySelector<HTMLButtonElement>(".maplibregl-ctrl-compass");
    const handleCompassFocus = (event: MouseEvent) => {
      const target = activeScenarioRef.current;
      if (!target || focusAnimatingRef.current) return;
      event.preventDefault();
      event.stopPropagation();
      event.stopImmediatePropagation();
      focusAnimatingRef.current = true;
      spiralFocusOnSite(map, target, () => {
        focusAnimatingRef.current = false;
      });
    };
    compassButton?.addEventListener("click", handleCompassFocus, true);

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
      compassButton?.removeEventListener("click", handleCompassFocus, true);
      map.remove();
      mapRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ---- keep the compass target + accessible label in sync with the active site ----
  useEffect(() => {
    const active = scenarios.find((scenario) => scenario.id === activeScenarioId) ?? null;
    activeScenarioRef.current = active
      ? { id: active.id, label: active.label, lng: active.lng, lat: active.lat }
      : null;

    if (!mapRef.current) return;
    const compassButton = mapRef.current
      .getContainer()
      .querySelector<HTMLButtonElement>(".maplibregl-ctrl-compass");
    if (!compassButton) return;

    if (active) {
      compassButton.title = `Focus on ${active.label}`;
      compassButton.setAttribute("aria-label", `Focus on ${active.label}`);
      compassButton.dataset.focusSite = "true";
    } else {
      compassButton.title = "Reset bearing to north";
      compassButton.setAttribute("aria-label", "Reset bearing to north");
      delete compassButton.dataset.focusSite;
    }
  }, [scenarios, activeScenarioId, mapReady]);

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

  // ---- tear down the previous state's map layers on a state switch ----
  // Layer ids are shared across states for the same concept (e.g.
  // "transmission-lines"), so without this, switching from Washington to
  // Minnesota would just re-show Washington's already-loaded transmission
  // geometry instead of fetching Minnesota's.
  const isFirstLayerReset = useRef(true);
  useEffect(() => {
    if (!mapReady || !mapRef.current) return;
    if (isFirstLayerReset.current) {
      isFirstLayerReset.current = false;
      return;
    }
    const map = mapRef.current;
    for (const layerId of loadedLayerIds.current) {
      for (const suffix of ["-line", "-fill", "-outline", "-point"]) {
        const mlId = `${layerId}${suffix}`;
        if (map.getLayer(mlId)) map.removeLayer(mlId);
      }
      const sourceId = `src-${layerId}`;
      if (map.getSource(sourceId)) map.removeSource(sourceId);
    }
    loadedLayerIds.current.clear();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mapReady, activeStateId]);

  // ---- load/toggle infrastructure layers ----
  useEffect(() => {
    if (!mapReady || !mapRef.current) return;
    const map = mapRef.current;
    const state = getState(activeStateId);
    if (!state) return;
    const bbox = statewideBbox(state);

    async function syncLayers() {
      for (const layer of state!.layers) {
        // Visual raster layers are loaded directly by MapLibre rather than through the GeoJSON API.
        if (layer.geometryType === "raster") continue;
        const wantVisible = Boolean(layerVisibility[layer.id]);
        const sourceId = `src-${layer.id}`;

        if (!loadedLayerIds.current.has(layer.id)) {
          if (!wantVisible) continue;
          if (loadingLayerIds.current.has(layer.id)) continue;
          loadingLayerIds.current.add(layer.id);
          try {
            const res = await fetch(`${layer.endpoint}?bbox=${bbox}`);
            const data = (await res.json()) as FeatureCollection;
            if (!mapRef.current) return;
            if (!map.getSource(sourceId)) {
              map.addSource(sourceId, { type: "geojson", data });
              const specs = buildLayerSpecs(layer, sourceId);
              for (const spec of specs) {
                if (!map.getLayer(spec.id)) map.addLayer(spec);
              }
              attachInteractivity(map, layer, popupRef);
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
  }, [mapReady, layerVisibility, activeStateId]);

  // ---- U.S. visual forest cover ----
  useEffect(() => {
    if (!mapReady || !mapRef.current) return;
    const map = mapRef.current;
    const visible = Boolean(layerVisibility["forest-cover"]);
    const layerId = "forest-cover-vector";

    // Reuse the CARTO basemap's vector land-cover source so forest edges stay
    // crisp and map-like at every zoom instead of looking like a scientific raster.
    if (!map.getLayer(layerId) && map.getSource("carto")) {
      map.addLayer(
        {
          id: layerId,
          type: "fill",
          source: "carto",
          "source-layer": "landcover",
          filter: ["==", "class", "wood"],
          minzoom: 4,
          paint: {
            "fill-color": [
              "interpolate",
              ["linear"],
              ["zoom"],
              4, "#234b31",
              7, "#2f6842",
              10, "#3b7d4e",
              13, "#4a8d59"
            ],
            "fill-opacity": [
              "interpolate",
              ["linear"],
              ["zoom"],
              4, 0.38,
              7, 0.48,
              10, 0.56,
              13, 0.62
            ],
            "fill-antialias": true
          },
          layout: { visibility: visible ? "visible" : "none" },
        },
        "proposed-points-glow"
      );
    } else if (map.getLayer(layerId)) {
      map.setLayoutProperty(layerId, "visibility", visible ? "visible" : "none");
    }
  }, [mapReady, layerVisibility, activeStateId]);

  // ---- U.S.-only terrain / mountains: cached USGS National Map shaded relief ----
  useEffect(() => {
    if (!mapReady || !mapRef.current) return;
    const map = mapRef.current;
    const visible = Boolean(layerVisibility["terrain-hillshade"]);
    const sourceId = "usgs-shaded-relief";
    const layerId = "terrain-relief-raster";

    // Never enable 3D terrain. This stays a flat cartographic relief overlay.
    if (map.getTerrain()) map.setTerrain(null);

    if (!map.getSource(sourceId)) {
      map.addSource(sourceId, {
        type: "raster",
        tiles: [
          "https://basemap.nationalmap.gov/arcgis/rest/services/USGSShadedReliefOnly/MapServer/tile/{z}/{y}/{x}",
        ],
        tileSize: 256,
        minzoom: 4,
        maxzoom: 14,
        bounds: [-179.9, 15, -63, 72],
        attribution: "Shaded relief © USGS The National Map / 3DEP",
      });
    }

    if (!map.getLayer(layerId)) {
      map.addLayer(
        {
          id: layerId,
          type: "raster",
          source: sourceId,
          minzoom: 4,
          maxzoom: 15,
          paint: {
            "raster-opacity": [
              "interpolate",
              ["linear"],
              ["zoom"],
              4, 0.15,
              7, 0.20,
              10, 0.24,
              13, 0.20
            ],
            "raster-resampling": "linear",
            "raster-fade-duration": 0,
            "raster-saturation": -1,
            "raster-contrast": 0.02,
            "raster-brightness-min": 0.20,
            "raster-brightness-max": 0.86,
          },
          layout: { visibility: visible ? "visible" : "none" },
        },
        "proposed-points-glow"
      );
    } else {
      map.setLayoutProperty(layerId, "visibility", visible ? "visible" : "none");
    }
  }, [mapReady, layerVisibility, activeStateId]);

  // ---- sync proposed scenarios (points + 3D campus) ----
  // Only the active state's own scenarios are drawn — a site proposed in
  // Washington shouldn't appear pinned on Minnesota's map after switching.
  useEffect(() => {
    if (!mapReady || !mapRef.current) return;
    const map = mapRef.current;
    const visibleScenarios = scenarios.filter((s) => s.stateId === activeStateId);

    const pointsFc: FeatureCollection = {
      type: "FeatureCollection",
      features: visibleScenarios.map((s) => ({
        type: "Feature",
        geometry: { type: "Point", coordinates: [s.lng, s.lat] },
        properties: { label: s.label, id: s.id, active: s.id === activeScenarioId },
      })),
    };
    const campusFc: FeatureCollection = {
      type: "FeatureCollection",
      features: visibleScenarios.flatMap((s) => generateCampusFootprint(s).features),
    };

    const pointsSource = map.getSource("proposed-points") as maplibregl.GeoJSONSource | undefined;
    pointsSource?.setData(pointsFc);
    const campusSource = map.getSource("campus-buildings") as maplibregl.GeoJSONSource | undefined;
    campusSource?.setData(campusFc);
  }, [mapReady, scenarios, activeScenarioId, activeStateId]);

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


function spiralFocusOnSite(
  map: maplibregl.Map,
  site: { lng: number; lat: number },
  onDone: () => void
) {
  const interactionHandlers = [
    map.dragPan,
    map.scrollZoom,
    map.boxZoom,
    map.dragRotate,
    map.keyboard,
    map.doubleClickZoom,
    map.touchZoomRotate,
  ];
  const previouslyEnabled = interactionHandlers.map((handler) => handler.isEnabled());

  for (const handler of interactionHandlers) handler.disable();
  map.stop();

  const startBearing = map.getBearing();
  const currentZoom = map.getZoom();
  const firstZoom = Math.max(10.8, Math.min(13.2, currentZoom + 2.4));
  const finalZoom = Math.max(15.2, Math.min(16.4, firstZoom + 3.1));

  const restoreInteraction = () => {
    interactionHandlers.forEach((handler, index) => {
      if (previouslyEnabled[index]) handler.enable();
    });
    onDone();
  };

  const secondPhase = () => {
    map.easeTo({
      center: [site.lng, site.lat],
      zoom: finalZoom,
      bearing: startBearing + 320,
      pitch: 52,
      duration: 1250,
      offset: [0, 36],
      easing: (t) => 1 - Math.pow(1 - t, 3),
      essential: true,
    });
    map.once("moveend", restoreInteraction);
  };

  map.easeTo({
    center: [site.lng, site.lat],
    zoom: firstZoom,
    bearing: startBearing + 155,
    pitch: 30,
    duration: 950,
    offset: [0, 18],
    easing: (t) => t * t * (3 - 2 * t),
    essential: true,
  });
  map.once("moveend", secondPhase);
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
  layer: LayerDefinition,
  popupRef: React.MutableRefObject<maplibregl.Popup | null>
) {
  for (const mlLayerId of interactiveLayerIds(layer)) {
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
        .setHTML(buildPopupHtml(layer.id, feature.properties ?? {}))
        .addTo(map);
    });
  }
}
