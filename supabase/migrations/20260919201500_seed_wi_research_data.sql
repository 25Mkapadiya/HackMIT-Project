-- Seed Wisconsin research content from the 2026-09-19 state research template.
-- Preserves FACT / PROXY / ESTIMATE / UNKNOWN semantics and does not infer
-- substation headroom, spare utility capacity, or site-specific eligibility.

-- Refresh only Wisconsin reference rows. User scenarios/analyses are untouched.
delete from public.research_facts where state_code = 'WI';
delete from public.utilities where state_code = 'WI';
delete from public.existing_data_centers where state_code = 'WI';
delete from public.zoning_jurisdictions where state_code = 'WI';
delete from public.incentives where state_code = 'WI';
delete from public.hazards where state_code = 'WI';
delete from public.data_sources where state_code = 'WI';

insert into public.data_sources
  (name, url, description, category, agency, state_code, gis_api_url, download_url, data_format, last_updated_label, license, quality, methodology, reliability_note)
values
  ('PSC Wisconsin Electric GIS Services',
   'https://maps.psc.wi.gov/server/rest/services/Electric/PSC_ElectricServiceTerritories/MapServer/layers',
   'Statewide electric utility mapping and GIS infrastructure resources, including electric service territory layers.',
   'Transmission', 'Public Service Commission of Wisconsin', 'WI',
   'https://maps.psc.wi.gov/server/rest/services/Electric/PSC_ElectricServiceTerritories/MapServer/layers',
   'https://maps.psc.wi.gov/server/rest/services/Electric/PSC_ElectricServiceTerritories/MapServer/layers',
   'ArcGIS services', 'verified 2026-09-19', 'Public agency GIS', 'HIGH',
   'Use for statewide electric service-territory and infrastructure context. Voltage/owner fields depend on the specific published layer.',
   'Transmission proximity is not available MW.'),

  ('PSC Wisconsin Electric Service Territories',
   'https://pscw.maps.arcgis.com/apps/webappviewer/index.html?id=605e792dd45641989af5b61b00ad5842',
   'Statewide electric service territory polygons for Wisconsin utilities.',
   'Utilities', 'Public Service Commission of Wisconsin', 'WI',
   'https://maps.psc.wi.gov/server/rest/services/Electric/PSC_ElectricServiceTerritories/MapServer/layers',
   null, 'ArcGIS polygons', 'verified 2026-09-19', 'Public agency GIS', 'HIGH',
   'Coordinate can resolve to electric territory and serving utility; utility-specific interconnection review is still required.',
   null),

  ('Wisconsin DNR Water Use Program',
   'https://dnr.wisconsin.gov/topic/WaterUse',
   'Statewide water-withdrawal registration and reporting program.',
   'Water rights', 'Wisconsin Department of Natural Resources', 'WI',
   null, 'https://dnr.wisconsin.gov/topic/WaterUse/WithdrawalSummary.html',
   'Web / downloadable reports', 'verified 2026-09-19', 'Public agency data', 'HIGH',
   'Systems capable of withdrawing 100,000 gallons per day are subject to registration requirements.',
   'Industrial withdrawal authorization nearby does not imply unlimited water availability.'),

  ('Wisconsin DNR Water Use Public Search',
   'https://apps.dnr.wi.gov/waterusepub/Source',
   'Public source records for registered water withdrawals, including groundwater and surface-water sources.',
   'Water rights', 'Wisconsin Department of Natural Resources', 'WI',
   null, null, 'Web application', 'verified 2026-09-19', 'Public agency data', 'HIGH',
   'Use for withdrawal locations and source context.', null),

  ('Wisconsin High Capacity Wells / Groundwater',
   'https://dnr.wisconsin.gov/topic/WaterUse',
   'Statewide high-capacity well and groundwater-withdrawal context.',
   'Groundwater', 'Wisconsin Department of Natural Resources', 'WI',
   null, 'https://dnr.wisconsin.gov/topic/WaterUse/WithdrawalSummary.html',
   'Web / GIS / reports', 'verified 2026-09-19', 'Public agency data', 'HIGH',
   'Supports groundwater and high-capacity-well screening; do not infer future withdrawal approval from nearby wells.', null),

  ('Wisconsin Broadband Data',
   'https://psc.wi.gov/Pages/ServiceType/Broadband/BroadbandData.aspx',
   'Statewide broadband maps and downloadable GIS datasets.',
   'Broadband', 'Wisconsin Broadband Office / PSC Wisconsin', 'WI',
   null, 'https://psc.wi.gov/Pages/ServiceType/Broadband/BroadbandData.aspx',
   'GIS / downloadable data', 'verified 2026-09-19', 'Public agency data', 'HIGH',
   'Treat broadband coverage as a CONNECTIVITY PROXY, not proof of long-haul fiber availability.',
   'Long-haul routes, dark fiber, carrier hotels, and IXPs require separate research.'),

  ('GeoData@Wisconsin',
   'https://geodata.wisc.edu/',
   'Statewide parcel, cadastral, imagery, and geospatial discovery resources.',
   'Parcels', 'UW State Cartographer / GeoData@Wisconsin', 'WI',
   null, 'https://geodata.wisc.edu/', 'GIS catalog / downloads', 'verified 2026-09-19',
   'Public/open where individual datasets permit', 'HIGH',
   'Use for parcel and land-screening discovery; field completeness varies by contributing dataset.', null),

  ('Wisconsin DNR Open Data',
   'https://data-wi-dnr.opendata.arcgis.com/',
   'Statewide environmental GIS layers including wetlands, protected lands, water quality and related constraints.',
   'Environmental', 'Wisconsin Department of Natural Resources', 'WI',
   'https://data-wi-dnr.opendata.arcgis.com/',
   'https://dnr.wisconsin.gov/maps/GetGISData',
   'ArcGIS / downloadable GIS', 'verified 2026-09-19', 'Public agency GIS', 'HIGH',
   'Use for statewide environmental screening.', null),

  ('Wisconsin Data Center Sales and Use Tax Exemption',
   'https://wedc.org/programs/data-center-sales-and-use-tax-exemption/',
   'Wisconsin qualified data-center sales and use tax exemption program.',
   'Incentives', 'Wisconsin Economic Development Corporation', 'WI',
   null, 'https://www.revenue.wi.gov/DOR%20Publications/2114QualifiedDataCenter.pdf',
   'Program guidance / PDF', 'verified 2026-09-19', 'Public agency guidance', 'HIGH',
   'Potential incentives only; site/project eligibility must be checked against current statutory and certification requirements.',
   null);

