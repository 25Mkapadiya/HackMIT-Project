# Grid, a feasibility map for data center sites

## What it does

Grid is a map, not a form. You drop a pin anywhere in the U.S., describe the
facility you actually want to build, and the app tells you, with a number
attached to how sure it is, whether the ground under that pin can support it.

1. **It turns a pin into a real case, not a guess.** Click a point, set the
   IT load in MW, building count, cooling technology, cooling loop, and
   redundancy tier (N / N+1 / 2N), and the app treats that as a
   `ScenarioConfig` it can actually reason about, not a form submission that
   disappears into a database.
2. **It runs one pipeline of nine modules that hand work to each other
   instead of repeating it.** Power resolves the utility territory and
   nearest substation/transmission lines. Fiber finds the nearest IXP.
   Regulation and efficiency reuse power's utility-territory and
   population-density lookups instead of re-querying them. Water, land, and
   noise run their own independent checks. Development and gaps synthesize
   all seven into a cost range, a timeline, and a plain-English list of what
   still needs to be checked before this site is buildable.
3. **It refuses to pretend an estimate is a fact.** Every single number the
   UI shows, grid demand pressure, estimated PUE, water stress, flood risk,
   noise impact, carries one of four labels: `fact` (straight from a
   government API), `estimated` (an explicit, documented formula), `proxy`
   (a related measurement standing in for the thing we actually want), or
   `unknown` (not knowable without a real utility or acoustics study). This
   is the actual point of the tool, not a footnote. A site that "looks good"
   because every unknown quietly defaulted to optimistic is worse than
   useless.
4. **It tells you what's missing, not just what's good.** The gaps module
   turns the whole analysis into a ranked list, `info` / `watch` /
   `likely_required`, so a proposal reads like a punch list a real developer
   could hand to an engineer, not a score.
5. **It compares candidates against each other and against reality.**
   Multiple dropped sites sit side by side in a comparison panel, and a
   separate graph panel overlays real European data center locations so a
   candidate's numbers have something outside the tool to be judged against.
6. **It covers all fifty states without faking coverage it doesn't have.**
   Every state carries its real Census-derived name, bounds, and FIPS code
   so the map and picker work everywhere. A state only gets analysis
   capability once someone has actually wired its layers and fetchers to
   that state's own GIS endpoints. Right now that's true for all fifty, and
   the split exists so the map can never silently claim more than it knows.
7. **It never asks the browser to hold a secret.** Every call to the Census
   Bureau, EIA, or a state's ArcGIS server happens inside a Next.js Route
   Handler, server-side. API keys never reach the client, and layer
   responses get cached at the edge instead of re-fetched on every pan.

## How we built it

- **Frontend:** Next.js 14 (App Router) + React 18 + TypeScript. MapLibre GL
  JS renders the map itself; Turf.js does the actual geospatial math
  (nearest-feature distance, point-in-polygon for flood zones and
  jurisdictions). One Zustand store (`useAppStore`) holds every piece of
  shared state: active state, layer visibility, propose mode, the list of
  scenarios and their results, comparison selection. Every panel
  (`TopBar`, `LayerControlPanel`, `ScenarioPanel`, `ImpactResults`,
  `ComparisonPanel`, `GraphPanel`) just reads and writes it.
- **Analysis engine:** nine independent TypeScript modules
  (`power.ts`, `fiber.ts`, `regulation.ts`, `efficiency.ts`, `water.ts`,
  `land.ts`, `noise.ts`, `development.ts`, `gaps.ts`), each returning
  strongly-typed `Metric<T>` values that always carry a confidence level and
  a source citation. A single orchestrator runs them in a fixed, deliberate
  order so downstream steps reuse upstream lookups instead of hitting the
  same government API twice.
- **Data sources:** the Census Bureau API (population, and ACS Subject Table
  S2801 as a broadband/connectivity proxy where the FCC only offers bulk
  downloads), the EIA API v2 (nearby generation capacity and demand), each
  state's own ArcGIS FeatureServer/MapServer endpoints for power, water, and
  connectivity infrastructure, and HIFLD's national infrastructure extracts
  for anything that doesn't vary by state. All of it goes through one ArcGIS
  query helper and a `(stateId, layerId) -> fetcher` registry, so a layer
  that isn't implemented for a given state degrades to an empty
  `FeatureCollection` instead of breaking the map.
- **Backend:** an optional Supabase/Postgres layer for the facts no live API
  exposes: zoning, incentives, known utility contacts, persisted with the
  same FACT/PROXY/ESTIMATE/UNKNOWN discipline as the live analysis, seeded
  today for Wisconsin and Illinois. The map, layers, and analysis pipeline
  all work without it. It exists purely so hand-researched knowledge doesn't
  evaporate between sessions.
- **State system:** every one of the fifty states is a self-contained folder
  (`sources.ts`, `layers.ts`, `layerFetchers.ts`, `index.ts`) that plugs into
  one registry. Adding or fixing a state never touches the map, the panels,
  or the analysis modules. They only ever read the active state's
  definition.

Built across ~85 commits by a two-person team, with all fifty states wired
to real per-state GIS endpoints rather than a handful of demo states, because
the interesting engineering problem here wasn't the map. It was making
"we don't actually know that yet" a first-class value the whole pipeline
carries through to the screen.
