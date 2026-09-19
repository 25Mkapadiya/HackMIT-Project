-- Extend the existing national "data_sources"/"states" layer with the
-- state-research layer described in the Washington research template:
-- Section 32 (sources catalog), Section 3 (utilities), Section 15
-- (existing data centers), Section 17 (zoning), Section 19 (incentives),
-- Section 22 (hazards), and a generic fact store for every other
-- FACT/PROXY/ESTIMATE/UNKNOWN line item in the doc. Also adds persistence
-- for user-proposed scenarios and their computed analyses, which today
-- only live in browser memory (zustand).

-- ---------------------------------------------------------------------
-- 1. Extend data_sources to match the Section 32 "Data Sources Table"
-- ---------------------------------------------------------------------
alter table public.data_sources
  add column if not exists category text,
  add column if not exists agency text,
  add column if not exists state_code text references public.states(code),
  add column if not exists gis_api_url text,
  add column if not exists download_url text,
  add column if not exists data_format text,
  add column if not exists last_updated_label text,
  add column if not exists license text,
  add column if not exists quality text,
  add column if not exists methodology text,
  add column if not exists reliability_note text,
  add column if not exists updated_at timestamptz not null default now();

comment on column public.data_sources.category is 'Section 32 category, e.g. Transmission, Substations, Water rights.';
comment on column public.data_sources.state_code is 'Null for national/50-state datasets (EIA, FCC, Census); set for state-specific GIS layers.';
comment on column public.data_sources.quality is 'Free-text reliability label as written in the source doc, e.g. "HIGH for BPA, incomplete otherwise".';

-- ---------------------------------------------------------------------
-- 2. Generic labeled-fact store — one row per FACT/PROXY/ESTIMATE/UNKNOWN
--    line item in a state research doc, keyed to the doc's own section
--    numbering so the schema can be re-used for other states verbatim.
-- ---------------------------------------------------------------------
create table if not exists public.research_facts (
  id bigserial primary key,
  state_code text not null references public.states(code),
  section_number smallint not null,
  section_title text not null,
  fact_key text not null,
  label text not null check (label in ('fact', 'proxy', 'estimate', 'unknown')),
  value_text text,
  value_numeric numeric,
  unit text,
  as_of_date date,
  source_id integer references public.data_sources(id),
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (state_code, section_number, fact_key)
);
comment on table public.research_facts is 'One row per discrete claim in a state research template (LABELING RULES: fact/proxy/estimate/unknown), e.g. "large_load_min_mw" -> unknown, "state_moratorium" -> fact.';

-- ---------------------------------------------------------------------
-- 3. Utilities & service territories (Section 3 + large-load contact
--    tracking referenced throughout Sections 4, 6, 7)
-- ---------------------------------------------------------------------
create table if not exists public.utilities (
  id bigserial primary key,
  state_code text not null references public.states(code),
  name text not null,
  utility_type text check (
    utility_type in ('investor_owned', 'municipal', 'cooperative', 'public_utility_district',
                      'federal_power_marketing_administration', 'other')
  ),
  is_balancing_authority boolean not null default false,
  transmission_owner text,
  distribution_utility text,
  website text,
  large_load_process_url text,
  large_load_contact text,
  large_load_notes text,
  service_territory_source_id integer references public.data_sources(id),
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (state_code, name)
);

