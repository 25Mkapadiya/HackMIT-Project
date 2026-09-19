"use client";

import { useEffect, useRef, useState } from "react";
import maplibregl from "maplibre-gl";
import type { FeatureCollection, MultiPolygon, Polygon } from "geojson";
import { booleanPointInPolygon, point } from "@turf/turf";
import "maplibre-gl/dist/maplibre-gl.css";
import { WASHINGTON } from "@/states/washington";
import { getState, getEnabledStates, DEFAULT_STATE_ID } from "@/states/registry";
import { useAppStore } from "@/store/useAppStore";
import { generateCampusFootprint } from "@/lib/spatial/campus";
import type { LayerDefinition } from "@/lib/types";
import { BASEMAP_STYLE, US_MAX_BOUNDS, US_MIN_ZOOM, emptyFeatureCollection } from "./mapStyle";
import { buildLayerSpecs, interactiveLayerIds } from "./layerStyles";
import { buildPopupHtml } from "./popupContent";

function stateBboxParam(stateId: string): string {
  const state = getState(stateId) ?? getState(DEFAULT_STATE_ID)!;
  return [state.bounds[0][0], state.bounds[0][1], state.bounds[1][0], state.bounds[1][1]].join(",");
}

function implementedStatesBounds(): [[number, number], [number, number]] {
  const states = getEnabledStates();
  if (states.length === 0) return getState(DEFAULT_STATE_ID)!.bounds;
  return [
    [
      Math.min(...states.map((state) => state.bounds[0][0])),
      Math.min(...states.map((state) => state.bounds[0][1])),
    ],
    [
      Math.max(...states.map((state) => state.bounds[1][0])),
      Math.max(...states.map((state) => state.bounds[1][1])),
    ],
  ];
}

