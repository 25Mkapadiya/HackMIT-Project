-- The app generates scenario ids client-side as short strings ("site-1"),
-- not UUIDs. Switch the primary key to text so persisted scenarios use
-- the same id the browser already tracks (analysisByScenario, comparisonIds).
alter table public.scenario_analyses drop constraint scenario_analyses_scenario_id_fkey;
alter table public.scenario_analyses alter column scenario_id type text;

alter table public.scenarios alter column id drop default;
alter table public.scenarios alter column id type text;

alter table public.scenario_analyses
  add constraint scenario_analyses_scenario_id_fkey
  foreign key (scenario_id) references public.scenarios(id) on delete cascade;
