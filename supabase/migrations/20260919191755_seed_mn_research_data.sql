-- Seed Minnesota research content compiled from the state research
-- template, following the same schema used for Washington.

-- ---------------------------------------------------------------------
-- Data sources catalog (Section 32 + live-verified GIS endpoints)
-- ---------------------------------------------------------------------
insert into public.data_sources
  (name, url, description, category, agency, state_code, gis_api_url, download_url, data_format, last_updated_label, license, quality, methodology, reliability_note)
values
  ('Electric Power Transmission Lines (national HIFLD-schema mirror)',
   'https://services1.arcgis.com/Hp6G80Pky0om7QvQ/ArcGIS/rest/services/Electric_Power_Transmission_Lines/FeatureServer/0',
   'Transmission line geometry and voltage class covering MN.', 'Transmission', 'HIFLD-derived (hosted mirror)', 'MN',
   'https://services1.arcgis.com/Hp6G80Pky0om7QvQ/ArcGIS/rest/services/Electric_Power_Transmission_Lines/FeatureServer/0',
   'https://services1.arcgis.com/Hp6G80Pky0om7QvQ/ArcGIS/rest/services/Electric_Power_Transmission_Lines/FeatureServer/0',
   'ArcGIS FeatureServer / GeoJSON', 'live', 'Public (HIFLD-derived)', 'MEDIUM',
   'MnGeo''s own official transmission-line dataset was withdrawn (Commerce could no longer keep it accurate); this national mirror is the verified live fallback.',
   'OWNER field is frequently "NOT AVAILABLE" for MN records — a known HIFLD data-quality gap.'),

  ('Electric Substations (national HIFLD-schema mirror)',
   'https://services5.arcgis.com/HDRa0B57OVrv2E1q/ArcGIS/rest/services/Electric_Substations/FeatureServer/0',
   'Substation point locations, filtered to MN.', 'Substations', 'HIFLD-derived (hosted mirror)', 'MN',
   'https://services5.arcgis.com/HDRa0B57OVrv2E1q/ArcGIS/rest/services/Electric_Substations/FeatureServer/0',
   'https://services5.arcgis.com/HDRa0B57OVrv2E1q/ArcGIS/rest/services/Electric_Substations/FeatureServer/0',
   'ArcGIS FeatureServer / GeoJSON', 'live', 'Public (HIFLD-derived)', 'MEDIUM',
   'Queried where STATE=''MN''.', 'NAME field is frequently a generic "UNKNOWN######" placeholder. Available MW/headroom is not public data regardless.'),

  ('Minnesota Electric Utility Service Areas (EUSA)', 'https://enterprise.gisdata.mn.gov/aghost/rest/services/us_mn_state_mngeo/util_eusa/FeatureServer/0',
   'Polygons showing which electric utility (municipal/cooperative/investor-owned) serves each part of Minnesota.', 'Utilities', 'MnGeo / MN PUC', 'MN',
   'https://enterprise.gisdata.mn.gov/aghost/rest/services/us_mn_state_mngeo/util_eusa/FeatureServer/0',
   'https://enterprise.gisdata.mn.gov/aghost/rest/services/us_mn_state_mngeo/util_eusa/FeatureServer/0',
   'ArcGIS FeatureServer / GeoJSON', 'Jan 2026 vintage', 'Public (MnGeo / MN PUC)', 'HIGH', null, null),

  ('EIA-860 / EIA-923', 'https://www.eia.gov/electricity/data.php', 'Plants, capacity, fuel, lat/lon; plant-level generation and fuel.',
   'Generation', 'EIA', null, null, 'https://www.eia.gov/electricity/data.php', 'CSV / API', 'annual', 'public', 'HIGH', null, null),

  ('Minnesota DNR Public Waters Inventory', 'https://enterprise.gisdata.mn.gov/aghost/rest/services/us_mn_state_dnr/water_mn_public_waters/FeatureServer',
   'Statutorily-designated public-water watercourses (layer 0) and basin/lake/wetland delineations (layer 1).', 'Hydrography', 'Minnesota DNR', 'MN',
   'https://enterprise.gisdata.mn.gov/aghost/rest/services/us_mn_state_dnr/water_mn_public_waters/FeatureServer',
   'https://enterprise.gisdata.mn.gov/aghost/rest/services/us_mn_state_dnr/water_mn_public_waters/FeatureServer',
   'ArcGIS FeatureServer / GeoJSON', 'live', 'Public (Minnesota DNR)', 'HIGH', null, null),

  ('Minnesota DNR Watersheds (HUC hierarchy)', 'https://enterprise.gisdata.mn.gov/aghost/rest/services/us_mn_state_dnr/geos_dnr_watersheds/FeatureServer',
   '9 sublayers from pour points up to HUC02; HUC8 = layer 6.', 'Hydrography', 'Minnesota DNR', 'MN', null,
   'https://enterprise.gisdata.mn.gov/aghost/rest/services/us_mn_state_dnr/geos_dnr_watersheds/FeatureServer',
   'ArcGIS FeatureServer / GeoJSON', 'live', 'Public (Minnesota DNR)', 'HIGH', 'Not yet wired into the app''s analysis output.', null),

  ('DNR Water Appropriation Permits (MPARS)', 'https://webapps11.dnr.state.mn.us/mpars/', 'Water withdrawal permit system.',
   'Water rights', 'Minnesota DNR', 'MN', null, null, 'Login-gated web app', 'n/a', 'restricted', 'NOT PUBLICLY QUERYABLE',
   'No public REST/GIS endpoint exists for this data as of 2026-09-19 — MPARS is a transactional, login-gated application, not an open data service.',
   'Searched the full MnGeo Commons DCAT catalog (2,563 datasets) — zero matches for appropriation/water-use-permit data.'),

  ('Minnesota Broadband Fiber Coverage (DEED / Connected Nation MN)',
   'https://services.arcgis.com/R0IGaIgf2sox9aCY/arcgis/rest/services/MN_Thiessen_ByTech_2024_12_16/FeatureServer/12',
   'Dissolved coverage-area polygons by broadband technology, filtered to Fiber.', 'Fiber', 'MN DEED Office of Broadband Development', 'MN',
   'https://services.arcgis.com/R0IGaIgf2sox9aCY/arcgis/rest/services/MN_Thiessen_ByTech_2024_12_16/FeatureServer/12',
   'https://services.arcgis.com/R0IGaIgf2sox9aCY/arcgis/rest/services/MN_Thiessen_ByTech_2024_12_16/FeatureServer/12',
   'ArcGIS FeatureServer / GeoJSON', '2024-12-16', 'Public (MN DEED)', 'MEDIUM',
   'Thiessen-polygon dissolve by technology type — a coarse coverage-area proxy, not address-level or long-haul route data.', null),

  ('Minnesota Geospatial Commons (parcels, environmental)', 'https://gis.data.mn.gov', 'Statewide GIS catalog.', 'Environmental', 'MnGeo', 'MN',
   null, 'https://gis.data.mn.gov', 'varies', 'rolling', 'public', 'HIGH for individual layers', null, null),

  ('Minnesota Conservation Easements — RIM Reserve', 'https://enterprise.gisdata.mn.gov/aghost/rest/services/us_mn_state_bwsr/bdry_bwsr_rim_cons_easements/FeatureServer/0',
   'State-funded perpetual conservation easement polygons.', 'Environmental', 'MN Board of Water & Soil Resources', 'MN',
   'https://enterprise.gisdata.mn.gov/aghost/rest/services/us_mn_state_bwsr/bdry_bwsr_rim_cons_easements/FeatureServer/0',
   'https://enterprise.gisdata.mn.gov/aghost/rest/services/us_mn_state_bwsr/bdry_bwsr_rim_cons_easements/FeatureServer/0',
   'ArcGIS FeatureServer / GeoJSON', 'live', 'Public (BWSR)', 'HIGH', null, null),

  ('Minnesota Plan Parcels Open (opt-in counties)', 'https://enterprise.gisdata.mn.gov/aghost/rest/services/us_mn_state_mngeo/plan_parcels_open/FeatureServer/1',
   'Parcel boundaries, compiled from counties that opted in to share data with MnGeo (2.71M parcels).', 'Parcels', 'MnGeo', 'MN',
   'https://enterprise.gisdata.mn.gov/aghost/rest/services/us_mn_state_mngeo/plan_parcels_open/FeatureServer/1',
   'https://enterprise.gisdata.mn.gov/aghost/rest/services/us_mn_state_mngeo/plan_parcels_open/FeatureServer/1',
   'ArcGIS FeatureServer / GeoJSON', 'live', 'Public (MnGeo)', 'MEDIUM',
   'NOT statewide-complete — opt-in counties only, with variable per-county field completeness (owner/assessed value often null).',
   'Not wired into the app — coverage caveat too significant for an unqualified "parcels" layer.'),

  ('US Census / ACS', 'https://api.census.gov/data/2022/acs/acs5', 'Population, density, households, median income.',
   'Population', 'US Census Bureau', null, null, 'https://api.census.gov/data/2022/acs/acs5', 'API', 'annual', 'public', 'HIGH', null, null),

  ('FEMA National Flood Hazard Layer', 'https://hazards.fema.gov/arcgis/rest/services/public/NFHL/MapServer/28', 'Flood zone polygons.',
   'Flood', 'FEMA', null, 'https://hazards.fema.gov/arcgis/rest/services/public/NFHL/MapServer/28',
   'https://hazards.fema.gov/arcgis/rest/services/public/NFHL/MapServer/28', 'ArcGIS MapServer / GeoJSON', 'rolling', 'public', 'HIGH', null, null),

  ('Minnesota business incentives / tax exemptions', '', 'Data center sales tax exemption and related incentive programs.',
   'Incentives', 'Minnesota Legislature / DEED', 'MN', null, null, 'n/a', 'varies', 'public', 'TO SOURCE', null, null)