insert into public.utilities
  (state_code, name, utility_type, website, large_load_notes, notes)
values
  ('WI','We Energies','investor_owned','https://www.we-energies.com/','Utility-specific large-load/interconnection review required.','Major Wisconsin utility.'),
  ('WI','Wisconsin Public Service','investor_owned','https://www.wisconsinpublicservice.com/','Utility-specific large-load/interconnection review required.','Major Wisconsin utility.'),
  ('WI','Alliant Energy Wisconsin','investor_owned','https://www.alliantenergy.com/','Utility-specific large-load/interconnection review required.','Major Wisconsin utility.'),
  ('WI','Madison Gas & Electric','investor_owned','https://www.mge.com/','Utility-specific large-load/interconnection review required.','Major Wisconsin utility.'),
  ('WI','Xcel Energy Wisconsin','investor_owned','https://wi.my.xcelenergy.com/','Utility-specific large-load/interconnection review required.','Major Wisconsin utility.'),
  ('WI','Dairyland Power member systems','cooperative','https://www.dairylandpower.com/','Large-load process varies by member distribution system.','Generation/transmission cooperative network.'),
  ('WI','Wisconsin municipal utilities','municipal',null,'Large-load process varies by municipality.','Grouped research placeholder; resolve serving utility from PSC territory data.'),
  ('WI','Wisconsin electric cooperatives','cooperative',null,'Large-load process varies by cooperative.','Grouped research placeholder; resolve serving utility from PSC territory data.');

insert into public.incentives
  (state_code, category, title, description, eligibility_notes, status, date_verified)
