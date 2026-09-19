-- Seed Washington research content compiled from the state research
-- template (researcher: Brandon, last updated 19 Sep 2026).

-- ---------------------------------------------------------------------
-- Data sources catalog (Section 32 + the per-section source citations)
-- ---------------------------------------------------------------------
insert into public.data_sources
  (name, url, description, category, agency, state_code, gis_api_url, download_url, data_format, last_updated_label, license, quality, methodology, reliability_note)
values
  ('BPA Transmission Lines', 'https://services3.arcgis.com/Iz3chmSt4P7oOoZy/arcgis/rest/services/BPA_TransmissionLines_View/FeatureServer/0',
   'Line geometry plus operating voltage for BPA-owned transmission.', 'Transmission', 'BPA', 'WA',
   'https://services3.arcgis.com/Iz3chmSt4P7oOoZy/arcgis/rest/services/BPA_TransmissionLines_View/FeatureServer/0',
   'https://services3.arcgis.com/Iz3chmSt4P7oOoZy/arcgis/rest/services/BPA_TransmissionLines_View/FeatureServer/0',
   'ArcGIS FeatureServer / GeoJSON', 'TO CONFIRM', 'TO CONFIRM', 'HIGH for BPA lines, INCOMPLETE for non-BPA lines',
   'Query as GeoJSON via the FeatureServer.', 'Non-BPA transmission (Avista, PacifiCorp, PSE, Grant PUD, others) not covered; fill from OSM power=line and flag unverified.'),

  ('OSM + SeerAI HIFLD Substation Archive', 'https://www.openstreetmap.org/', 'Substation point locations.',
   'Substations', 'OSM / SeerAI', 'WA', null, 'https://source.coop', 'OSM XML/PBF, Parquet', 'rolling',
   'ODbL 1.0 (OSM) / CC BY 4.0 (SeerAI HIFLD archive)', 'LOW-MEDIUM, flag unverified',
   'HIFLD itself shut down Aug 2025; SeerAI hosts an archive on source.coop.',
   'Roughly 40-60% of legacy HIFLD substation records did not correspond to real substations.'),

  ('Washington Electric Utility Service Areas', 'https://gis.ecology.wa.gov/serverext/rest/services/CPR/CPR/FeatureServer/0',
   'Polygons showing which electric utility serves each part of Washington.', 'Utilities', 'WA Dept. of Ecology', 'WA',
   'https://gis.ecology.wa.gov/serverext/rest/services/CPR/CPR/FeatureServer/0',
   'https://gis.ecology.wa.gov/serverext/rest/services/CPR/CPR/FeatureServer/0',
   'ArcGIS FeatureServer / GeoJSON', 'TO CONFIRM', 'TO CONFIRM', 'MEDIUM - not an official service determination',
   'Point-in-polygon lookup against utility-provided/UTC service area boundaries.',
   'Ecology: "these boundaries should not be treated as official service determinations."'),

  ('EIA-860 / EIA-923', 'https://www.eia.gov/electricity/data.php', 'Plants, capacity, fuel, lat/lon; plant-level generation and fuel.',
   'Generation', 'EIA', null, null, 'https://www.eia.gov/electricity/data.php', 'CSV / API', 'annual', 'public', 'HIGH',
   'All plants >=1MW with lat/lon, capacity, fuel.', null),

  ('EIA-930 + BPA Transmission Path Flows / ATC', 'https://transmission.bpa.gov/Business/Operations/Paths/default.aspx',
   'Hourly BA demand/generation/interchange; BPA path flows and Available Transfer Capability.', 'Grid conditions', 'EIA / BPA', 'WA',
   null, 'https://www.eia.gov/opendata/', 'API / web', 'hourly', 'public', 'HIGH for flows, PROXY for headroom',
   'ATC describes transfer capability across the network.',
   'ATC is NOT a statement that a given substation can accept a new 300 MW load.'),

  ('EPA Public Water System Service Area Boundaries', 'https://www.epa.gov/ground-water-and-drinking-water/public-water-system-service-areas',
   'Community water system service area boundaries, national.', 'Water systems', 'EPA', null, null,
   'https://www.epa.gov/ground-water-and-drinking-water/public-water-system-service-areas',
   'GIS boundaries', 'v3 Mar 2026', 'public', 'HIGH, some boundaries modeled',
   '44,000+ community systems, roughly 99% of reported population served.', null),

  ('Washington Water Resources Web Map + Water Resources ArcGIS REST', 'https://appswr.ecology.wa.gov/WaterRightsMap',
   'Water rights, places of use, wells/device points, water bodies, diversions, instream-flow rules, drought areas.',
   'Water rights', 'WA Dept. of Ecology', 'WA', 'https://gis.ecology.wa.gov/serverext/rest/services/Authoritative/WR/MapServer',
   'https://appswr.ecology.wa.gov/WaterRightsMap', 'Web map + ArcGIS MapServer / GeoJSON', 'rolling', 'TO CONFIRM', 'HIGH',
   'Prior-appropriation water rights system; many basins closed to new appropriations.', null),

  ('WASHD Hydrography + USGS Washington Water Data', 'https://www.ecology.wa.gov/research-data/data-resources/geographic-information-systems-gis/hydrography-program-washd',
   'Streams, rivers, canals, lakes, ponds; real-time/historical surface water, groundwater, water quality.',
   'Hydrography', 'WA Dept. of Ecology / USGS', 'WA', null, 'https://wa.water.usgs.gov/data/', 'GIS / API', 'rolling', 'public', 'HIGH',
   'Transitioning to elevation-derived 3D Hydrography.', null),

  ('Washington Groundwater Resources', 'https://ecology.wa.gov/water-shorelines/water-quality/groundwater/groundwater-resources',
   'Groundwater studies, wells, maps, groundwater GIS.', 'Groundwater', 'WA Dept. of Ecology / USGS', 'WA', null,
   'https://ecology.wa.gov/water-shorelines/water-quality/groundwater/groundwater-resources', 'GIS / reports', 'rolling', 'public', 'MEDIUM',
   'Columbia Plateau basalt aquifer system is the primary aquifer for eastern WA siting.', null),

  ('FCC National Broadband Map / BDC + PeeringDB', 'https://broadbandmap.fcc.gov/home', 'Retail broadband availability; IXP locations as a latency proxy.',
   'Fiber', 'FCC / PeeringDB', null, null, 'https://broadbandmap.fcc.gov/home', 'API', 'semiannual', 'public / CC BY 4.0', 'PROXY only',
   'Long-haul routes are not public; Seattle (Westin Building Exchange) is the regional carrier hotel.',
   'Label FCC broadband as a connectivity proxy, not long-haul fiber availability.'),

  ('PNNL IM3 Open Source Data Center Atlas + dcmap.us', 'https://immm-sfa.github.io/datacenter-atlas/', 'Data center facility locations; dcmap.us adds MW estimates.',
   'Data centers', 'PNNL / DOE / dcmap', 'WA', null, 'https://immm-sfa.github.io/datacenter-atlas/', 'GeoPackage + CSV', 'Aug 2025',
   'ODbL 1.0 (PNNL) / unstated (dcmap.us)', 'MEDIUM', 'OSM-derived; PNNL atlas has no MW field.', 'Confirm dcmap.us license before ingesting.'),

  ('County assessor parcel data', '', 'Parcel boundaries, acreage, ownership, land use, property value.', 'Parcels', 'WA counties', 'WA', null, null,
   'varies by county', 'varies', 'varies', 'TO SOURCE', 'County-assessor level; WA Geospatial Open Data Portal aggregates some.', null),

  ('County and city zoning codes', '', 'Industrial zoning / data-center-specific zoning / conditional use.', 'Zoning', 'WA counties / cities', 'WA', null, null,
   'n/a', 'varies', 'n/a', 'hand-curated', 'No statewide zoning layer exists; WA zoning is county/city level under the Growth Management Act.', null),

  ('WA Ecology Authoritative GIS (environmental/land use/tribal/WRIAs)', 'https://gis.ecology.wa.gov/serverext/rest/services/Authoritative/ECY/MapServer',
   'Land use, tribal lands, WRIAs, facilities and other environmental layers.', 'Environmental', 'WA Dept. of Ecology', 'WA',
   'https://gis.ecology.wa.gov/serverext/rest/services/Authoritative/ECY/MapServer',
   'https://gis.ecology.wa.gov/serverext/rest/services/Authoritative/ECY/MapServer', 'ArcGIS MapServer / GeoJSON', 'rolling', 'TO CONFIRM', 'HIGH', null, null),

  ('FEMA National Flood Hazard Layer + WA Ecology flood apps', 'https://www.fema.gov/flood-maps/national-flood-hazard-layer',
   'Flood zone polygons.', 'Flood', 'FEMA / WA Dept. of Ecology', 'WA', 'https://hazards.fema.gov/arcgis/rest/services/public/NFHL/MapServer/28',
   'https://www.fema.gov/flood-maps/national-flood-hazard-layer', 'ArcGIS MapServer / GeoJSON', 'rolling', 'public', 'HIGH', null, null),

  ('WSDOT GIS + OpenStreetMap', 'https://gisdata-wsdot.opendata.arcgis.com/', 'Highways, transportation infrastructure, roads.',
   'Roads', 'WSDOT / OSM', 'WA', 'https://data.wsdot.wa.gov/arcgis/rest/services/FunctionalClass/WSDOTFunctionalClassData/MapServer/0',
   'https://gisdata-wsdot.opendata.arcgis.com/', 'ArcGIS MapServer / OSM extract', 'rolling', 'public / ODbL', 'HIGH', null, null),

  ('US Census / ACS', 'https://api.census.gov/data/2022/acs/acs5', 'Population, density, households, median income.',
   'Population', 'US Census Bureau', null, null, 'https://api.census.gov/data/2022/acs/acs5', 'API', 'annual', 'public', 'HIGH', null, null),

  ('RCW + WA Dept. of Revenue guidance', '', 'Data center sales-and-use tax exemption statute and eligibility guidance.',
   'Incentives', 'WA Legislature / WA DOR', 'WA', null, null, 'n/a', 'varies', 'public', 'TO SOURCE', null, null),

  ('Ember US Electricity Data', 'https://ember-energy.org/data/us-electricity-data/',
   'Electricity generation (TWh), emissions (MtCO2e), carbon intensity (gCO2e/kWh) for all 50 states.', 'Carbon', 'Ember', null,
   null, 'https://ember-energy.org/data/us-electricity-data/', 'CSV', 'rolling', 'CC BY 4.0', 'HIGH', null, null)
