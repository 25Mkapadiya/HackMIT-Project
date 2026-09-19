# Supabase backend

Project: **HackMIT** (`vsfjoqvjixvuutqczxdr`, `us-west-2`).

## What's in the database

Two layers, matching the two-layer build described in the state research
template:

**National layer** (pre-existing — `create_electricity_data_schema`,
`seed_data_sources_and_states`):
- `states` — all 50 states + DC.
- `state_annual_electricity`, `grid_hourly_generation` — Ember/EIA electricity
  data, currently empty pending a backfill job.

**State research layer** (added in this pass — see `migrations/`):
- `data_sources` — the Section 32 sources catalog (category, agency, GIS/API
  URL, license, quality, methodology), extended from the original 3-column
  table. `state_code` is null for national datasets, set for state GIS layers.
- `research_facts` — a generic labeled-fact store: one row per
  FACT/PROXY/ESTIMATE/UNKNOWN claim in a state doc, keyed by
  `(state_code, section_number, fact_key)`. This is the fallback for every
  research item that doesn't warrant its own table.
- `utilities` — service territories, utility type, transmission/distribution
  owner, and large-load process/contact per utility (Section 3, 4, 7).
- `existing_data_centers` — known facilities with FACT/ESTIMATE/UNKNOWN MW
  confidence (Section 15). The app's `/api/gis/data-centers` route now reads
  this table instead of the hand-curated TS array, falling back to the
  static array if Supabase env vars aren't set.
- `zoning_jurisdictions`, `incentives`, `hazards` — Sections 17-19, 22.
- `scenarios`, `scenario_analyses` — persistence for the app's "propose a
  site" feature. `POST /api/analysis` now saves every scenario + its
  computed `ScenarioAnalysis` (as JSONB) after running it, best-effort
  (never blocks or fails the response).

Currently seeded for Washington only, matching the research doc it was
built from. The schema is state-agnostic — adding another state's data
means new rows, not new tables.

## Row-level security

The app has no auth layer. Reference tables (`data_sources`, `utilities`,
`existing_data_centers`, `zoning_jurisdictions`, `incentives`, `hazards`,
`research_facts`) are public-read only. `scenarios` / `scenario_analyses`
allow anon insert/select since there's no session concept to scope writes
to — revisit with Supabase Auth (`auth.uid()`-scoped policies) if the app
grows real users.

## Env vars

```
NEXT_PUBLIC_SUPABASE_URL=https://vsfjoqvjixvuutqczxdr.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=<anon key, see .env.example>
```

Both are safe to expose client-side — access is governed by RLS, not key
secrecy. The app only uses them server-side today (`src/lib/supabase/server.ts`).

## Regenerating types

After adding a migration, regenerate `src/lib/supabase/types.ts` via the
Supabase MCP `generate_typescript_types` tool (or `supabase gen types
typescript` if using the CLI) rather than hand-editing.