on conflict do nothing;

-- ---------------------------------------------------------------------
-- Utilities (Section 3)
-- ---------------------------------------------------------------------
insert into public.utilities (state_code, name, utility_type, is_balancing_authority, transmission_owner, distribution_utility, website, large_load_notes, notes)
values
  ('MN', 'Xcel Energy', 'investor_owned', false, null, 'Xcel Energy', 'https://www.xcelenergy.com', 'Search: "Xcel Energy large load interconnection".',
   'Largest investor-owned utility in MN.'),
  ('MN', 'Minnesota Power', 'investor_owned', false, null, 'Minnesota Power', 'https://www.mnpower.com', 'Search: "Minnesota Power large load request".',
   'ALLETE subsidiary serving northeastern Minnesota.'),
  ('MN', 'Otter Tail Power', 'investor_owned', false, null, 'Otter Tail Power', 'https://www.otpco.com', null, null),
  ('MN', 'Rochester Public Utilities', 'municipal', false, null, 'Rochester Public Utilities', 'https://www.rpu.org', null, null)
on conflict (state_code, name) do nothing;

-- ---------------------------------------------------------------------
-- Natural hazards (Section 22 — MN-specific set)
-- ---------------------------------------------------------------------
insert into public.hazards (state_code, hazard_type, risk_level, description)
values
  ('MN', 'extreme_cold', 'high', 'Sustained sub-zero winter cold; equipment cold-weather rating and heat tracing matter.'),
  ('MN', 'ice_storm', 'high', 'Ice accumulation on transmission/distribution lines and structures.'),
  ('MN', 'tornado', 'high', 'Minnesota sits within Tornado Alley''s northern extent — seasonal severe convective risk.'),
  ('MN', 'severe_thunderstorm', 'high', 'Straight-line wind and hail risk, especially in summer.'),
  ('MN', 'extreme_heat', 'moderate', 'Rising risk; a design consideration for cooling systems sized primarily for cold winters.'),
  ('MN', 'flooding', 'moderate', 'Riverine and spring-snowmelt flooding, particularly along the Mississippi, Red, and Minnesota rivers.'),
  ('MN', 'earthquake', 'negligible', 'Negligible seismic risk.'),
  ('MN', 'hurricane', 'not_applicable', 'Not applicable — landlocked, non-coastal state.'),
  ('MN', 'wildfire', 'low', 'Localized risk in northern forested counties; not a statewide driver like in western states.'),
  ('MN', 'sea_level_rise', 'not_applicable', 'Not applicable — landlocked state.'),
  ('MN', 'volcanic', 'not_applicable', 'Not applicable to Minnesota.')