on conflict do nothing;

-- ---------------------------------------------------------------------
-- Utilities & service territories (Section 3, 4, 7)
-- ---------------------------------------------------------------------
insert into public.utilities (state_code, name, utility_type, is_balancing_authority, transmission_owner, distribution_utility, website, large_load_process_url, large_load_notes, notes)
values
  ('WA', 'Bonneville Power Administration (BPA)', 'federal_power_marketing_administration', true, 'BPA', null,
   'https://www.bpa.gov', 'https://www.bpa.gov/energy-and-services/transmission/interconnection/line-and-load',
   'Runs the Line and Load Interconnection process for loads connecting to the Federal Columbia River Transmission System. Minimum MW, study fee, and deposit TO CONFIRM.',
   'Federal transmission provider for most of WA; large-load questions route through BPA plus the serving utility, not through an ISO queue.'),
  ('WA', 'Puget Sound Energy', 'investor_owned', true, null, 'Puget Sound Energy', 'https://www.pse.com', null,
   'Large-load tariff TO PULL. Search: "PSE large load interconnection".', null),
  ('WA', 'Avista', 'investor_owned', true, null, 'Avista', 'https://www.myavista.com', null,
   'Search: "Avista new load request".', null),
  ('WA', 'PacifiCorp', 'investor_owned', false, null, 'PacifiCorp', 'https://www.pacificorp.com', null, null, null),
  ('WA', 'Seattle City Light', 'municipal', true, null, 'Seattle City Light', 'https://www.seattle.gov/city-light', null, null, null),
  ('WA', 'Tacoma Power', 'municipal', true, null, 'Tacoma Power', 'https://www.mytpu.org', null, null, null),
  ('WA', 'Grant County PUD', 'public_utility_district', true, null, 'Grant County PUD', 'https://www.grantpud.org', null,
   'Search: "Grant PUD data center rate". Serves the Quincy/Moses Lake data center cluster; low-cost hydropower.', null),
  ('WA', 'Chelan County PUD', 'public_utility_district', true, null, 'Chelan County PUD', 'https://www.chelanpud.org', null,
   'Search: "Chelan PUD large load".', null),
  ('WA', 'Douglas County PUD', 'public_utility_district', true, null, 'Douglas County PUD', 'https://www.douglaspud.org', null, null, null)
