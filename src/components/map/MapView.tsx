"use client";

import { useEffect, useRef, useState } from "react";
import maplibregl from "maplibre-gl";
import type { FeatureCollection, MultiPolygon, Polygon } from "geojson";
import { booleanPointInPolygon, point } from "@turf/turf";
import "maplibre-gl/dist/maplibre-gl.css";
import { WASHINGTON } from "@/states/washington";
import { getState, getEnabledStates, getShowAllStates, DEFAULT_STATE_ID } from "@/states/registry";
import { useAppStore } from "@/store/useAppStore";
import { generateCampusFootprint } from "@/lib/spatial/campus";
import type { LayerDefinition } from "@/lib/types";
import { TRANSMISSION_PROXIMITY_BANDS } from "@/lib/constants/assumptions";
import {
  BASEMAP_STYLE,
  US_MAINLAND_VIEW_BOUNDS,
  US_MAX_BOUNDS,
  US_MIN_ZOOM,
  emptyFeatureCollection,
} from "./mapStyle";
import { buildLayerSpecs, interactiveLayerIds } from "./layerStyles";
import { buildPopupHtml, buildNoisePopupHtml } from "./popupContent";

function stateBboxParam(stateId: string): string {
  const state = getState(stateId) ?? getState(DEFAULT_STATE_ID)!;
  return [state.bounds[0][0], state.bounds[0][1], state.bounds[1][0], state.bounds[1][1]].join(",");
}