on conflict (state_code, hazard_type) do nothing;

-- ---------------------------------------------------------------------
-- Zoning (Section 17 — no statewide dataset, explicitly unresearched)
-- ---------------------------------------------------------------------
insert into public.zoning_jurisdictions (state_code, county, data_center_allowed, notes)
values
  ('MN', 'Hennepin', 'unknown', 'No statewide zoning dataset exists in Minnesota. Zoning TO RESEARCH per the Growth Management-equivalent local process.'),
  ('MN', 'Ramsey', 'unknown', 'Zoning TO RESEARCH.'),
  ('MN', 'Dakota', 'unknown', 'Zoning TO RESEARCH.'),
  ('MN', 'Olmsted', 'unknown', 'Rochester-area county (existing RPU utility footprint). Zoning TO RESEARCH.')
on conflict do nothing;

-- ---------------------------------------------------------------------
-- Incentives (Section 19)
-- ---------------------------------------------------------------------
insert into public.incentives (state_code, category, title, description, eligibility_notes, status, date_verified)
values
  ('MN', 'sales_tax_exemption', 'Minnesota data center sales tax exemption',
   'Minnesota offers a sales-and-use tax exemption for qualifying data centers meeting minimum investment/size thresholds.',
   'Eligibility rules, minimum investment, and duration must be pulled from current Minnesota Statutes and DEED guidance before relying on this.',
   'unknown', '2026-09-19')
