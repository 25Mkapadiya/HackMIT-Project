# Data Center Siting Platform

An interactive map application for evaluating candidate U.S. sites for new
data center construction. A user drops a pin anywhere in a supported state,
describes the facility they want to build (power draw, cooling technology,
redundancy tier, number of buildings), and the app runs a multi-factor
feasibility analysis against real public infrastructure, environmental, and
demographic datasets — power grid proximity, fiber/connectivity, water
availability, land/flood risk, noise impact on nearby residents, likely
construction cost and timeline, and regulatory/utility context.

Nothing here approves or guarantees a site. Every output is explicitly
labeled with a confidence level (`fact`, `estimated`, `proxy`, or `unknown`)
and cites its source, because the whole point of the tool is to make clear
*how sure* each number actually is.

---

## Table of contents

1. [What the app does, end to end](#what-the-app-does-end-to-end)
2. [Tech stack](#tech-stack)
3. [Project layout](#project-layout)
4. [How a site analysis actually works](#how-a-site-analysis-actually-works)
5. [The state system (why there's a folder per state)](#the-state-system-why-theres-a-folder-per-state)
6. [Map layers and GIS data](#map-layers-and-gis-data)
7. [Frontend architecture](#frontend-architecture)
8. [API routes](#api-routes)
9. [Supabase backend](#supabase-backend)
10. [Getting started locally](#getting-started-locally)
11. [Environment variables](#environment-variables)
12. [Adding a new state](#adding-a-new-state)
13. [Confidence labeling convention](#confidence-labeling-convention)
14. [Scripts](#scripts)
15. [Reference project](#reference-project)

---

## What the app does, end to end

1. The user loads the map (a MapLibre GL map centered on a default state,
   Washington) and can switch between any of the 50 states or view the
   whole country at once ("Show All").
2. The user turns on **map layers** — power transmission lines, substations,
   fiber/IXP points, water bodies, flood zones, existing data centers, etc.
   — to visually explore what infrastructure already exists near a
   candidate location.
3. The user enters **Propose Mode** and clicks a point on the map to drop a
   candidate site ("Site A", "Site B", ...). Each site is a `ScenarioConfig`:
   coordinates, state, planned IT load in MW, number of buildings, cooling
   technology, cooling loop type/medium, and redundancy tier (N, N+1, 2N).
4. The user hits **Run Analysis**. The frontend POSTs the scenario to
   `/api/analysis`, which runs a sequential pipeline of independent
   "analysis modules" (power, fiber, regulation, efficiency, water, land,
   noise) against that state's registered GIS data sources and several
   federal APIs, then derives a construction estimate and a list of
   "infrastructure gaps" (things that are likely missing or need a formal
   study before this site is buildable).
5. Results are rendered as metrics with confidence badges and source
   citations in a results panel, and multiple sites can be selected for
   **side-by-side comparison**.
6. A separate **Graph panel** overlays a broader dataset of existing
   European data centers for context/benchmarking.

## Tech stack

| Concern | Choice |
|---|---|
| Framework | [Next.js 14](https://nextjs.org/) (App Router), React 18, TypeScript |
| Map rendering | [MapLibre GL JS](https://maplibre.org/) |
| Geospatial math | [Turf.js](https://turfjs.org/) (distance, point-in-polygon, etc.) |
| Client state | [Zustand](https://github.com/pmndrs/zustand) (`src/store/useAppStore.ts`) |
| Styling | Tailwind CSS |
| Persistent backend (optional) | [Supabase](https://supabase.com/) — Postgres schema + SQL migrations for storing researched state facts and scenario history |
| External data sources | Census Bureau API, EIA (Energy Information Administration) API v2, ArcGIS FeatureServer/MapServer endpoints run by individual state agencies, HIFLD national infrastructure extracts |

The app runs entirely server-rendered/server-fetched where possible: all
calls to third-party GIS/government APIs happen in Next.js **Route
Handlers** (`app/api/**`), never directly from the browser, so API keys
never reach the client and responses can be cached.

## Project layout

```
app/                      Next.js App Router
  page.tsx                Top-level page: mounts the map + all panels
  layout.tsx              Root HTML layout
  api/
    analysis/route.ts     POST — runs the full ScenarioAnalysis pipeline
    gis/[layerId]/route.ts  GET — proxies/fetches one map layer's GeoJSON for a bbox
    us-boundary/route.ts  GET — serves the national state-boundaries GeoJSON

src/
  components/
    map/                  MapView (MapLibre wrapper), layer styling, popups
    panels/               TopBar, LayerControlPanel, ScenarioPanel,
                           ScenarioConfigForm, ImpactResults, ComparisonPanel,
                           GraphPanel, Legend
    ui/                   Reusable presentational bits: MetricRow,
                           DistanceRow, ConfidenceBadge, ProvenanceTag,
                           NoiseImpactCard, DraggablePanel

  lib/
    types.ts              Every shared domain type (ScenarioConfig,
                           ScenarioAnalysis, LayerDefinition, Metric<T>, ...)
    analysis/              One file per analysis domain:
                             power.ts, fiber.ts, regulation.ts,
                             efficiency.ts, water.ts, land.ts, noise.ts,
                             development.ts, gaps.ts, index.ts (orchestrator)
    gis/                   Generic GIS plumbing: ArcGIS query helpers,
                           per-state fetcher registry (stateGis.ts),
                           nationwide data sources (HIFLD, EIA plants, etc.)
    spatial/               geo.ts (distance/geometry helpers via Turf),
                           campus.ts (site footprint / acreage modeling)
    cache/                 In-memory response cache for upstream API calls
    constants/             Dropdown options (cooling tech, redundancy),
                           fixed modeling assumptions, noise-model constants
    data/                  Static reference datasets (EU data centers, etc.)

  states/
    directory.ts           All 50 states' real name/FIPS/bounds (from Census
                           TIGER/Line boundary data), used for the state
                           picker and "fly to" camera targets
    registry.ts             Combines "live" states (full layers + analysis)
                           with "stub" states (name/bounds only) into one
                           STATE_REGISTRY, keyed by id
    <state>/                One folder per LIVE state, e.g. washington/,
                           texas/, alabama/... Each contains:
                             index.ts          StateDefinition export
                             layers.ts         LayerDefinition[] for this state
                             layerFetchers.ts  bbox -> GeoJSON fetchers per layer
                             sources.ts        SourceMeta citations
                             data/             hand-curated static datasets
                             (existing data centers, etc.)

  store/
    useAppStore.ts          Single Zustand store: active state, layer
                           visibility, scenarios, analysis results,
                           comparison selection, camera reset, propose mode

data/                       Standalone CSV county population-density dataset
scripts/                    Python script that generates the county density
                           dataset above from Census PEP + Gazetteer files

supabase/
  README.md                 Describes the optional Postgres backend
  migrations/                SQL migrations for a state-research schema
                           (data sources, research facts, utilities,
                           existing data centers, zoning, incentives,
                           hazards, persisted scenarios)

reference/nationwide-advisor/  A standalone prior-generation prototype kept
                           for reference (nationwide state boundary data,
                           an earlier siting-advisor UI). Not part of the
                           running app's build.
```

## How a site analysis actually works

The orchestrator lives in `src/lib/analysis/index.ts`
(`runScenarioAnalysis`). Given a `ScenarioConfig`, it runs these steps
**in this order, on purpose** (later steps reuse work done by earlier
ones instead of re-querying the same API):

1. **Power** (`power.ts`) — resolves the utility territory serving the
   site, finds the nearest transmission lines at 115kV/230kV/500kV and the
   nearest substation, looks up nearby generation capacity (EIA API), and
   computes a "grid demand pressure" label from county population density
   (as a proxy for how much existing load is already competing for
   headroom on the same lines). It explicitly never claims to know
   available interconnection capacity — that requires a real utility study.
2. **Fiber** (`fiber.ts`) — nearest internet exchange point (IXP) and a
   broadband/connectivity proxy pulled from Census ACS Subject Table
   S2801, used because the FCC's own Broadband Data Collection API only
   ships bulk per-state downloads, not a live point lookup.
3. **Regulation** (`regulation.ts`) — reuses the utility territory found by
   the power step; reports county and a generic permitting note.
4. **Efficiency** (`efficiency.ts`) — reuses power's population-density
   lookup to model an estimated PUE (Power Usage Effectiveness), starting
   from the published industry baseline for the chosen cooling technology
   and adjusting for local demand pressure and water-stress cooling
   constraints. This is a transparent heuristic, not a measured value —
   see the file for the full list of adjustment factors and citations.
5. **Water** (`water.ts`) — computed independently (WUE — Water Usage
   Effectiveness — is defined per kWh of *IT* energy, not facility energy,
   so it can't reuse the power step's numbers): estimated daily
   consumption/withdrawal, nearest water body, nearby water rights, and a
   drought/water-stress label.
6. **Land** (`land.ts`) — FEMA flood zone, elevation, distance to the
   nearest major road, population within 5 miles, environmental
   constraints, and an estimated site acreage.
7. **Noise** (`noise.ts`) — synchronous, no network call. Combines a 1–10
   "cooling noise potential" score for the selected cooling technology
   with a residential-density/proximity score (also derived from power's
   county lookup) into a 0–100 noise impact score and a plain-language
   explanation. Explicitly a screening-level estimate, not acoustics
   engineering.
8. **Development** (`development.ts`) — derives acreage, a construction
   cost range, and a timeline range from the land analysis and scenario
   inputs.
9. **Gaps** (`gaps.ts`) — synthesizes all of the above into a flat list of
   `InfrastructureGap`s (`info` / `watch` / `likely_required`) — the
   plain-English "here's what you still need to check/build" summary.

Every one of these steps returns strongly-typed `Metric<T>` values (see
`src/lib/types.ts`) that always carry a `confidence` level and a `source`
citation, so the UI can render exactly how trustworthy each number is
rather than presenting everything as equally certain.

The full pipeline is exposed over HTTP as `POST /api/analysis`.

## The state system (why there's a folder per state)

Every U.S. state exists in `STATE_REGISTRY` (`src/states/registry.ts`),
built from two groups:

- **Live states** — have a real `StateDefinition` with actual map layers
  and wired-up data fetchers (currently most of the eastern/central/west
  U.S., see the `LIVE_STATES` array in `registry.ts`). These support the
  full analysis pipeline.
- **Stub states** — every other state, generated automatically from
  `directory.ts` (real Census-derived name/bounds/FIPS) with an empty
  layer list and `enabled: false`. This lets the state picker and the map
  show and fly to *any* U.S. state without ever claiming analysis coverage
  that doesn't actually exist.

This split means the map, layer control panel, and the analysis engine
never need to know which states are "real" — they only ever read from
`STATE_REGISTRY` / the currently active `StateDefinition`. Turning a stub
state into a live one is purely additive (see
["Adding a new state"](#adding-a-new-state) below).

## Map layers and GIS data

A `LayerDefinition` (`src/lib/types.ts`) describes one togglable map
layer: category (`power` / `water` / `connectivity` / `environment` /
`community` / `existing_infrastructure`), geometry type, a `SourceMeta`
citation, a confidence level, legend styling, and the API endpoint it
fetches GeoJSON from.

Two kinds of data sources feed these layers:

- **Nationwide sources** (`src/lib/gis/nationalSources.ts` /
  `nationalFetchers.ts`) — HIFLD infrastructure extracts, EIA power plants,
  etc. — shared across every state.
- **Per-state sources** — each `src/states/<state>/layerFetchers.ts`
  queries that state's own ArcGIS FeatureServer/MapServer endpoints (run
  by the state's GIS office/utility commission) via the shared ArcGIS
  query helper in `src/lib/gis/arcgis.ts`.

`src/lib/gis/stateGis.ts` is the registry that maps
`(stateId, layerId) -> fetcher function`. The `/api/gis/[layerId]` route
looks up the right fetcher for the requested state and bounding box,
calls it, and returns a `FeatureCollection`. If a layer isn't implemented
for a given state, the fetcher degrades to an **empty** FeatureCollection
rather than a 404 — a state should never fail to render just because one
optional layer isn't wired up yet.

## Frontend architecture

- **`MapView`** (`src/components/map/MapView.tsx`) owns the MapLibre GL
  instance: base style, camera control, layer add/remove based on
  `layerVisibility`, click handling for Propose Mode, and popups.
- **State** lives in one Zustand store, `useAppStore`
  (`src/store/useAppStore.ts`): active state, "show all states" mode,
  per-layer visibility, camera-reset token, propose mode, the full list of
  proposed scenarios and their analysis results, comparison-panel
  selection, and the EU data-centers graph panel's open/closed state.
- **Panels** (`src/components/panels/`) are independent, draggable/
  collapsible UI surfaces that all read/write the same store:
  - `TopBar` — state picker, Show All toggle, reset.
  - `LayerControlPanel` — per-layer visibility toggles, grouped by category.
  - `ScenarioPanel` / `ScenarioConfigForm` — configure a dropped site's
    MW load, buildings, cooling tech, redundancy, etc., and trigger
    `runAnalysis`.
  - `ImpactResults` — renders a completed `ScenarioAnalysis` as metric rows
    with confidence badges and source citations.
  - `ComparisonPanel` — side-by-side comparison of multiple scenarios.
  - `GraphPanel` — the EU data-center reference dataset overlay.
  - `Legend` — active layer legend swatches.

## API routes

| Route | Method | Purpose |
|---|---|---|
| `/api/analysis` | `POST` | Body: a `ScenarioConfig`. Runs `runScenarioAnalysis` and returns a `ScenarioAnalysis`. Returns `502` if an upstream data source fails. |
| `/api/gis/[layerId]` | `GET` | Query params: `state` (state id, defaults to the app's default state) and `bbox=xmin,ymin,xmax,ymax`. Returns a GeoJSON `FeatureCollection` for that layer within the bbox. Cached for 60s at the edge with a 300s stale-while-revalidate window. |
| `/api/us-boundary` | `GET` | Returns the national state-boundaries GeoJSON (used to draw state outlines / the "Show All" view). Cached for 1 day. |

All three are Next.js Route Handlers, so they run server-side — this is
where `EIA_API_KEY` and `CENSUS_API_KEY` are actually used; they are never
exposed to the browser.

## Supabase backend

An optional Postgres backend (see `supabase/README.md` and
`supabase/migrations/`) exists for **persisting hand-researched, per-state
facts** that aren't available from a live API — the kind of thing someone
had to verify with a state agency or utility directly. Its schema (all
state-agnostic) covers:

- `data_sources` — citation metadata
- `research_facts` — individual findings, each explicitly labeled
  **FACT / PROXY / ESTIMATE / UNKNOWN**
- `utilities`, `existing_data_centers`, `zoning_jurisdictions`,
  `incentives`, `hazards`
- persisted `scenarios` and `scenario_analyses`

Two states currently have seeded research data: **Wisconsin** and
**Illinois** (see the seed migration files for the exact rules that were
carried into each — e.g. "generation proximity is labeled NEARBY
GENERATION, never available power," "zoning stays UNKNOWN unless
researched locally," incentives are never recorded as automatically
available). This backend is not required to run the map/analysis
features described above — it's a separate, optional data-persistence
layer.

## Getting started locally

Requirements: Node.js 18+ and npm.

```bash
# 1. Install dependencies
npm install

# 2. Configure API keys (both are free to obtain, see below)
cp .env.example .env.local
# then fill in EIA_API_KEY and CENSUS_API_KEY

# 3. Run the dev server
npm run dev
# open http://localhost:3000
```

Other scripts:

```bash
npm run build      # production build
npm run start      # run a production build
npm run lint       # ESLint
npm run typecheck  # tsc --noEmit
```

## Environment variables

Defined in `.env.example`:

| Variable | Required | Used for |
|---|---|---|
| `EIA_API_KEY` | Yes (server-side only) | [EIA API v2](https://www.eia.gov/opendata/register.php) — nearby generation capacity, balancing-authority demand, and prices, in `power.ts`. Free registration. |
| `CENSUS_API_KEY` | Yes (server-side only) | [Census Bureau API](https://api.census.gov/data/key_signup.html) — ACS population estimates (`land.ts`) and the ACS Subject Table S2801 broadband/connectivity figure (`fiber.ts`). Required by the Census API's current enforcement, not just for a higher rate limit. Free registration. |

If a Supabase backend is used for the research-facts persistence layer
described above, standard Supabase project environment variables (project
URL and API key) would also be needed — see `supabase/README.md`; this is
independent of the two keys above.

## Adding a new state

Per the comment in `src/states/registry.ts`, wiring up a new state is
meant to be additive and self-contained:

1. Create `src/states/<state>/` with:
   - `sources.ts` — `SourceMeta` citations for every dataset you'll use.
   - `layers.ts` — a `LayerDefinition[]` describing that state's layers.
   - `layerFetchers.ts` — a `bbox -> Promise<FeatureCollection>` fetcher
     per layer (usually querying that state's ArcGIS endpoints via
     `src/lib/gis/arcgis.ts`).
   - `data/` — any hand-curated static datasets (e.g. known existing data
     centers in that state).
   - `index.ts` — export a `StateDefinition` combining the above, using
     the real bounds/center already present for that state in
     `src/states/directory.ts`.
2. Register the new fetchers in `src/lib/gis/stateGis.ts`.
3. Replace that state's stub entry in `LIVE_STATES` in
   `src/states/registry.ts`.

Nothing in the map, layer panel, or analysis engine needs to change —
they all read from the registry / the active `StateDefinition`'s layer
list, and the analysis modules (`power.ts`, `water.ts`, etc.) already
work against any state's registered layers and the nationwide data
sources.

## Confidence labeling convention

Every data point surfaced anywhere in the UI carries one of four
confidence levels (`Confidence` type in `src/lib/types.ts`), enforced
consistently across analysis modules and Supabase research data:

- **`fact`** — directly sourced from an authoritative dataset (e.g. a
  government API response).
- **`estimated`** — derived via an explicit, documented model or formula
  (e.g. estimated PUE, estimated construction cost).
- **`proxy`** — a related-but-not-equivalent measurement standing in for
  the thing we actually want to know (e.g. population density as a proxy
  for grid demand pressure; broadband subscription rate as a proxy for
  long-haul fiber availability).
- **`unknown`** — explicitly not knowable from available data (e.g.
  substation interconnection headroom, which requires a formal utility
  study).

This distinction is the core design principle of the whole project: the
app is careful never to present a proxy or an estimate as if it were a
verified fact.

## Scripts

- `scripts/county_population_density.py` — generates
  `data/county_population_density.csv` (and the JSON copy consumed at
  runtime, `src/lib/gis/data/countyPopulationDensity.json`) from Census
  Population Estimates Program (PEP) and Gazetteer files. Re-run this if
  you need to refresh the density figures used by the power/noise
  analysis modules.

## Reference project

`reference/nationwide-advisor/` is a self-contained earlier prototype
(a Vite + React app) kept in the repo for reference — it's where the
current national state-boundary GeoJSON (`/api/us-boundary`) and the
Census-derived state directory data originated from. It is not built or
run as part of the main Next.js app.