// getShowAllStates() already excludes Alaska and Hawaii (see registry.ts), so
// this bbox stays mainland-only and the Show All camera centers correctly.
function implementedStatesBounds(): [[number, number], [number, number]] {
  const states = getShowAllStates();
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

// ---- Show All "spreading out from Washington" reveal ----
// The whole timeline is bounded (REVEAL_SPAN_MS) no matter how many states are
// live, so adding states never makes the animation feel slower or jankier.
// Layers fade in via a GPU-composited paint-opacity transition (no rAF loop
// per state, no re-render, no geometry work) — cheap enough to run on every
// live state at once without dropping frames.
const REVEAL_SPAN_MS = 2000;
const LAYER_FADE_MS = 500;
const RIPPLE_DURATION_MS = 1500;
const RIPPLE_MAX_RADIUS_PX = 240;
const EASE_OUT_CUBIC = (t: number) => 1 - Math.pow(1 - t, 3);
// Distance -> delay uses smoothstep, not ease-out. maxDistance spans the
// contiguous U.S. (roughly Maine/Florida from Washington) — an ease-out
// curve's steep initial slope meant even Oregon/California sat
// through 450ms-1.3s of pure artificial delay before appearing at all, which
// read as "nothing is happening" rather than a spread. Smoothstep has zero
// slope at both ends: nearby states still start appearing almost immediately
// (faster than linear would give them), the sweep visibly and continuously
// crosses the country over the full span, and it eases to a gentle stop on
// the last few far-flung states instead of a hard cutoff.
const SMOOTHSTEP = (t: number) => t * t * (3 - 2 * t);

/** Flat-earth approximation (with a longitude/cos(lat) correction) — plenty accurate for ordering/timing a reveal, not for real distance. */
function approxDistanceDeg(a: readonly [number, number], b: readonly [number, number]): number {
  const midLatRad = (((a[1] + b[1]) / 2) * Math.PI) / 180;
  const dx = (a[0] - b[0]) * Math.cos(midLatRad);
  const dy = a[1] - b[1];
  return Math.sqrt(dx * dx + dy * dy);
}

function opacityPaintProp(specType: string): string | null {
  switch (specType) {
    case "line":
      return "line-opacity";
    case "fill":
      return "fill-opacity";
    case "circle":
      return "circle-opacity";
    default:
      return null;
  }
}

/** Fades a layer's opacity from 0 up to its designed value over LAYER_FADE_MS. Purely GPU paint-property work. */
function fadeInLayer(map: maplibregl.Map, layerId: string, opacityProp: string, targetOpacity: number) {
  if (!map.getLayer(layerId)) return;
  map.setPaintProperty(layerId, opacityProp, 0);
  // Split into two ticks so the browser commits opacity:0 before the transition
  // is armed — setting both in the same tick can make MapLibre skip the tween.
  requestAnimationFrame(() => {
    if (!map.getLayer(layerId)) return;
    map.setPaintProperty(layerId, `${opacityProp}-transition`, { duration: LAYER_FADE_MS });
    map.setPaintProperty(layerId, opacityProp, targetOpacity);
  });
}

/** Shows (or hides) every layer for one state. "fade" is used only for the initial Show All reveal wave. */
function applyStateLayerVisibility(
  map: maplibregl.Map,
  state: { id: string; layers: LayerDefinition[] },
  layerVisibility: Record<string, boolean>,
  mode: "instant" | "fade"
) {
  for (const layer of state.layers) {
    if (layer.geometryType === "raster") continue;
    const sourceId = `src-${state.id}-${layer.id}`;
    const shouldShow = Boolean(layerVisibility[layer.id]);
    for (const spec of buildLayerSpecs(layer, sourceId, state.id)) {
      if (!map.getLayer(spec.id)) continue;
      if (!shouldShow) {
        map.setLayoutProperty(spec.id, "visibility", "none");
        continue;
      }
      map.setLayoutProperty(spec.id, "visibility", "visible");
      const prop = opacityPaintProp(spec.type);
      if (!prop) continue;
      const targetOpacity = (spec.paint as Record<string, unknown> | undefined)?.[prop];
      const target = typeof targetOpacity === "number" ? targetOpacity : 1;
      if (mode === "instant") {
        map.setPaintProperty(spec.id, prop, target);
      } else {
        fadeInLayer(map, spec.id, prop, target);
      }
    }
  }
}

/** One decorative ring that expands outward from Washington and fades as it grows — the visual cue that infrastructure is "spreading out" as Show All reveals states radially. */
function playRippleFromWashington(map: maplibregl.Map, origin: [number, number], runRef: { current: number }) {
  const source = map.getSource("showall-ripple") as maplibregl.GeoJSONSource | undefined;
  if (!source) return;
  const runId = ++runRef.current;

  source.setData({
    type: "FeatureCollection",
    features: [{ type: "Feature", geometry: { type: "Point", coordinates: origin }, properties: {} }],
  });
  if (map.getLayer("showall-ripple-ring")) {
    map.setLayoutProperty("showall-ripple-ring", "visibility", "visible");
  }

  const start = performance.now();
  function frame(now: number) {
    if (runRef.current !== runId || !map.getLayer("showall-ripple-ring")) return;
    // Clamp to [0, 1] — a rAF timestamp can land fractionally before `start`
    // (they aren't guaranteed to share the exact same tick), which would
    // otherwise drive `eased` negative and make MapLibre reject circle-radius.
    const t = Math.max(0, Math.min(1, (now - start) / RIPPLE_DURATION_MS));
    const eased = Math.max(0, Math.min(1, EASE_OUT_CUBIC(t)));
    map.setPaintProperty("showall-ripple-ring", "circle-radius", eased * RIPPLE_MAX_RADIUS_PX);
    map.setPaintProperty("showall-ripple-ring", "circle-stroke-opacity", (1 - eased) * 0.85);
    map.setPaintProperty("showall-ripple-ring", "circle-opacity", (1 - eased) * 0.12);
    if (t < 1) {
      requestAnimationFrame(frame);
    } else {
      map.setLayoutProperty("showall-ripple-ring", "visibility", "none");
    }
  }
  requestAnimationFrame(frame);
}

export default function MapView() {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<maplibregl.Map | null>(null);
  const loadedLayerIds = useRef<Set<string>>(new Set());
  const loadingLayerIds = useRef<Set<string>>(new Set());
  const preloadedLayerDataRef = useRef<Map<string, FeatureCollection>>(new Map());
  const preloadPromiseRef = useRef<Promise<void> | null>(null);
  const showAllAnimationRunRef = useRef(0);
  const preloadPausedRef = useRef(false);
  const rippleRunRef = useRef(0);
  const lastShowAllAnimationKeyRef = useRef("");
  // Layer ids (e.g. "transmission-lines") are stable across states even though
  // the underlying source is swapped out on state switch (see the teardown
  // logic below) — click/hover handlers are bound to that stable layer id
  // string, so they only need registering once, ever, per layer id.
  const interactivityAttached = useRef<Set<string>>(new Set());
  const popupRef = useRef<maplibregl.Popup | null>(null);
  const noiseHoverPopupRef = useRef<maplibregl.Popup | null>(null);
  const usBoundaryRef = useRef<FeatureCollection<Polygon | MultiPolygon> | null>(null);
  // Set while any proposed-site analysis is in flight, so the background
  // preload (below) yields to it — a user who just clicked "Run Site
  // Analysis" should never be stuck waiting behind dozens of passive,
  // nobody-asked-for-them-yet background layer prefetches.
  const analysisInFlightRef = useRef(false);
  const [mapReady, setMapReady] = useState(false);

  const layerVisibility = useAppStore((s) => s.layerVisibility);
  const proposeMode = useAppStore((s) => s.proposeMode);
  const scenarios = useAppStore((s) => s.scenarios);
  const activeScenarioId = useAppStore((s) => s.activeScenarioId);
  const analysisByScenario = useAppStore((s) => s.analysisByScenario);
  const activeStateId = useAppStore((s) => s.activeStateId);
  const showAllStates = useAppStore((s) => s.showAllStates);
  const addScenario = useAppStore((s) => s.addScenario);
  const setActiveScenario = useAppStore((s) => s.setActiveScenario);

  analysisInFlightRef.current = Object.values(analysisByScenario).some((a) => a.status === "loading");

  // ---- preload implemented-state GIS data (once) ----
  // Start network work immediately on mount, before the map is ready. This keeps
  // "Show All" responsive: switching views reuses in-memory GeoJSON instead of
  // waiting on dozens of state GIS requests.
  useEffect(() => {
    if (preloadPromiseRef.current) return;

    // Fetch in radial order from Washington so the background preload's cache
    // fills up in roughly the same order the Show All reveal wave consumes it —
    // nearby states are ready first, matching when they're first needed.
    const origin = WASHINGTON.center as [number, number];
    const states = [...getShowAllStates()].sort(
      (a, b) =>
        approxDistanceDeg(origin, a.center as [number, number]) -
        approxDistanceDeg(origin, b.center as [number, number])
    );
    const tasks: Array<() => Promise<void>> = [];

    for (const state of states) {
      const bboxParam = stateBboxParam(state.id);
      for (const layer of state.layers) {
        if (layer.geometryType === "raster") continue;

        const key = `${state.id}:${layer.id}`;
        tasks.push(async () => {
          try {
            const res = await fetch(`${layer.endpoint}?bbox=${bboxParam}&state=${state.id}`);
            if (!res.ok) throw new Error(`request failed (${res.status})`);
            const data = (await res.json()) as FeatureCollection;
            preloadedLayerDataRef.current.set(key, data);
          } catch (err) {
            // Keep the app usable even if one upstream GIS source is temporarily
            // unavailable; the normal sync path can retry that layer on demand.
            console.warn(`Preload failed for ${state.name} layer ${layer.id}`, err);
          }
        });
      }
    }

    preloadPromiseRef.current = (async () => {
      // Was 16: these all hit our own same-origin API route (not 49 upstream
      // hosts), so a wider pool does help the Show All reveal wave find more
      // states already cached. But this whole pool runs continuously for the
      // entire session from page load (there's no cancellation on unmount or
      // on leaving Show All), and at 16 it could saturate a single Node
      // process badly enough to starve a user-initiated request that lands
      // mid-preload (observed: a fresh "Run Site Analysis" click stalling
      // 90s+ behind ~350 queued background layer fetches). 8 is gentler on
      // the server while still keeping Show All feeling fast in practice.
      const workerCount = Math.min(8, tasks.length);
      let nextTask = 0;
      const workers = Array.from({ length: workerCount }, async () => {
        while (nextTask < tasks.length) {
          // Yield while a Show All reveal wave is actively playing (its own
          // timers need the main thread free of large JSON-parsing bursts
          // from preload responses landing all at once) or while the user
          // is waiting on a site analysis they explicitly asked for — a
          // user-initiated action always gets priority over passive,
          // nobody-asked-for-it-yet background prefetching.
          while (preloadPausedRef.current || analysisInFlightRef.current) {
            await new Promise((resolve) => setTimeout(resolve, 120));
          }
          const task = tasks[nextTask++];
          if (task) await task();
        }
      });
      await Promise.all(workers);
    })();
  }, []);

  // ---- init map (once) ----
  useEffect(() => {
    if (!containerRef.current || mapRef.current) return;
    const map = new maplibregl.Map({
      container: containerRef.current,
      style: BASEMAP_STYLE,
      center: WASHINGTON.center,
      zoom: WASHINGTON.defaultZoom,
      pitch: 0,
      maxPitch: 0,
      dragRotate: false,
      pitchWithRotate: false,
      touchPitch: false,
      maxBounds: US_MAX_BOUNDS,
      minZoom: US_MIN_ZOOM,
      renderWorldCopies: false,
      attributionControl: { compact: true },
    });
    // Tilting/rotating into 3D broke layer rendering and felt like the map was
    // "freaking out" (labels and lines fighting for a straight-down siting
    // view), so pitch/rotate is fully disabled above and pinch is zoom-only.
    map.touchZoomRotate.disableRotation();
    const navigationControl = new maplibregl.NavigationControl({ showCompass: false });
    map.addControl(navigationControl, "bottom-right");
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
          "circle-opacity": 0.16,          "circle-blur": 0.4,
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

      // Substation-proximity impact overlay: a dashed connector from each proposed
      // site to its nearest known substation (from the power analysis, not the raw
      // "electric-substations" layer — so it shows even while that layer is toggled
      // off), colored by the same TRANSMISSION_PROXIMITY_BANDS used in the analysis
      // text, plus a highlighted ring around the target substation and a distance
      // label at the line's midpoint. See the "sync substation proximity links" effect.
      map.addSource("substation-links", { type: "geojson", data: emptyFeatureCollection() });
      map.addLayer({
        id: "substation-links-line",
        type: "line",
        source: "substation-links",
        filter: ["==", ["get", "kind"], "link"],
        layout: { "line-cap": "round" },
        paint: {
          "line-color": ["get", "color"],
          "line-width": 2,
          "line-dasharray": [2, 1.6],
          "line-opacity": 0.85,
        },
      });
      map.addLayer({
        id: "substation-links-distance-label",
        type: "symbol",
        source: "substation-links",
        filter: ["==", ["get", "kind"], "midpoint"],
        layout: {
          "text-field": ["get", "distanceLabel"],
          "text-size": 11,
          "text-font": ["Open Sans Bold", "Arial Unicode MS Bold"],
          "text-allow-overlap": false,
        },
        paint: {
          "text-color": ["get", "color"],
          "text-halo-color": "#0a0d12",
          "text-halo-width": 1.4,
        },
      });
      map.addLayer({
        id: "substation-links-target",
        type: "circle",
        source: "substation-links",
        filter: ["==", ["get", "kind"], "target"],
        paint: {
          "circle-radius": 8,
          "circle-color": "transparent",
          "circle-stroke-width": 2,
          "circle-stroke-color": ["get", "color"],
        },
      });

      // Decorative "spreading out" ring for the Show All reveal — see playRippleFromWashington.
      map.addSource("showall-ripple", { type: "geojson", data: emptyFeatureCollection() });
      map.addLayer({
        id: "showall-ripple-ring",
        type: "circle",
        source: "showall-ripple",
        layout: { visibility: "none" },
        paint: {
          "circle-radius": 0,
          "circle-color": "#63d4ff",
          "circle-opacity": 0,
          "circle-stroke-color": "#63d4ff",
          "circle-stroke-width": 2.5,
          "circle-stroke-opacity": 0,
          "circle-pitch-alignment": "map",
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
          return;        }

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
  const lastCameraResetTokenRef = useRef(0);
  const cameraResetToken = useAppStore((s) => s.cameraResetToken);
  useEffect(() => {
    if (!mapReady || !mapRef.current) return;
    const cameraTarget = showAllStates ? "all-implemented" : `state:${activeStateId}`;
    const resetRequested = cameraResetToken !== lastCameraResetTokenRef.current;
    if (cameraTarget === lastCameraTargetRef.current && !resetRequested) return;
    lastCameraResetTokenRef.current = cameraResetToken;

    if (showAllStates) {
      // Extra top padding (vs. the other sides) leaves room above the fitted
      // mainland bbox so the view settles a touch further north, revealing a
      // sliver of Canada instead of cropping tight to the border.
      mapRef.current.fitBounds(implementedStatesBounds(), {
        padding: { top: 160, bottom: 72, left: 72, right: 72 },
        duration: 1200,
      });
    } else {
      const state = getState(activeStateId);
      if (state) mapRef.current.fitBounds(state.bounds, { padding: 60, duration: 1200 });
    }
    lastCameraTargetRef.current = cameraTarget;
  }, [mapReady, activeStateId, showAllStates, cameraResetToken]);

  // ---- load/toggle infrastructure layers ----
  // State GeoJSON is prefetched into memory on mount (see the preload effect
  // above), but the Show All reveal never blocks on that ENTIRE nationwide
  // preload finishing — with 49+ states that can take well over a minute. Each
  // state instead ensures only its OWN visible layers are loaded right when its
  // turn in the radial wave comes up, using the shared cache opportunistically
  // and falling back to a direct fetch if the background preload hasn't reached
  // it yet. See playRippleFromWashington / applyStateLayerVisibility above.
  const lastSyncedViewKey = useRef("");
  useEffect(() => {
    if (!mapReady || !mapRef.current) return;
    const map = mapRef.current;
    const states = showAllStates
      ? getShowAllStates()
      : [getState(activeStateId) ?? getState(DEFAULT_STATE_ID)!];
    const wantedStateIds = new Set(states.map((state) => state.id));
    const viewKey = showAllStates
      ? `all:${states.map((state) => state.id).sort().join(",")}`
      : `state:${activeStateId}`;
    lastSyncedViewKey.current = viewKey;

    // Keep previously loaded state sources resident so returning to Show All is
    // instant. States outside the current view are hidden, not removed.
    for (const key of Array.from(loadedLayerIds.current)) {
      const [stateId, layerId] = key.split(":");
      if (!stateId || !layerId || wantedStateIds.has(stateId)) continue;
      const previousState = getState(stateId);
      const previousLayer = previousState?.layers.find((layer) => layer.id === layerId);
      if (!previousLayer) continue;
      const sourceId = `src-${stateId}-${layerId}`;
      for (const spec of buildLayerSpecs(previousLayer, sourceId, stateId)) {
        if (map.getLayer(spec.id)) map.setLayoutProperty(spec.id, "visibility", "none");
      }
    }

    /** Adds (if missing) a hidden, zero-opacity source+layer from already-known data. Synchronous — no network. */
    function materializeLayer(state: { id: string }, layer: LayerDefinition, data: FeatureCollection) {
      const key = `${state.id}:${layer.id}`;
      const sourceId = `src-${state.id}-${layer.id}`;
      if (!map.getSource(sourceId)) {
        map.addSource(sourceId, { type: "geojson", data });
      }
      // Population density loads as a toggle-on layer, often after
      // transmission-lines is already on the map (it's default-visible in
      // most states) — without this, its fill would get added on top and
      // visually bury the lines it's meant to give context to. Anything
      // added later goes on top by default, so insert it before the first
      // transmission-line layer already present, if any.
      //
      // Every state infrastructure layer also has to stay below the placed
      // data center's own layers (proposed-points-*, campus-extrusion,
      // substation-links-*), which are all added once at map init and would
      // otherwise get buried by whichever infra layer is toggled on last.
      // "proposed-points-glow" is the first of that group, so inserting
      // before it keeps a placed site visually on top of every metric.
      const insertBeforeId =
        layer.id === "population-density"
          ? map.getStyle().layers?.find((l) => l.id.endsWith("-transmission-lines-line"))?.id ??
            "proposed-points-glow"
          : "proposed-points-glow";
      for (const spec of buildLayerSpecs(layer, sourceId, state.id)) {
        if (!map.getLayer(spec.id)) {
          map.addLayer(spec, insertBeforeId);
          const prop = opacityPaintProp(spec.type);
          if (prop) map.setPaintProperty(spec.id, prop, 0);
        }
        map.setLayoutProperty(spec.id, "visibility", "none");
      }
      const interactionKey = `${state.id}:${layer.id}`;
      if (!interactivityAttached.current.has(interactionKey)) {
        attachInteractivity(map, layer, popupRef, state.id);
        interactivityAttached.current.add(interactionKey);
      }
      loadedLayerIds.current.add(key);
    }

    async function ensureLayer(state: ReturnType<typeof getEnabledStates>[number], layer: LayerDefinition) {
      const key = `${state.id}:${layer.id}`;
      if (loadedLayerIds.current.has(key)) return;
      if (loadingLayerIds.current.has(key)) {
        // Another caller (preload or a different state's wave) is already
        // fetching this exact layer — just wait for it instead of double-fetching.
        while (loadingLayerIds.current.has(key)) {
          await new Promise((resolve) => setTimeout(resolve, 50));
        }
        return;
      }

      loadingLayerIds.current.add(key);
      try {
        let data = preloadedLayerDataRef.current.get(key);
        if (!data) {
          const bboxParam = stateBboxParam(state.id);
          const res = await fetch(`${layer.endpoint}?bbox=${bboxParam}&state=${state.id}`);
          if (!res.ok) throw new Error(`request failed (${res.status})`);
          data = (await res.json()) as FeatureCollection;
          preloadedLayerDataRef.current.set(key, data);
        }

        if (!mapRef.current) return;
        materializeLayer(state, layer, data);
      } catch (err) {
        console.error(`Failed to load ${state.name} layer ${layer.id}`, err);
      } finally {
        loadingLayerIds.current.delete(key);
      }
    }

    /** Ensures every currently-visible, non-raster layer for one state is loaded. Uses the shared cache when the background preload already has it. */
    function ensureStateVisibleLayers(state: ReturnType<typeof getEnabledStates>[number]) {
      const tasks: Array<Promise<void>> = [];
      for (const layer of state.layers) {
        if (layer.geometryType === "raster") continue;
        if (!layerVisibility[layer.id]) continue;
        const key = `${state.id}:${layer.id}`;
        if (loadedLayerIds.current.has(key)) continue;
        const cached = preloadedLayerDataRef.current.get(key);
        if (cached) {
          materializeLayer(state, layer, cached);
        } else {
          tasks.push(ensureLayer(state, layer));
        }
      }
      return Promise.all(tasks);
    }

    function hideAllLayers(state: ReturnType<typeof getEnabledStates>[number]) {
      for (const layer of state.layers) {
        if (layer.geometryType === "raster") continue;
        const sourceId = `src-${state.id}-${layer.id}`;
        for (const spec of buildLayerSpecs(layer, sourceId, state.id)) {
          if (map.getLayer(spec.id)) map.setLayoutProperty(spec.id, "visibility", "none");
        }
      }
    }

    async function syncLayers() {
      if (!showAllStates) {
        const state = states[0]!;
        await ensureStateVisibleLayers(state);
        if (!mapRef.current || lastSyncedViewKey.current !== viewKey) return;
        showAllAnimationRunRef.current += 1;
        lastShowAllAnimationKeyRef.current = "";
        applyStateLayerVisibility(map, state, layerVisibility, "instant");
        return;
      }

      const animationKey = viewKey;
      const shouldAnimate = lastShowAllAnimationKeyRef.current !== animationKey;
      if (!shouldAnimate) {
        await Promise.all(states.map((state) => ensureStateVisibleLayers(state)));
        if (!mapRef.current || lastSyncedViewKey.current !== viewKey) return;
        for (const state of states) applyStateLayerVisibility(map, state, layerVisibility, "instant");
        return;
      }

      lastShowAllAnimationKeyRef.current = animationKey;
      const runId = ++showAllAnimationRunRef.current;

      // Radial reveal, timed by real distance from Washington so it reads as
      // infrastructure physically spreading outward — nearby states (Oregon,
      // Idaho...) light up almost together, distant ones (Florida, Arizona...)
      // trail behind. The whole wave is bounded to REVEAL_SPAN_MS regardless of
      // how many states are live, so it never feels slower as coverage grows.
      // Each state's own reveal only waits on ITS OWN data (usually already
      // cached by the background preload by the time its turn comes up), never
      // on the other 48 states.
      const origin = WASHINGTON.center as [number, number];
      const distances = states.map((state) => approxDistanceDeg(origin, state.center as [number, number]));
      const maxDistance = Math.max(...distances, 0.0001);

      for (const state of states) hideAllLayers(state);
      playRippleFromWashington(map, origin, rippleRunRef);

      // The background preload (see the mount effect above) can have several
      // fetch responses landing in the same window as this wave's timers —
      // parsing those large GeoJSON payloads is real main-thread work that
      // was measured to push even a 0ms-delay reveal back by several hundred
      // ms. Pausing that worker pool for the duration of the wave keeps every
      // frame of the reveal itself smooth; it resumes right after.
      preloadPausedRef.current = true;
      const revealTailMs = REVEAL_SPAN_MS + LAYER_FADE_MS + 250;
      window.setTimeout(() => {
        if (showAllAnimationRunRef.current === runId) preloadPausedRef.current = false;
      }, revealTailMs);

      states.forEach((state, index) => {
        const delay = REVEAL_SPAN_MS * SMOOTHSTEP(distances[index]! / maxDistance);
        window.setTimeout(async () => {
          if (showAllAnimationRunRef.current !== runId || lastSyncedViewKey.current !== viewKey) return;
          await ensureStateVisibleLayers(state);
          if (showAllAnimationRunRef.current !== runId || lastSyncedViewKey.current !== viewKey) return;
          applyStateLayerVisibility(map, state, layerVisibility, "fade");
        }, delay);
      });
    }

    void syncLayers();
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
        tileSize: 256,        minzoom: 4,
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

  // ---- sync substation-proximity impact overlay (site -> nearest substation) ----
  // Driven by the power analysis result (power.nearestSubstation), not the raw
  // "electric-substations" data layer, so a placed site shows its proximity
  // impact immediately once analysis runs, whether or not that layer is toggled on.
  useEffect(() => {
    if (!mapReady || !mapRef.current) return;
    const map = mapRef.current;

    const bandColor = (miles: number | null): string => {
      if (miles == null) return "#7d8ba0";
      if (miles <= TRANSMISSION_PROXIMITY_BANDS.veryClose) return "#3bf2a0";
      if (miles <= TRANSMISSION_PROXIMITY_BANDS.close) return "#f2b93b";
      if (miles <= TRANSMISSION_PROXIMITY_BANDS.moderate) return "#f2703b";
      return "#ff5470";
    };

    const features: FeatureCollection["features"] = [];
    for (const scenario of scenarios) {
      const analysis = analysisByScenario[scenario.id];
      if (analysis?.status !== "ready") continue;
      const sub = analysis.data.power.nearestSubstation;
      if (sub.lng == null || sub.lat == null) continue;
      const color = bandColor(sub.distanceMiles);
      const origin: [number, number] = [scenario.lng, scenario.lat];
      const target: [number, number] = [sub.lng, sub.lat];
      const midpoint: [number, number] = [(origin[0] + target[0]) / 2, (origin[1] + target[1]) / 2];

      features.push({
        type: "Feature",
        geometry: { type: "LineString", coordinates: [origin, target] },
        properties: { kind: "link", color, scenarioId: scenario.id },
      });
      features.push({
        type: "Feature",
        geometry: { type: "Point", coordinates: target },
        properties: { kind: "target", color, scenarioId: scenario.id },
      });
      features.push({
        type: "Feature",
        geometry: { type: "Point", coordinates: midpoint },
        properties: {
          kind: "midpoint",
          color,
          scenarioId: scenario.id,
          distanceLabel: `${sub.distanceMiles} mi`,
        },
      });
    }

    const linksSource = map.getSource("substation-links") as maplibregl.GeoJSONSource | undefined;
    linksSource?.setData({ type: "FeatureCollection", features });
  }, [mapReady, scenarios, analysisByScenario]);

  // ---- click a proposed site marker to select it; hover shows its noise-impact screening result ----
  useEffect(() => {
    if (!mapReady || !mapRef.current) return;
    const map = mapRef.current;
    const handler = (e: maplibregl.MapLayerMouseEvent) => {
      const id = e.features?.[0]?.properties?.id as string | undefined;
      if (id) setActiveScenario(id);
    };
    const hoverHandler = (e: maplibregl.MapLayerMouseEvent) => {
      map.getCanvas().style.cursor = "pointer";
      const feature = e.features?.[0];
      const id = feature?.properties?.id as string | undefined;
      const scenario = scenarios.find((s) => s.id === id);
      if (!scenario || !feature) return;
      const analysis = analysisByScenario[scenario.id];
      const noise = analysis?.status === "ready" ? analysis.data.noise : null;
      noiseHoverPopupRef.current?.remove();
      noiseHoverPopupRef.current = new maplibregl.Popup({
        closeButton: false,
        closeOnClick: false,
        maxWidth: "220px",
        offset: 12,
      })
        .setLngLat(e.lngLat)
        .setHTML(
          buildNoisePopupHtml(
            scenario.label,
            noise ? { noiseImpactScore: noise.noiseImpactScore.value, classification: noise.classification } : null
          )
        )
        .addTo(map);
    };
    const leaveHandler = () => {
      map.getCanvas().style.cursor = proposeMode ? "crosshair" : "";
      noiseHoverPopupRef.current?.remove();
      noiseHoverPopupRef.current = null;
    };
    map.on("click", "proposed-points-core", handler);
    map.on("mouseenter", "proposed-points-core", hoverHandler);
    map.on("mouseleave", "proposed-points-core", leaveHandler);
    return () => {
      map.off("click", "proposed-points-core", handler);
      map.off("mouseenter", "proposed-points-core", hoverHandler);
      map.off("mouseleave", "proposed-points-core", leaveHandler);
      noiseHoverPopupRef.current?.remove();
      noiseHoverPopupRef.current = null;
    };
  }, [mapReady, setActiveScenario, proposeMode, scenarios, analysisByScenario]);

  // Inline style (not a Tailwind class) is required here: maplibre-gl.css ships its own
  // `.maplibregl-map { position: relative }` rule which otherwise wins the cascade over
  // the `absolute` utility class and collapses this container to zero height.
  return <div ref={containerRef} style={{ position: "absolute", inset: 0 }} />;
}

// A fixed minZoom that "roughly" fits the mainland view bounds only works for one window width — on a
// wider viewport (or with the sidebar taking less room) the box ends up smaller than the
// screen, and maxBounds' pan clamp can't stop you zooming out past that, leaving the map
// floating in blank space. Recomputing the floor from the actual container size keeps the
// box flush with the viewport at any window size. Hawaii is shown separately in the inset.
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
  const zoom = coverZoomForBounds(US_MAINLAND_VIEW_BOUNDS, width, height);
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