values
  ('WI','sales_tax_exemption','Wisconsin Data Center Sales and Use Tax Exemption',
   'Wisconsin offers a sales and use tax exemption for qualifying data-center projects.',
   'WEDC guidance states planned investment thresholds of at least $150M in counties over 100,000 population, $100M in counties of 50,000-100,000, and $50M in counties under 50,000. Output must say potential incentives available, never automatically eligible.',
   'active','2026-09-19');

insert into public.hazards (state_code, hazard_type, risk_level, description) values
  ('WI','Extreme cold','high','High-relevance Wisconsin siting hazard.'),
  ('WI','Snowstorms','high','High-relevance Wisconsin siting hazard.'),
  ('WI','Ice storms','high','High-relevance Wisconsin siting hazard.'),
  ('WI','Flooding','high','High-relevance hazard, including major river corridors and shoreline areas.'),
  ('WI','Tornadoes','moderate','Moderate-relevance Wisconsin siting hazard.'),
  ('WI','Severe thunderstorms','moderate','Moderate-relevance Wisconsin siting hazard.'),
  ('WI','Extreme heat','moderate','Moderate-relevance Wisconsin siting hazard.'),
  ('WI','Hurricanes','not_applicable','Not a material Wisconsin siting hazard.'),
  ('WI','Wildfire','low','Low-relevance statewide siting hazard.'),
  ('WI','Earthquakes','low','Low-relevance Wisconsin siting hazard.'),
  ('WI','Sea-level rise','not_applicable','Not applicable; Great Lakes shoreline flooding is a different hazard.'),
  ('WI','Volcanic activity','not_applicable','Not applicable.');

insert into public.research_facts
  (state_code, section_number, section_title, fact_key, label, value_text, value_numeric, unit, as_of_date, notes)