export default function MapView() {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<maplibregl.Map | null>(null);
  const loadedLayerIds = useRef<Set<string>>(new Set());
  const loadingLayerIds = useRef<Set<string>>(new Set());
  // Layer ids (e.g. "transmission-lines") are stable across states even though
  // the underlying source is swapped out on state switch (see the teardown
  // logic below) — click/hover handlers are bound to that stable layer id
  // string, so they only need registering once, ever, per layer id.
  const interactivityAttached = useRef<Set<string>>(new Set());
  const popupRef = useRef<maplibregl.Popup | null>(null);
  const usBoundaryRef = useRef<FeatureCollection<Polygon | MultiPolygon> | null>(null);
  const activeScenarioRef = useRef<{ id: string; label: string; lng: number; lat: number } | null>(null);
  const focusedScenarioIdRef = useRef<string | null>(null);
  const focusAnimatingRef = useRef(false);
  const [mapReady, setMapReady] = useState(false);

  const layerVisibility = useAppStore((s) => s.layerVisibility);
  const proposeMode = useAppStore((s) => s.proposeMode);
  const scenarios = useAppStore((s) => s.scenarios);
  const activeScenarioId = useAppStore((s) => s.activeScenarioId);
  const activeStateId = useAppStore((s) => s.activeStateId);
  const showAllStates = useAppStore((s) => s.showAllStates);
  const addScenario = useAppStore((s) => s.addScenario);
  const setActiveScenario = useAppStore((s) => s.setActiveScenario);
  // Declared after activeStateId (used before its own declaration otherwise —
  // useRef's initializer runs during render, so this must come after the hook
  // that produces the value it seeds).
  const activeStateIdRef = useRef(activeStateId);
  const showAllStatesRef = useRef(showAllStates);

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

      if (focusedScenarioIdRef.current === target.id) {
        const state = getState(activeStateIdRef.current) ?? getState(DEFAULT_STATE_ID)!;
        const returnBounds = showAllStatesRef.current ? implementedStatesBounds() : state.bounds;
        spiralZoomOutToState(map, returnBounds, () => {
          focusedScenarioIdRef.current = null;
          focusAnimatingRef.current = false;
          syncCompassLabel(map, target, false);
        });
      } else {
        spiralFocusOnSite(map, target, () => {
          focusedScenarioIdRef.current = target.id;
          focusAnimatingRef.current = false;
          syncCompassLabel(map, target, true);
        });
      }
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
    activeStateIdRef.current = activeStateId;
    showAllStatesRef.current = showAllStates;
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
      if (focusedScenarioIdRef.current !== active.id) {
        focusedScenarioIdRef.current = null;
      }
      syncCompassLabel(mapRef.current, active, focusedScenarioIdRef.current === active.id);
    } else {
      compassButton.title = "Reset bearing to north";
      compassButton.setAttribute("aria-label", "Reset bearing to north");
      delete compassButton.dataset.focusSite;
    }
  }, [scenarios, activeScenarioId, activeStateId, showAllStates, mapReady]);

  // ---- load authoritative U.S. state boundaries used to validate proposed sites ----
  useEffect(() => {
    if (!mapReady) return;
    let cancelled = false;

    fetch("/api/us-boundary")
      .then((res) => {
        if (!res.ok) throw new Error(`U.S. boundary request failed (${res.status})`);
        return res.json() as Promise<FeatureCollection<Polygon | MultiPolygon>>;
      })
      .then((data) => {
        if (!cancelled) usBoundaryRef.current = data;
      })
      .catch((err) => {
        console.error("Failed to load U.S. placement boundary", err);
      });

    return () => {
      cancelled = true;
    };
  }, [mapReady]);

  // ---- propose-mode cursor + click handling ----
  useEffect(() => {
    if (!mapReady || !mapRef.current) return;
    const map = mapRef.current;
    const canvas = map.getCanvas();
    canvas.style.cursor = proposeMode ? "crosshair" : "";

    if (!proposeMode) return;
    const handleClick = (e: maplibregl.MapMouseEvent) => {
      const boundary = usBoundaryRef.current;
      const clickedPoint = point([e.lngLat.lng, e.lngLat.lat]);
      const insideUnitedStates =
        boundary?.features.some((feature) => booleanPointInPolygon(clickedPoint, feature)) ?? false;

      if (!insideUnitedStates) {
        popupRef.current?.remove();
        popupRef.current = new maplibregl.Popup({ closeButton: true, maxWidth: "280px" })
          .setLngLat(e.lngLat)
          .setHTML(
            boundary
              ? "<strong>U.S. locations only</strong><br/>Data centers can only be placed within a U.S. state."
              : "<strong>Placement boundary loading</strong><br/>Please try again in a moment."
          )
          .addTo(map);
        return;
      }

      let targetStateId = activeStateId;

      if (showAllStates) {
        const matchingFeature = boundary?.features.find((feature) =>
          booleanPointInPolygon(clickedPoint, feature)
        );
        const postal = matchingFeature?.properties?.postal as string | undefined;
        const targetState = postal
          ? getEnabledStates().find((state) => state.abbreviation === postal)
          : undefined;

        if (!targetState) {
          popupRef.current?.remove();
          popupRef.current = new maplibregl.Popup({ closeButton: true, maxWidth: "300px" })
            .setLngLat(e.lngLat)
            .setHTML(
              "<strong>State not implemented yet</strong><br/>Choose a location inside one of the states currently included in Show All."
            )
            .addTo(map);
          return;
        }

        targetStateId = targetState.id;
      }

      addScenario(e.lngLat.lng, e.lngLat.lat, targetStateId);
    };
    map.on("click", handleClick);
    return () => {
      map.off("click", handleClick);
    };
  }, [mapReady, proposeMode, addScenario, activeStateId, showAllStates]);

  // ---- state / all-implemented-states camera ----
  const lastCameraTargetRef = useRef(`state:${activeStateId}`);
  useEffect(() => {
    if (!mapReady || !mapRef.current) return;
    const cameraTarget = showAllStates ? "all-implemented" : `state:${activeStateId}`;
    if (cameraTarget === lastCameraTargetRef.current) return;

    if (showAllStates) {
      mapRef.current.fitBounds(implementedStatesBounds(), { padding: 72, duration: 1200 });
    } else {
      const state = getState(activeStateId);
      if (state) mapRef.current.fitBounds(state.bounds, { padding: 60, duration: 1200 });
    }
    lastCameraTargetRef.current = cameraTarget;
  }, [mapReady, activeStateId, showAllStates]);

  // ---- load/toggle infrastructure layers ----
  // Every source + rendered MapLibre layer is state-prefixed, so "Show All" can
  // display the same logical layer (e.g. transmission-lines) for many states
  // simultaneously without id collisions.
  const lastSyncedViewKey = useRef("");
  useEffect(() => {
    if (!mapReady || !mapRef.current) return;
    const map = mapRef.current;
    const states = showAllStates
      ? getEnabledStates()
      : [getState(activeStateId) ?? getState(DEFAULT_STATE_ID)!];
    const wantedStateIds = new Set(states.map((state) => state.id));
    const viewKey = showAllStates
      ? `all:${states.map((state) => state.id).sort().join(",")}`
      : `state:${activeStateId}`;
    lastSyncedViewKey.current = viewKey;

    // Remove data belonging to states that are no longer part of this view.
    for (const key of Array.from(loadedLayerIds.current)) {
      const [stateId, layerId] = key.split(":");
      if (!stateId || !layerId || wantedStateIds.has(stateId)) continue;
      const previousState = getState(stateId);
      const previousLayer = previousState?.layers.find((layer) => layer.id === layerId);
      const sourceId = `src-${stateId}-${layerId}`;
      if (previousLayer) {
        for (const spec of buildLayerSpecs(previousLayer, sourceId, stateId)) {
          if (map.getLayer(spec.id)) map.removeLayer(spec.id);
        }
      }
      if (map.getSource(sourceId)) map.removeSource(sourceId);
      loadedLayerIds.current.delete(key);
      loadingLayerIds.current.delete(key);
    }

    async function syncLayers() {
      const tasks: Array<() => Promise<void>> = [];

      for (const state of states) {
        const bboxParam = stateBboxParam(state.id);
        for (const layer of state.layers) {
          if (layer.geometryType === "raster") continue;

          const key = `${state.id}:${layer.id}`;
          const wantVisible = Boolean(layerVisibility[layer.id]);
          const sourceId = `src-${state.id}-${layer.id}`;

          if (loadedLayerIds.current.has(key)) {
            const specs = buildLayerSpecs(layer, sourceId, state.id);
            for (const spec of specs) {
              if (map.getLayer(spec.id)) {
                map.setLayoutProperty(spec.id, "visibility", wantVisible ? "visible" : "none");
              }
            }
            continue;
          }

          if (!wantVisible || loadingLayerIds.current.has(key)) continue;

          tasks.push(async () => {
            loadingLayerIds.current.add(key);
            try {
              const res = await fetch(`${layer.endpoint}?bbox=${bboxParam}&state=${state.id}`);
              const data = (await res.json()) as FeatureCollection;
              if (!mapRef.current || lastSyncedViewKey.current !== viewKey) return;

              if (!map.getSource(sourceId)) {
                map.addSource(sourceId, { type: "geojson", data });
                const specs = buildLayerSpecs(layer, sourceId, state.id);
                for (const spec of specs) {
                  if (!map.getLayer(spec.id)) map.addLayer(spec);
                }

                const interactionKey = `${state.id}:${layer.id}`;
                if (!interactivityAttached.current.has(interactionKey)) {
                  attachInteractivity(map, layer, popupRef, state.id);
                  interactivityAttached.current.add(interactionKey);
                }
              }

              loadedLayerIds.current.add(key);
            } catch (err) {
              console.error(`Failed to load ${state.name} layer ${layer.id}`, err);
            } finally {
              loadingLayerIds.current.delete(key);
            }
          });
        }
      }

      // Avoid a state-by-state waterfall while still limiting pressure on public GIS APIs.
      const workerCount = Math.min(showAllStates ? 6 : 4, tasks.length);
      let nextTask = 0;
      const workers = Array.from({ length: workerCount }, async () => {
        while (nextTask < tasks.length) {
          const task = tasks[nextTask++];
          if (task) await task();
        }
      });
      await Promise.all(workers);
    }

    syncLayers();
  }, [mapReady, activeStateId, showAllStates, layerVisibility]);

  // ---- U.S. visual forest cover ----
  useEffect(() => {
    if (!mapReady || !mapRef.current) return;
    const map = mapRef.current;
    const visible = Boolean(layerVisibility["forest-cover"]);
    const layerId = "forest-cover-vector";

    // Reuse the CARTO basemap's vector land-cover source so forest edges stay
    // crisp and map-like at every zoom instead of looking like a scientific raster.
    // Nationwide — the same layer works unmodified for every state.
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
  }, [mapReady, layerVisibility]);

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

