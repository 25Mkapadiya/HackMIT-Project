> **Note:** this is a standalone reference project, kept as its own
> Vite app under `reference/nationwide-advisor/` rather than merged into
> the root Next.js app (`../../`). The two use different stacks (Vite/D3
> client-side composite scoring here vs. Next.js/MapLibre live-GIS
> analysis at the root) and the root app deliberately avoids a black-box
> composite score, so a code-level merge wasn't a good fit. The root
> app's `src/states/registry.ts` does pull this project's real state
> metadata (`src/data/states-meta.json`) and county/state boundary data
> (`public/data/us-states.json`) to seed its own 50-state architecture —
> see the root README for that integration. All commands below run from
> *this* directory, not the repo root.

# Datacenter Siting Advisor — United States

A nationwide, county-level datacenter siting tool: pick a state, see every
county colored by a composite siting score, click one to see the score
breakdown, and adjust the weighting to match what you care about (grid
proximity, carbon intensity, land availability, demand headroom).

This started from a Texas-only schematic-grid demo
([25Mkapadiya/Datacenter-Simulation](https://github.com/25Mkapadiya/Datacenter-Simulation))
that stood in for real geography with a 12×9 grid and simulated placing a
facility against three statewide resource meters. This version keeps that
placement simulation but drops the schematic grid for real county
boundaries and a nationwide scoring engine — pick any state, not just Texas.

## Placing a facility

Pick a load size, interconnection type, and cooling method, then click
"Place datacenter here" on a selected county. That draws down three
per-state meters (grid headroom, water reserve, community approval) using
the same cooling/interconnect trade-off formula as the original demo,
scaled to whatever state you're in. Placed counties get a checkmark on the
map; "Reset" clears every placement in the current state back to baseline;
"Demo: good placement" / "Demo: bad placement" jump to the current state's
best-scoring county and its worst (a blocked county if one exists, else its
lowest-scoring buildable county).

## Run it

```bash
npm install
npm run dev        # http://localhost:5173
```

```bash
npm run build       # type-checks, then builds dist/ for static hosting (e.g. Vercel)
npm run preview      # serve the production build locally
```

`npm run prep-data` regenerates `public/data/*.json` from the committed
TopoJSON in `data/raw/` — you don't need to run it unless you're refreshing
the geography source.

## Architecture

- **React + TypeScript + Vite.** No backend — everything runs client-side
  against static files.
- **Map rendering: `d3-geo`, not a tile provider.** The national view uses
  `geoAlbersUsa` (the standard composite projection that insets Alaska and
  Hawaii); the per-state drill-down uses `geoMercator` fitted to that
  state's counties. No Mapbox/MapLibre token or tile server is needed —
  every path is drawn straight from the GeoJSON, which keeps the demo
  immune to flaky conference wifi or rate limits, per the project's own
  advice to preprocess data offline rather than hit live APIs during a demo.
- **Scoring: `@turf/turf`.** `turf.distance` computes real great-circle
  distance from each county's centroid to the nearest grid hub;
  `turf.area` computes each county's real land area from its polygon.
  `src/lib/scoring.ts` splits this into geography-derived factors (computed
  once per county when data loads) and a cheap weighted recombination (run
  on every slider change), so adjusting weights stays instant even across
  ~3,200 counties.
- **State management:** plain React state in `App.tsx` — scenario inputs
  (weights, load size, interconnection type) and selection state
  (state/county) flow down as props. No routing library; national vs.
  state view is just a `selectedStateFips` toggle.

## What's real here and what's a stand-in

**Real:**
- **County and state geometry** — `data/raw/{states,counties}-10m.json` is
  [us-atlas](https://github.com/topojson/us-atlas)'s TopoJSON extract of the
  Census Bureau's [TIGER/Line cartographic boundary
  files](https://www.census.gov/geographies/mapping-files/time-series/geo/tiger-line-file.html).
  `scripts/build-data.mjs` converts it to flat GeoJSON once, offline —
  exactly the "preprocess into flat files" pattern the original brief
  called for.
- **Land area per county** — computed directly from each county's real
  polygon via `turf.area`, not looked up from a table.
- **Distance to the nearest grid hub** — computed directly via
  `turf.distance` from each county's real centroid to a curated point.
- **Texas's regulatory logic** — SB6 (2025)'s ≥75MW interconnection
  threshold, the statewide grid-tied interconnection pause (with the
  self-generation exemption), Fort Worth's and San Antonio's application
  pauses, Hill County's moratorium, and Hood County's two rejections are
  wired into the scoring exactly as they were in the original demo
  (`src/data/state-notes.json`).

**Illustrative stand-ins** (clearly labeled in the data files and in the UI
when they apply):
- **Grid hubs** (`src/data/grid-hubs.json`) — ~100 major U.S. metro areas
  and known energy corridors used as a proxy for "substation-dense," not
  actual HIFLD substation or transmission-line coordinates. The real swap
  is HIFLD's [Electric Substations](https://hifld-geoplatform.hub.arcgis.com/)
  layer or [Open Infrastructure Map](https://openinframap.org/), preprocessed
  the same way as the county geometry.
- **Carbon intensity** (`src/data/carbon-intensity.json`) — approximate,
  state-level gCO₂/kWh figures patterned after typical EPA eGRID subregion
  mixes, not a live pull. Swap in [Electricity
  Maps](https://www.electricitymaps.com/)' API for real, time-resolved
  carbon signal.
- **Demand headroom** — a distance-based heuristic (peaks a moderate
  distance from a hub: close enough to interconnect, far enough to avoid
  competing with existing load), not [EIA Open Data](https://www.eia.gov/opendata/)
  regional load or [LBNL's Queued Up](https://emp.lbl.gov/queues) /
  [interconnection.fyi](https://interconnection.fyi/) queue-depth data.
- **Regulatory rules outside Texas** — not modeled. Every other state's
  score reflects only the four generic factors; the detail panel says so
  explicitly. Extending `state-notes.json` with another state's real rules
  (statute, local pauses, protected zones) is the same shape as the Texas
  entry.
- **Simulation resource meters** (`src/lib/simulation.ts`) — grid headroom
  is derived from this app's own composite score (not a real ISO/utility
  feed), water reserve starts from `src/data/water-stress.json`'s
  approximate, illustrative state ranking, and community approval is a
  deterministic per-state placeholder. The cooling/interconnect drain
  formula itself is carried over unchanged from the original demo's
  `placeDatacenter()`.

## Wiring in the real data layer

1. **Substations & transmission** — pull HIFLD's Electric Substations /
   Transmission Lines layers or Open Infrastructure Map, keep point
   geometry + voltage class, and replace `src/data/grid-hubs.json`.
   `turf.booleanPointInPolygon` is the natural tool if you add protected-zone
   polygons (aquifer recharge zones, wilderness areas) as a hard block,
   the way Hays County is hardcoded today.
2. **Interconnection queue depth** — LBNL's Queued Up and
   interconnection.fyi give real queue depth per balancing authority to
   discount the grid-proximity score where the queue is backed up.
3. **Demand baseline** — EIA's Open Data API for regional load context,
   replacing the current distance-based heuristic.
4. **Carbon signal** — Electricity Maps for real, time-resolved carbon
   intensity, replacing the static approximate table.
5. **Population / protected areas** for a richer land-availability signal
   than raw polygon area.

Preprocess all of the above once, offline, into flat JSON (the pattern
`scripts/build-data.mjs` already follows) — never query these live during
a demo.

## Files

```
data/raw/                 committed source TopoJSON (Census TIGER/Line via us-atlas)
scripts/build-data.mjs    offline preprocessing: TopoJSON -> flat GeoJSON in public/data
public/data/              generated us-states.json / us-counties.json (npm run prep-data)
src/data/                 curated reference JSON: grid hubs, carbon intensity, water stress, state notes
src/lib/scoring.ts        turf-based scoring engine
src/lib/simulation.ts     placement drain formula + per-state resource meter baselines
src/lib/useGeoData.ts     fetches the generated GeoJSON at runtime
src/components/           USMap, StateMap, ControlsPanel, DetailPanel, StateResourcesPanel, TopList, Legend
src/App.tsx               state management + layout
```
