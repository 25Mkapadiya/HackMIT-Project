"use client";

import { useEffect, useRef, useState } from "react";
import maplibregl from "maplibre-gl";
import type { FeatureCollection } from "geojson";
import "maplibre-gl/dist/maplibre-gl.css";
import type { LayerDefinition } from "@/lib/types";
import { getState, DEFAULT_STATE_ID } from "@/states/registry";
import { useAppStore } from "@/store/useAppStore";
import { generateCampusFootprint } from "@/lib/spatial/campus";
import { BASEMAP_STYLE, emptyFeatureCollection } from "./mapStyle";
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
      attributionControl: { compact: true },
    });
    map.addControl(new maplibregl.NavigationControl({ visualizePitch: true }), "top-right");
    map.addControl(new maplibregl.ScaleControl({ unit: "imperial", maxWidth: 120 }), "bottom-left");

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