values
  ('WI',1,'Transmission Lines','line_geometry_available','fact','YES',null,null,'2026-09-19','PSC Wisconsin GIS and transmission datasets provide line geometry where published.'),
  ('WI',1,'Transmission Lines','voltage_available','fact','Available where published in transmission and utility infrastructure layers.',null,null,'2026-09-19',null),
  ('WI',1,'Transmission Lines','owner_operator_available','fact','Available through transmission-line datasets and utility ownership records where published.',null,null,'2026-09-19',null),
  ('WI',1,'Transmission Lines','reliability','fact','HIGH',null,null,'2026-09-19','Calculate nearest line and thresholds at 115/230/345/500 kV; proximity is not available MW.'),

  ('WI',2,'Substations','available_mw','unknown','Not publicly established.',null,'MW','2026-09-19','Do not infer available capacity from transformer count, acreage, or voltage.'),
  ('WI',2,'Substations','headroom','unknown','Not publicly established.',null,'MW','2026-09-19','Utility study required.'),

  ('WI',3,'Electric Utilities and Service Territories','territory_polygons','fact','Statewide electric service territory polygons are available through PSC Wisconsin.',null,null,'2026-09-19',null),
  ('WI',4,'ISO / RTO / Balancing Authority','iso_rto','fact','Wisconsin is primarily within MISO.',null,null,'2026-09-19','Large-load information remains utility-specific.'),

  ('WI',5,'Power Generation','output_label','fact','NEARBY GENERATION',null,null,'2026-09-19','Never label proximity-based generation as available power.'),
  ('WI',6,'Electricity Price','operating_cost_scenarios','fact','Model 100 MW, 300 MW, 500 MW, and 1 GW using EIA retail data and utility tariffs.',null,null,'2026-09-19',null),

  ('WI',7,'Large-Load Interconnection','queue_availability','fact','MISO queue is public.',null,null,'2026-09-19','Load-serving utility study/process is still required.'),
  ('WI',7,'Large-Load Interconnection','substation_capacity','unknown','Not publicly established.',null,'MW','2026-09-19',null),
  ('WI',7,'Large-Load Interconnection','headroom','unknown','Not publicly established.',null,'MW','2026-09-19',null),

  ('WI',8,'Public Water Systems','industrial_service','unknown','Must be checked per public water system / municipality.',null,null,'2026-09-19',null),
  ('WI',9,'Water Rights','registration_threshold','fact','Registration required for systems capable of withdrawing 100,000 gallons per day.',100000,'gallons/day','2026-09-19',null),
  ('WI',9,'Water Rights','app_language','fact','Industrial withdrawal authorization exists nearby.',null,null,'2026-09-19','Never say unlimited water available.'),
  ('WI',10,'Surface Water','proximity_rule','fact','Proximity to a river or lake does not imply permit availability.',null,null,'2026-09-19',null),
  ('WI',11,'Groundwater','high_capacity_wells','fact','Wisconsin tracks high-capacity wells and groundwater withdrawals statewide.',null,null,'2026-09-19',null),
  ('WI',12,'Drought and Water Stress','water_stress_method','proxy','Aqueduct Water Stress + Withdrawal Density + Groundwater Sensitivity + Drought History.',null,null,'2026-09-19','Output LOW / MEDIUM / HIGH.'),
  ('WI',12,'Drought and Water Stress','great_lakes_compact_reporting','fact','Wisconsin maintains extensive withdrawal reporting in the Great Lakes Compact context.',null,null,'2026-09-19',null),

  ('WI',13,'Wastewater','industrial_pretreatment','unknown','Must be checked per wastewater utility / permit.',null,null,'2026-09-19',null),
  ('WI',14,'Fiber and Telecom','broadband_label','proxy','CONNECTIVITY PROXY',null,null,'2026-09-19','Do not equate state/FCC broadband mapping with proven long-haul fiber availability.'),
  ('WI',15,'Existing Data Centers','major_markets','fact','Milwaukee; Madison; Mount Pleasant; Port Washington; Beaver Dam',null,null,'2026-09-19','Research template identifies these as major markets; no facility coordinates were supplied, so no point records are fabricated.'),
  ('WI',15,'Existing Data Centers','known_operators','fact','Microsoft; Oracle; Epic Hosting; Meta',null,null,'2026-09-19','Operator/facility mapping must be verified before point ingestion.'),

  ('WI',16,'Land','statewide_land_sources','fact','GeoData@Wisconsin and Wisconsin DNR Open Data provide statewide geospatial resources.',null,null,'2026-09-19',null),
  ('WI',17,'Zoning','statewide_zoning_database','unknown','No statewide zoning database identified; research municipality by municipality.',null,null,'2026-09-19',null),
  ('WI',18,'Data Center Moratoria and Regulation','state_moratorium','fact','No statewide data-center moratorium identified from reviewed sources.',null,null,'2026-09-19','Date every regulatory entry and re-check periodically.'),
  ('WI',19,'Taxes and Incentives','output_language','fact','Potential incentives available.',null,null,'2026-09-19','Never say automatically eligible.'),
  ('WI',20,'Environmental','reliability','fact','HIGH',null,null,'2026-09-19','Wisconsin DNR Open Data + GeoData@Wisconsin.'),
  ('WI',21,'Flood Risk','priority_areas','fact','Mississippi River corridor; Lake Michigan shoreline; Wisconsin River corridor.',null,null,'2026-09-19',null),

  ('WI',31,'Wisconsin-Specific Items','water_issue','fact','Wisconsin operates under the Great Lakes Compact framework and has strong water-withdrawal reporting requirements.',null,null,'2026-09-19',null),
  ('WI',31,'Wisconsin-Specific Items','infrastructure_advantage','fact','Access to Lake Michigan water, strong transmission infrastructure, and proximity to Chicago and Minneapolis connectivity corridors.',null,null,'2026-09-19','This is infrastructure context, not a guarantee of site-specific capacity.'),
  ('WI',31,'Wisconsin-Specific Items','regulatory_development','fact','Wisconsin has expanded data-center tax incentives and certified multiple large-scale developments.',null,null,'2026-09-19','Eligibility and project status must be checked against current agency guidance.');

-- No rows are inserted into existing_data_centers because the supplied
-- Wisconsin template names markets/operators but does not provide verified
-- facility coordinates. No zoning_jurisdictions rows are inserted because
-- statewide zoning does not exist and no local jurisdictions were researched.