on conflict (state_code, name) do nothing;

-- ---------------------------------------------------------------------
-- Existing data centers (Section 15)
-- ---------------------------------------------------------------------
insert into public.existing_data_centers (state_code, name, operator, city, latitude, longitude, known_mw, estimated_mw, mw_confidence, status, notes)
values
  ('WA', 'Microsoft Quincy Data Center Campus', 'Microsoft', 'Quincy, WA', 47.2343, -119.8342, null, null, 'unknown', 'operating',
   'One of Microsoft''s largest cloud campuses; multiple buildings, expanded over 15+ years.'),
  ('WA', 'Vantage Data Centers Quincy Campus', 'Vantage Data Centers', 'Quincy, WA', 47.2295, -119.858, null, null, 'unknown', 'operating',
   'Former Yahoo/Sabey-area campus site, multi-building hyperscale campus.'),
  ('WA', 'Sabey Intergate.Quincy', 'Sabey Data Centers', 'Quincy, WA', 47.2367, -119.8506, null, null, 'unknown', 'operating',
   'Multi-tenant colocation campus in the Quincy data center corridor.'),
  ('WA', 'Sabey Intergate.Wenatchee', 'Sabey Data Centers', 'Wenatchee, WA', 47.4235, -120.3103, null, null, 'unknown', 'operating',
   'Multi-tenant colocation campus near the Columbia River / Rocky Reach hydro corridor.'),
  ('WA', 'Seattle Carrier Hotel District (Westin Building area)', 'Multiple (Digital Realty, Equinix, others)', 'Seattle, WA', 47.6144, -122.3389, null, null, 'unknown', 'operating',
   'Dense urban colocation / interconnection cluster, not a single campus.'),
  ('WA', 'Moses Lake Data Center Area', 'Multiple', 'Moses Lake, WA', 47.1301, -119.0022, null, null, 'unknown', 'operating',
   'Grant County PUD service territory; low-cost hydropower has attracted industrial/data facilities.')