-- ---------------------------------------------------------------------
-- 4. Existing data centers (Section 15) — replaces the hand-curated
--    TS array so it can be queried/updated without a redeploy.
-- ---------------------------------------------------------------------
create table if not exists public.existing_data_centers (
  id bigserial primary key,
  state_code text not null references public.states(code),
  name text not null,
  operator text,
  campus text,
  city text,
  latitude numeric(9, 6) not null,
  longitude numeric(9, 6) not null,
  known_mw numeric,
  estimated_mw numeric,
  mw_confidence text not null default 'unknown' check (mw_confidence in ('fact', 'estimate', 'unknown')),
  square_footage numeric,
  acres numeric,
  status text,
  cloud_provider text,
  opening_date date,
  notes text,
  source_id integer references public.data_sources(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists existing_data_centers_state_idx on public.existing_data_centers (state_code);

-- ---------------------------------------------------------------------
-- 5. Zoning jurisdictions (Section 17) — county/city level, no
--    statewide layer exists per the doc, so this is hand-curated.
-- ---------------------------------------------------------------------
create table if not exists public.zoning_jurisdictions (
  id bigserial primary key,
  state_code text not null references public.states(code),
  county text not null,
  municipality text,
  zoning_district text,
  data_center_allowed text not null default 'unknown' check (
    data_center_allowed in ('by_right', 'conditional_use', 'prohibited', 'unknown')
  ),
  notes text,
  date_researched date,
  source_id integer references public.data_sources(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ---------------------------------------------------------------------
-- 6. Incentives & regulation (Sections 18-19) — dated, since the doc
--    calls this layer "changes fast - treat it as maintained, not static".
-- ---------------------------------------------------------------------
create table if not exists public.incentives (
  id bigserial primary key,
  state_code text not null references public.states(code),
  category text not null check (
    category in ('sales_tax_exemption', 'property_tax_exemption', 'electricity_tax_exemption',
                 'moratorium', 'permitting_requirement', 'community_benefit', 'other')
  ),
  title text not null,
  description text,
  eligibility_notes text,
  eligible_counties text[],
  status text not null default 'unknown' check (status in ('active', 'expired', 'proposed', 'unknown')),
  effective_date date,
  expiry_date date,
  date_verified date not null,
  source_id integer references public.data_sources(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ---------------------------------------------------------------------
-- 7. Natural hazards (Section 22) — state-specific set, not reused
--    across states verbatim per the doc's own instruction.
-- ---------------------------------------------------------------------
create table if not exists public.hazards (
  id bigserial primary key,
  state_code text not null references public.states(code),
  hazard_type text not null,
  risk_level text not null check (
    risk_level in ('negligible', 'low', 'moderate', 'high', 'not_applicable')
  ),
  description text,
  source_id integer references public.data_sources(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (state_code, hazard_type)
);

-- ---------------------------------------------------------------------
-- 8. Scenarios & analyses — persistence for the app's core "propose a
--    site" feature, which today only lives in browser memory.
-- ---------------------------------------------------------------------
create table if not exists public.scenarios (
  id uuid primary key default gen_random_uuid(),
  state_code text not null references public.states(code),
  label text not null,
  lng double precision not null,
  lat double precision not null,
  mw_load numeric not null,
  buildings integer not null default 1,
  cooling_technology text not null,
  loop_type text not null check (loop_type in ('closed_loop', 'open_loop')),
  cooling_medium text not null check (cooling_medium in ('air_cooled', 'water_cooled')),
  acreage_override numeric,
  redundancy text not null check (redundancy in ('N', 'N+1', '2N')),
  client_id text,
  created_at timestamptz not null default now()
);
create index if not exists scenarios_state_idx on public.scenarios (state_code);
create index if not exists scenarios_client_idx on public.scenarios (client_id);

create table if not exists public.scenario_analyses (
  id bigserial primary key,
  scenario_id uuid not null references public.scenarios(id) on delete cascade,
  generated_at timestamptz not null default now(),
  power jsonb,
  fiber jsonb,
  regulation jsonb,
  water jsonb,
  land jsonb,
  development jsonb,
  gaps jsonb
);
create index if not exists scenario_analyses_scenario_idx on public.scenario_analyses (scenario_id);

-- ---------------------------------------------------------------------
-- Row level security. This app has no auth layer yet, so reference/
-- research tables are public-read, write-locked to the service role;
-- scenarios are the one user-generated table and stay open read/write
-- to anon since there is no session concept to scope them to. Revisit
-- once Supabase Auth is added (scope scenarios by auth.uid()).
-- ---------------------------------------------------------------------
alter table public.data_sources enable row level security;
alter table public.research_facts enable row level security;
alter table public.utilities enable row level security;
alter table public.existing_data_centers enable row level security;
alter table public.zoning_jurisdictions enable row level security;
alter table public.incentives enable row level security;
alter table public.hazards enable row level security;
alter table public.scenarios enable row level security;
alter table public.scenario_analyses enable row level security;

drop policy if exists "public read data_sources" on public.data_sources;
create policy "public read data_sources" on public.data_sources for select using (true);

drop policy if exists "public read research_facts" on public.research_facts;
create policy "public read research_facts" on public.research_facts for select using (true);

drop policy if exists "public read utilities" on public.utilities;
create policy "public read utilities" on public.utilities for select using (true);

drop policy if exists "public read existing_data_centers" on public.existing_data_centers;
create policy "public read existing_data_centers" on public.existing_data_centers for select using (true);

drop policy if exists "public read zoning_jurisdictions" on public.zoning_jurisdictions;
create policy "public read zoning_jurisdictions" on public.zoning_jurisdictions for select using (true);

drop policy if exists "public read incentives" on public.incentives;
create policy "public read incentives" on public.incentives for select using (true);

drop policy if exists "public read hazards" on public.hazards;
create policy "public read hazards" on public.hazards for select using (true);

drop policy if exists "public read scenarios" on public.scenarios;
create policy "public read scenarios" on public.scenarios for select using (true);
drop policy if exists "public insert scenarios" on public.scenarios;
create policy "public insert scenarios" on public.scenarios for insert with check (true);
drop policy if exists "public delete own scenarios" on public.scenarios;
create policy "public delete own scenarios" on public.scenarios for delete using (true);

drop policy if exists "public read scenario_analyses" on public.scenario_analyses;
create policy "public read scenario_analyses" on public.scenario_analyses for select using (true);
drop policy if exists "public insert scenario_analyses" on public.scenario_analyses;
create policy "public insert scenario_analyses" on public.scenario_analyses for insert with check (true);
