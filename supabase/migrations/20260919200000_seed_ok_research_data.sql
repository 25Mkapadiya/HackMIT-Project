-- Seed Oklahoma utilities/hazards/incentives following the same schema
-- used for Washington and Minnesota, so the Supabase-backed enrichment
-- (large-load contact matching, natural hazard exposure, tax incentives)
-- benefits Oklahoma too, not just the two states it was originally built for.

insert into public.utilities (state_code, name, utility_type, is_balancing_authority, distribution_utility, website, large_load_notes, notes)
values
  ('OK', 'Oklahoma Gas and Electric Company', 'investor_owned', false, 'Oklahoma Gas and Electric Company', 'https://www.oge.com',
   'Search: "OG&E large load interconnection".', 'Largest investor-owned utility in Oklahoma; within the Southwest Power Pool (SPP).'),
  ('OK', 'Public Service Company of Oklahoma', 'investor_owned', false, 'Public Service Company of Oklahoma', 'https://www.psoklahoma.com',
   'Search: "PSO large load interconnection". AEP subsidiary.', null),
  ('OK', 'Western Farmers Electric Cooperative', 'cooperative', false, 'Western Farmers Electric Cooperative', 'https://www.wfec.com', null, null)
on conflict (state_code, name) do nothing;

insert into public.hazards (state_code, hazard_type, risk_level, description)
values
  ('OK', 'tornado', 'high', 'Oklahoma sits within Tornado Alley — among the highest tornado frequency in the US.'),
  ('OK', 'severe_thunderstorm', 'high', 'Frequent severe convective storms, large hail, and straight-line wind, especially spring through early summer.'),
  ('OK', 'drought', 'moderate', 'Recurring drought exposure in western Oklahoma; see the live U.S. Drought Monitor layer for current conditions.'),
  ('OK', 'earthquake', 'moderate', 'Induced seismicity linked to wastewater injection has meaningfully raised earthquake frequency since the early 2010s, concentrated in central/north-central Oklahoma.'),
  ('OK', 'ice_storm', 'moderate', 'Periodic winter ice storms affect transmission/distribution infrastructure.'),
  ('OK', 'extreme_heat', 'moderate', 'Hot summers, relevant to cooling system sizing.'),
  ('OK', 'flooding', 'moderate', 'Riverine flooding along the Arkansas, Red, and Canadian river corridors.'),
  ('OK', 'wildfire', 'low', 'Elevated in western Oklahoma grassland/rangeland during drought conditions; not a statewide driver.'),
  ('OK', 'hurricane', 'not_applicable', 'Not applicable — landlocked, non-coastal state (remnant tropical systems can bring heavy rain, but hurricane-force wind exposure is negligible).'),
  ('OK', 'volcanic', 'not_applicable', 'Not applicable to Oklahoma.')
on conflict (state_code, hazard_type) do nothing;

insert into public.incentives (state_code, category, title, description, eligibility_notes, status, date_verified)
values
  ('OK', 'sales_tax_exemption', 'Oklahoma data center sales tax exemption',
   'Oklahoma offers a sales-and-use tax exemption for qualifying data centers meeting minimum investment/size thresholds.',
   'Eligibility rules, minimum investment, and duration must be pulled from current Oklahoma Statutes and Commerce Department guidance before relying on this.',
   'unknown', '2026-09-19')
on conflict do nothing;