function syncCompassLabel(
  map: maplibregl.Map,
  site: { label: string },
  focused: boolean
) {
  const compassButton = map
    .getContainer()
    .querySelector<HTMLButtonElement>(".maplibregl-ctrl-compass");
  if (!compassButton) return;

  const label = focused ? `Return to state view from ${site.label}` : `Focus on ${site.label}`;
  compassButton.title = label;
  compassButton.setAttribute("aria-label", label);
  compassButton.dataset.focusSite = focused ? "zoomed-in" : "ready";
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


function spiralZoomOutToState(
  map: maplibregl.Map,
  bounds: [[number, number], [number, number]],
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

  const restoreInteraction = () => {
    interactionHandlers.forEach((handler, index) => {
      if (previouslyEnabled[index]) handler.enable();
    });
    onDone();
  };

  const centerLng = (bounds[0][0] + bounds[1][0]) / 2;
  const centerLat = (bounds[0][1] + bounds[1][1]) / 2;

  map.easeTo({
    center: [centerLng, centerLat],
    zoom: Math.max(map.getMinZoom(), 8.5),
    bearing: map.getBearing() + 150,
    pitch: 24,
    duration: 800,
    easing: (t) => t * t * (3 - 2 * t),
    essential: true,
  });

  map.once("moveend", () => {
    map.fitBounds(bounds, {
      padding: 60,
      bearing: 0,
      pitch: 0,
      duration: 1050,
      easing: (t) => 1 - Math.pow(1 - t, 3),
      essential: true,
    });
    map.once("moveend", restoreInteraction);
  });
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
  popupRef: React.MutableRefObject<maplibregl.Popup | null>,
  idPrefix = ""
) {
  for (const mlLayerId of interactiveLayerIds(layer, idPrefix)) {
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