on conflict do nothing;

-- ---------------------------------------------------------------------
-- Generic labeled facts
-- ---------------------------------------------------------------------
insert into public.research_facts (state_code, section_number, section_title, fact_key, label, value_text, as_of_date, notes)
values
  ('MN', 1, 'Transmission Lines', 'official_dataset_status', 'unknown',
   'MnGeo''s own official transmission-line/substation dataset (util-elec-trans) has been withdrawn — Commerce could not keep it accurate. A national HIFLD-schema mirror is used instead, with reduced attribute completeness (owner frequently unavailable).',
   '2026-09-19', 'Verified by live query on 2026-09-19; the withdrawn dataset''s old URL 301-redirects to the Commons homepage.'),
  ('MN', 2, 'Substations', 'available_mw', 'unknown', 'Not publicly available. Do not infer available capacity from substation size or transformer count.', '2026-09-19', null),
  ('MN', 4, 'ISO/RTO/Balancing Authority', 'organized_market', 'fact', 'Minnesota is primarily within the Midcontinent Independent System Operator (MISO) region.', '2026-09-19', null),
  ('MN', 7, 'Large-Load Interconnection', 'process', 'unknown', 'Utility-by-utility and MISO-queue research required; not standardized or centrally published.', '2026-09-19', null),
  ('MN', 9, 'Water Rights', 'appropriation_permit_data', 'unknown',
   'DNR''s water appropriation permit system (MPARS) is a login-gated transactional web application, not a public REST/GIS service. No live queryable endpoint exists.',
   '2026-09-19', 'Confirmed via full MnGeo Commons DCAT catalog search (2,563 datasets) plus direct probing of likely DNR ArcGIS hostnames — all returned 404/portal errors.'),
  ('MN', 12, 'Drought and Water Stress', 'methodology', 'unknown', 'No drought-declaration polygon layer or basin water-stress dataset is integrated yet — proxy per the doc would combine WRI Aqueduct 4.0, US Drought Monitor, and DNR groundwater sensitivity.', '2026-09-19', null),
  ('MN', 14, 'Fiber and Telecom', 'broadband_source', 'fact', 'MN DEED / Connected Nation MN publishes a live ArcGIS fiber-coverage layer (Thiessen-polygon dissolve by technology) — coarser than address-level, used as a connectivity proxy only.', '2026-09-19', null),
  ('MN', 16, 'Land', 'parcels_coverage', 'unknown', 'A statewide parcel service exists (2.71M parcels) but only covers counties that opted in to share data with MnGeo — not complete for all 87 counties.', '2026-09-19', null),
  ('MN', 17, 'Zoning', 'statewide_coverage', 'fact', 'No statewide zoning dataset exists; zoning is county/city level.', '2026-09-19', null),
  ('MN', 18, 'Moratoria and Regulation', 'state_moratorium', 'unknown', 'No statewide moratorium identified from sources reviewed as of 19 Sep 2026 — requires legal verification.', '2026-09-19', null),
  ('MN', 18, 'Moratoria and Regulation', 'mepa_review', 'fact', 'Minnesota Environmental Policy Act (MEPA) review, potentially including an Environmental Assessment Worksheet (EAW), applies to qualifying projects.', '2026-09-19', null),
  ('MN', 0, 'Overview', 'data_completeness_pct', 'fact', 'Roughly 75% per the source research template as of 19 Sep 2026.', '2026-09-19', 'Researcher: TBD (per source doc).')
on conflict (state_code, section_number, fact_key) do nothing;