on conflict do nothing;

-- ---------------------------------------------------------------------
-- Natural hazards (Section 22 — WA-specific set)
-- ---------------------------------------------------------------------
insert into public.hazards (state_code, hazard_type, risk_level, description)
values
  ('WA', 'earthquake', 'high', 'Cascadia Subduction Zone and Seattle Fault; seismic design and transformer anchoring matter.'),
  ('WA', 'volcanic', 'moderate', 'Rainier, St. Helens, Baker, Adams, Glacier Peak; lahar hazard zones affect specific valleys (Puyallup, Nisqually, White River).'),
  ('WA', 'wildfire', 'high', 'High in central and eastern WA; drives PSPS-style outage risk and smoke/air-intake risk for cooling.'),
  ('WA', 'landslide', 'moderate', 'Significant in western WA.'),
  ('WA', 'extreme_heat', 'moderate', 'Rising risk; the 2021 heat dome is the design case for cooling.'),
  ('WA', 'extreme_cold', 'low', 'Moderate risk east of the Cascades (extreme cold / ice storms).'),
  ('WA', 'coastal_flooding', 'moderate', 'Puget Sound and coastal counties (sea-level rise).'),
  ('WA', 'hurricane', 'not_applicable', 'Not applicable to Washington.'),
  ('WA', 'tornado', 'negligible', 'Negligible risk in Washington.')
on conflict (state_code, hazard_type) do nothing;

-- ---------------------------------------------------------------------
-- Zoning jurisdictions (Section 17 — priority counties, all unresearched)
-- ---------------------------------------------------------------------
insert into public.zoning_jurisdictions (state_code, county, data_center_allowed, notes)
values
  ('WA', 'Grant', 'unknown', 'Priority county for data center siting research (existing Quincy/Moses Lake cluster). Zoning TO RESEARCH.'),
  ('WA', 'Douglas', 'unknown', 'Priority county. Zoning TO RESEARCH.'),
  ('WA', 'Chelan', 'unknown', 'Priority county. Zoning TO RESEARCH.'),
  ('WA', 'Benton', 'unknown', 'Priority county. Zoning TO RESEARCH.'),
  ('WA', 'Franklin', 'unknown', 'Priority county. Zoning TO RESEARCH.'),
  ('WA', 'Klickitat', 'unknown', 'Priority county. Zoning TO RESEARCH.'),
  ('WA', 'Yakima', 'unknown', 'Priority county. Zoning TO RESEARCH.')
on conflict do nothing;

-- ---------------------------------------------------------------------
-- Incentives (Section 19)
-- ---------------------------------------------------------------------
insert into public.incentives (state_code, category, title, description, eligibility_notes, status, date_verified)
values
  ('WA', 'sales_tax_exemption', 'Rural/eligible-county data center sales-and-use tax exemption',
   'Washington offers a sales-and-use tax exemption for qualifying data centers in rural/eligible counties, with periodic legislative revision.',
   'Eligible county list, job requirements, minimum investment, minimum MW, and duration must be pulled from the current RCW and WA DOR guidance before relying on this.',
   'unknown', '2026-09-19'),
  ('WA', 'property_tax_exemption', 'Property-tax exemption', 'Not yet researched.', null, 'unknown', '2026-09-19'),
  ('WA', 'electricity_tax_exemption', 'Electricity tax exemption', 'Not yet researched.', null, 'unknown', '2026-09-19')
on conflict do nothing;

-- ---------------------------------------------------------------------
-- Generic labeled facts — everything else in the doc that doesn't fit
-- a dedicated table, one row per FACT/PROXY/ESTIMATE/UNKNOWN item.
-- ---------------------------------------------------------------------
insert into public.research_facts (state_code, section_number, section_title, fact_key, label, value_text, as_of_date, notes)
values
  ('WA', 1, 'Transmission Lines', 'app_mvp_decision', 'fact',
   'Calculate distance to nearest 115/230/500 kV line and separately identify utility territory; proximity is not available MW.',
   '2026-09-19', null),
  ('WA', 2, 'Substations', 'available_mw', 'unknown', 'CEII-restricted under 18 CFR 388.113; legally not public. Do not infer available capacity from substation size.', '2026-09-19', null),
  ('WA', 4, 'ISO/RTO/Balancing Authority', 'organized_market', 'fact', 'Washington is outside an organized ISO/RTO market.', '2026-09-19',
   'Western EIM / Markets+ / EDAM participation is evolving.'),
  ('WA', 4, 'ISO/RTO/Balancing Authority', 'transmission_planning_region', 'fact', 'NorthernGrid / WECC', '2026-09-19', null),
  ('WA', 6, 'Electricity Price', 'industrial_price', 'unknown', 'TO PULL from EIA state profile. WA industrial rates are among the lowest in the US due to federal hydro.', '2026-09-19', null),
  ('WA', 6, 'Electricity Price', 'large_load_tariff', 'unknown', 'TO PULL per utility. Several WA PUDs have adopted separate rate schedules for very large/crypto/data center loads.', '2026-09-19', null),
  ('WA', 7, 'Large-Load Interconnection', 'process', 'fact', 'For loads connecting to the Federal Columbia River Transmission System, BPA runs a Line and Load Interconnection process.', '2026-09-19', null),
  ('WA', 7, 'Large-Load Interconnection', 'study_required', 'fact', 'A power-flow / interconnection study by BPA and/or the serving utility is required.', '2026-09-19', null),
  ('WA', 7, 'Large-Load Interconnection', 'queue_publicly_available', 'fact', 'NO for large loads — not standardized or centrally published; LBNL Queued Up excludes load queues.', '2026-09-19', null),
  ('WA', 7, 'Large-Load Interconnection', 'timeline', 'estimate', 'TO CONFIRM; national median generation-queue interconnection request to operation is 61 months (LBNL Queued Up 2026) — not a load-queue figure.', '2026-09-19', null),
  ('WA', 9, 'Water Rights', 'framework', 'fact', 'Washington is a prior-appropriation state; many basins are closed to new appropriations and instream-flow rules bind.', '2026-09-19', null),
  ('WA', 12, 'Drought and Water Stress', 'methodology', 'proxy', 'Water Stress Low/Medium/High to be derived from Ecology drought areas, US Drought Monitor, and WRI Aqueduct 4.0 basin stress.', '2026-09-19', null),
  ('WA', 14, 'Fiber and Telecom', 'long_haul_routes', 'unknown', 'Route geometry is not public. Major east-west long-haul corridors along I-90 and the Columbia River are known qualitatively only.', '2026-09-19', null),
  ('WA', 14, 'Fiber and Telecom', 'carrier_hotel', 'fact', 'Seattle (Westin Building Exchange) is the regional carrier hotel.', '2026-09-19', null),
  ('WA', 18, 'Moratoria and Regulation', 'state_moratorium', 'fact', 'None known as of 19 Sep 2026 — VERIFY.', '2026-09-19', null),
  ('WA', 18, 'Moratoria and Regulation', 'sepa_review', 'fact', 'SEPA (State Environmental Policy Act) review applies to data center development.', '2026-09-19', null),
  ('WA', 22, 'Natural Hazards', 'design_case', 'fact', 'The 2021 heat dome is the design case for cooling.', '2026-09-19', null),
  ('WA', 27, 'Carbon and Electricity Mix', 'ceta', 'fact', 'WA Clean Energy Transformation Act (CETA) requires greenhouse-gas-neutral electricity by 2030 and 100% clean electricity by 2045.', '2026-09-19', null),
  ('WA', 27, 'Carbon and Electricity Mix', 'grid_headline', 'fact', 'Hydro-dominant grid; among the lowest CO2 intensity in the US, which shifts the binding constraint to water and local grid capacity.', '2026-09-19', null),
  ('WA', 31, 'WA-Specific Items', 'unique_regulatory_structure', 'fact', 'Most of WA sits outside an organized ISO/RTO; BPA (a federal power marketing administration) owns the backbone. Large-load questions route through BPA''s Line and Load Interconnection process plus the serving utility.', '2026-09-19', null),
  ('WA', 31, 'WA-Specific Items', 'unique_water_issue', 'fact', 'Eastern WA sites have the best power and the worst water story — prior-appropriation rights, closed basins, binding instream-flow rules for salmon/ESA obligations on the Columbia and tributaries.', '2026-09-19', null),
  ('WA', 0, 'Overview', 'data_completeness_pct', 'fact', 'Roughly 40% — power and water sourced; land/zoning/incentives/hazards not started as of 19 Sep 2026.', '2026-09-19', 'Researcher: Brandon.')
on conflict (state_code, section_number, fact_key) do nothing;
