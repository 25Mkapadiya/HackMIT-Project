-- Seed Illinois research content from the 2026-09-19 state research template.
-- Preserves FACT / PROXY / ESTIMATE / UNKNOWN semantics and does not infer
-- substation headroom, spare utility capacity, water availability, or site-specific eligibility.

-- Refresh only Illinois reference rows. User scenarios/analyses are untouched.
delete from public.research_facts where state_code = 'IL';
delete from public.utilities where state_code = 'IL';
delete from public.existing_data_centers where state_code = 'IL';
delete from public.zoning_jurisdictions where state_code = 'IL';
delete from public.incentives where state_code = 'IL';
delete from public.hazards where state_code = 'IL';
delete from public.data_sources where state_code = 'IL';

insert into public.data_sources
  (name, url, description, category, agency, state_code, gis_api_url, download_url, data_format, last_updated_label, license, quality, methodology, reliability_note)
values
  ('HIFLD Electric Power Transmission Lines',
   'https://www.arcgis.com/home/item.html?id=f7ed0a97b2f440328ae82888787ac60b',
   'National electric transmission-line dataset used as the Illinois statewide transmission baseline, with geometry, voltage, ownership, and status fields.',
   'Transmission', 'HIFLD', 'IL',
   'https://services2.arcgis.com/FiaPA4ga0iQKduv3/ArcGIS/rest/services/US_Electric_Power_Transmission_Lines/FeatureServer/0',
   'https://www.arcgis.com/home/item.html?id=f7ed0a97b2f440328ae82888787ac60b',
   'ArcGIS Feature Service / shapefile / GeoJSON-compatible', 'verified 2026-09-19', 'Public GIS', 'HIGH',
   'Use for nearest transmission-line calculations and voltage-threshold screening at 115/230/345/500/735 kV.',
   'Transmission proximity is not available MW.'),

  ('Illinois Substations Toolkit',
   'https://www.arcgis.com/home/item.html?id=c8d6c5cab50e4763bdccc0539e098803',
   'Illinois public mapping resource for substation locations and hosting-capacity context in portions of ComEd and Ameren territory.',
   'Substations', 'Various Illinois utility/public GIS sources', 'IL',
   'https://www.arcgis.com/home/item.html?id=c8d6c5cab50e4763bdccc0539e098803',
   null, 'ArcGIS', 'verified 2026-09-19', 'Public GIS', 'MEDIUM',
   'Substation existence, coordinates, and sourced voltage can be used. Capacity or available MW must remain UNKNOWN unless explicitly published.',
   'Do not infer interconnection headroom.'),

  ('Illinois Water Inventory Program',
   'https://isws.illinois.edu/resources/water-use-reporting/',
   'Statewide Illinois water-use reporting program that tracks high-capacity wells and intakes.',
   'Water rights', 'Illinois State Water Survey', 'IL',
   null, 'https://water-supply.isws.illinois.edu/resources/water-use-reporting/water-use-data/',
   'Web / downloadable water-use data', 'verified 2026-09-19', 'Public agency data', 'HIGH',
   'Use for withdrawal point, facility, source, volume, sector, and location context. Reporting applies at or above 70 gallons per minute, approximately 100,000 gallons per day.',
   'A nearby reported withdrawal is not proof of future water availability.'),

  ('Illinois DNR Water Supply',
   'https://dnr.illinois.gov/waterresources/watersupply.html',
   'Illinois water-supply rules and withdrawal-reporting context.',
   'Water rights', 'Illinois Department of Natural Resources', 'IL',
   null, null, 'Web guidance', 'verified 2026-09-19', 'Public agency guidance', 'HIGH',
   'Illinois generally does not require a permit solely for withdrawing water, while high-capacity withdrawals are subject to annual reporting.',
   null),

  ('Illinois Groundwater Resources GIS',
   'https://univofillinois.maps.arcgis.com/apps/webappviewer/index.html?id=53380686a48d437583155052fc49d117',
   'Statewide mapping of major Illinois aquifer systems and public-water-supply wells.',
   'Groundwater', 'Illinois State Water Survey / Illinois State Geological Survey', 'IL',
   'https://univofillinois.maps.arcgis.com/apps/webappviewer/index.html?id=53380686a48d437583155052fc49d117',
   null, 'ArcGIS', 'verified 2026-09-19', 'Public university / agency GIS', 'HIGH',
   'Use for sand and gravel aquifers, shallow bedrock aquifers, Cambrian-Ordovician aquifers, and public water supply well screening.',
   'Aquifer proximity does not establish site-specific sustainable yield.'),

  ('Illinois Broadband Maps and Data',
   'https://dceo.illinois.gov/broadband/maps-and-data.html',
   'Statewide broadband maps, dashboards, and GIS downloads.',
   'Broadband', 'Illinois Office of Broadband', 'IL',
   null, 'https://dceo.illinois.gov/broadband/maps-and-data.html',
   'GIS / dashboards / downloads', 'verified 2026-09-19', 'Public agency data', 'HIGH',
   'Treat broadband availability as a CONNECTIVITY PROXY.',
   'Do not claim proven long-haul fiber, carrier capacity, dark fiber, or IXP access from broadband coverage alone.'),

  ('Illinois EPA GIS Resource Hub',
   'https://gis-illinois-epa.hub.arcgis.com/',
   'Illinois environmental GIS resources including contaminated sites, water quality, air quality, and related environmental constraints.',
   'Environmental', 'Illinois Environmental Protection Agency', 'IL',
   'https://gis-illinois-epa.hub.arcgis.com/',
   'https://epa.illinois.gov/topics/cleanup-programs/gis-data.html',
   'ArcGIS / downloadable GIS', 'verified 2026-09-19', 'Public agency GIS', 'HIGH',
   'Use with Illinois Enterprise GIS and federal wetland/flood datasets for environmental screening.',
   null),

  ('Illinois Enterprise GIS',
   'https://illinois.maps.arcgis.com/home/index.html',
   'Statewide geospatial catalog supporting land, public-land, parcel discovery, and environmental screening.',
   'Land', 'State of Illinois', 'IL',
   'https://illinois.maps.arcgis.com/home/index.html',
   'https://illinois.maps.arcgis.com/home/index.html',
   'ArcGIS catalog / GIS downloads', 'verified 2026-09-19', 'Public agency GIS', 'MEDIUM-HIGH',
   'Parcel completeness varies because many parcel systems remain county-managed.',
   null),

  ('Illinois Data Center Investment Program',
   'https://dceo.illinois.gov/expandrelocate/incentives/datacenters.html',
   'Illinois data-center investment incentive program guidance.',
   'Incentives', 'Illinois Department of Commerce and Economic Opportunity', 'IL',
   null, 'https://dceo.illinois.gov/expandrelocate/incentives/datacenters.html',
   'Program guidance', 'verified 2026-09-19', 'Public agency guidance', 'HIGH',
   'Qualifying projects generally require at least $250 million investment over 60 months, at least 20 full-time jobs, compensation thresholds, and sustainability requirements.',
   'New program processing was paused beginning 2026-07-01; do not represent a project as automatically eligible.'),

  ('Illinois Data Center Incentive Pause - Governor Announcement',
   'https://gov-pritzker-newsroom.prezly.com/gov-pritzker-pauses-new-data-center-tax-incentives',
   'Governor announcement describing the pause on processing new Data Center Investment Program agreements and the policy issues under review.',
   'Regulation', 'Office of the Governor of Illinois', 'IL',
   null, null, 'Government announcement', 'verified 2026-09-19', 'Official government announcement', 'HIGH',
   'Track energy affordability, reliability, water resources, and community-impact policy changes continuously.',
   'Regulatory status is time-sensitive.');

insert into public.utilities
  (state_code, name, utility_type, website, large_load_notes, notes)
values
  ('IL','Commonwealth Edison (ComEd)','investor_owned','https://www.comed.com/','Utility-specific large-load/interconnection review required.','Major Illinois electric utility; portions of its territory are within PJM.'), 
  ('IL','Ameren Illinois','investor_owned','https://www.ameren.com/illinois','Utility-specific large-load/interconnection review required.','Major Illinois electric utility; portions of its territory are within MISO.'),
  ('IL','MidAmerican Energy','investor_owned','https://www.midamericanenergy.com/','Utility-specific large-load/interconnection review required.','Serves portions of western Illinois.'),
  ('IL','Illinois municipal utilities','municipal',null,'Large-load process varies by municipality.','Grouped placeholder; resolve serving utility from local/state territory resources.'),
  ('IL','Illinois electric cooperatives','cooperative',null,'Large-load process varies by cooperative.','Grouped placeholder; resolve serving utility from local/state territory resources.');

insert into public.incentives
  (state_code, category, title, description, eligibility_notes, status, date_verified)
values
  ('IL','other','Illinois Data Center Investment Program',
   'Illinois operates a data-center incentive program that can provide sales/use-tax exemptions, certain local tax benefits, and a construction wage tax credit in qualifying underserved areas.',
   'Research template states qualifying projects generally require at least $250M investment over 60 months, at least 20 full-time jobs, compensation thresholds, and sustainability requirements. A 20% wage tax credit is described for qualifying construction projects in underserved areas. New agreement processing was paused beginning 2026-07-01.',
   'unknown','2026-09-19');

insert into public.hazards (state_code, hazard_type, risk_level, description) values
  ('IL','Tornadoes','high','High-relevance Illinois siting hazard.'),
  ('IL','Severe thunderstorms','high','High-relevance Illinois siting hazard.'),
  ('IL','Flooding','high','High-relevance hazard, especially along major river corridors.'),
  ('IL','Extreme heat','high','High-relevance Illinois siting hazard.'),
  ('IL','Winter storms','moderate','Moderate-relevance Illinois siting hazard.'),
  ('IL','Ice storms','moderate','Moderate-relevance Illinois siting hazard.'),
  ('IL','Extreme cold','moderate','Moderate-relevance Illinois siting hazard.'),
  ('IL','Earthquakes','low','Low statewide relevance, with some southern Illinois exposure associated with the New Madrid region.'),
  ('IL','Wildfire','low','Low-relevance Illinois siting hazard.'),
  ('IL','Hurricanes','not_applicable','Not a material Illinois siting hazard.');

insert into public.research_facts
  (state_code, section_number, section_title, fact_key, label, value_text, value_numeric, unit, as_of_date, notes)
values
  ('IL',1,'Transmission Lines','line_geometry_available','fact','YES',null,null,'2026-09-19','HIFLD provides statewide line geometry.'),
  ('IL',1,'Transmission Lines','voltage_available','fact','YES',null,null,'2026-09-19','Voltage fields are included in the HIFLD transmission dataset.'),
  ('IL',1,'Transmission Lines','owner_operator_available','fact','YES',null,null,'2026-09-19','Ownership fields are included in the HIFLD transmission dataset.'),
  ('IL',1,'Transmission Lines','status_available','fact','YES',null,null,'2026-09-19','Operational status fields are included in the HIFLD transmission dataset.'),
  ('IL',1,'Transmission Lines','reliability','fact','HIGH',null,null,'2026-09-19','Calculate nearest line and nearest 115/230/345/500/735 kV+ thresholds.'),
  ('IL',1,'Transmission Lines','grid_context','fact','Illinois public transmission mapping indicates extensive 345 kV infrastructure and some 735 kV corridors.',null,null,'2026-09-19','Infrastructure context only; not a statement of spare capacity.'),

  ('IL',2,'Substations','substation_exists','fact','Public mapping resources include Illinois substation locations.',null,null,'2026-09-19',null),
  ('IL',2,'Substations','available_mw','unknown','Not publicly established statewide.',null,'MW','2026-09-19','Must remain UNKNOWN unless explicitly published.'),
  ('IL',2,'Substations','headroom','unknown','Not publicly established statewide.',null,'MW','2026-09-19','Do not infer from voltage, acreage, transformer count, or hosting-capacity context.'),

  ('IL',3,'Electric Utilities and Service Territories','major_utilities','fact','Commonwealth Edison (ComEd); Ameren Illinois; MidAmerican Energy; municipal utilities; cooperatives',null,null,'2026-09-19','Coordinate should resolve to serving utility where territory data permits.'),
  ('IL',4,'ISO / RTO / Balancing Authority','iso_rto','fact','Illinois is split between MISO and PJM market/planning regions.',null,null,'2026-09-19','Large-load information remains utility-specific.'),

  ('IL',5,'Power Generation','major_resources','fact','Nuclear; Natural Gas; Wind; Coal; Solar',null,null,'2026-09-19','Illinois is identified in the source template as one of the nation\'s largest nuclear-generation states.'),
  ('IL',5,'Power Generation','output_label','fact','NEARBY GENERATION',null,null,'2026-09-19','Never label generation proximity as available power.'),
  ('IL',6,'Electricity Price','operating_cost_scenarios','fact','Model 100 MW, 300 MW, 500 MW, and 1 GW using EIA retail data and utility/economic-development tariffs.',null,null,'2026-09-19',null),

  ('IL',7,'Large-Load Interconnection','queue_availability','fact','MISO and PJM maintain public interconnection queues.',null,null,'2026-09-19',null),
  ('IL',7,'Large-Load Interconnection','headroom','unknown','Not publicly established.',null,'MW','2026-09-19',null),
  ('IL',7,'Large-Load Interconnection','available_capacity','unknown','Not publicly established.',null,'MW','2026-09-19',null),

  ('IL',8,'Public Water Systems','statewide_sources','fact','Illinois EPA, community water systems, Illinois State Water Survey, and EPA Public Water System Service Areas support water-system screening.',null,null,'2026-09-19',null),
  ('IL',9,'Water Rights','withdrawal_permit_rule','fact','Illinois does not generally require permits solely for withdrawing water.',null,null,'2026-09-19','Other approvals and local/system constraints can still apply.'),
  ('IL',9,'Water Rights','reporting_threshold_flow','fact','Annual reporting is mandatory for withdrawals at or above 70 gallons per minute.',70,'gallons/minute','2026-09-19','Approximately 100,000 gallons per day.'),
  ('IL',9,'Water Rights','reporting_threshold_daily','fact','Approximate daily equivalent of the 70 gallons-per-minute reporting threshold.',100000,'gallons/day','2026-09-19',null),
  ('IL',9,'Water Rights','app_language','fact','Industrial withdrawal authorization exists nearby.',null,null,'2026-09-19','Nearby authorization does not imply available capacity.'),
  ('IL',10,'Surface Water','major_sources','fact','Lake Michigan; Mississippi River; Illinois River; Ohio River; Rock River',null,null,'2026-09-19',null),
  ('IL',10,'Surface Water','proximity_rule','fact','River nearby does not imply available permit capacity.',null,null,'2026-09-19',null),
  ('IL',11,'Groundwater','mapped_layers','fact','Sand & Gravel aquifers; Shallow bedrock aquifers; Cambrian-Ordovician aquifers; Public water supply wells',null,null,'2026-09-19','Statewide groundwater mapping reliability is HIGH.'),
  ('IL',12,'Drought and Water Stress','water_stress_method','proxy','Aqueduct Stress + Withdrawal Density + Aquifer Use + Drought Frequency',null,null,'2026-09-19','Output LOW / MEDIUM / HIGH.'),
  ('IL',13,'Wastewater','reclaimed_water_availability','unknown','Must be checked per wastewater utility/facility.',null,null,'2026-09-19',null),

  ('IL',14,'Fiber and Telecom','broadband_label','proxy','CONNECTIVITY PROXY',null,null,'2026-09-19','Broadband availability is not proof that long-haul fiber is available at a site.'),
  ('IL',14,'Fiber and Telecom','fiber_advantage','fact','Chicago is a major North American carrier-hotel and interconnection ecosystem.',null,null,'2026-09-19','Long-haul routes, carrier hotels, IXPs, and dark-fiber providers still require facility/route-level research.'),
  ('IL',15,'Existing Data Centers','major_clusters','fact','Chicago; Elk Grove Village; Aurora; Joliet; Hoffman Estates',null,null,'2026-09-19','No facility coordinates were provided in the source template, so no point records are fabricated.'),
  ('IL',15,'Existing Data Centers','known_operators','fact','Digital Realty; CyrusOne; QTS; Equinix; Compass Datacenters; Stream Data Centers; Microsoft (selected projects)',null,null,'2026-09-19','Operator/facility mapping should be verified before point ingestion.'),

  ('IL',16,'Land','parcel_coverage','fact','State and county GIS resources support parcel, ownership, acreage, assessed-value, industrial-zoning, and public-land research.',null,null,'2026-09-19','Many parcel datasets remain county-managed; overall reliability MEDIUM-HIGH.'),
  ('IL',17,'Zoning','statewide_zoning_database','unknown','No statewide zoning layer; research municipality by municipality.',null,null,'2026-09-19',null),
  ('IL',18,'Data Center Moratoria and Regulation','incentive_processing_pause','fact','Processing of new Illinois Data Center Investment Program agreements was paused beginning 2026-07-01 while broader policy reforms are considered.',null,null,'2026-09-19','Maintenance level HIGH; monitor continuously.'),
  ('IL',18,'Data Center Moratoria and Regulation','policy_topics','fact','Electricity costs; water reporting; renewable-energy obligations; community impacts',null,null,'2026-09-19','Governor framework references energy affordability, reliability, water resources, and community impacts.'),
  ('IL',19,'Taxes and Incentives','program','fact','Illinois Data Center Investment Program',null,null,'2026-09-19','Program processing status is time-sensitive.'),
  ('IL',19,'Taxes and Incentives','minimum_investment','fact','Qualifying projects generally require at least $250 million investment over 60 months.',250000000,'USD','2026-09-19',null),
  ('IL',19,'Taxes and Incentives','minimum_jobs','fact','Qualifying projects generally require at least 20 full-time jobs.',20,'jobs','2026-09-19',null),
  ('IL',19,'Taxes and Incentives','underserved_area_wage_credit','fact','20% wage tax credit for qualifying construction projects in underserved areas.',20,'percent','2026-09-19','Potential incentive only; eligibility must be checked.'),
  ('IL',19,'Taxes and Incentives','processing_status','fact','New program processing paused beginning 2026-07-01.',null,null,'2026-09-19','Do not imply automatic eligibility or currently available agreement processing.'),

  ('IL',20,'Environmental','reliability','fact','HIGH',null,null,'2026-09-19','Illinois EPA GIS + Illinois Enterprise GIS.'),
  ('IL',21,'Flood Risk','priority_areas','fact','Mississippi corridor; Illinois River corridor; Des Plaines River corridor',null,null,'2026-09-19',null),

  ('IL',31,'Illinois-Specific Items','grid_issue','fact','Illinois operates across both MISO and PJM planning regions.',null,null,'2026-09-19',null),
  ('IL',31,'Illinois-Specific Items','water_issue','fact','Illinois maintains comprehensive high-capacity water-withdrawal reporting through IWIP.',null,null,'2026-09-19',null),
  ('IL',31,'Illinois-Specific Items','fiber_advantage','fact','Chicago is a national internet-backbone and colocation hub.',null,null,'2026-09-19',null),
  ('IL',31,'Illinois-Specific Items','regulatory_issue','fact','Data-center incentives and reporting requirements are under active review in 2026.',null,null,'2026-09-19','Re-check continuously.');

-- No rows are inserted into existing_data_centers because the supplied
-- Illinois template names markets/operators but does not provide verified
-- facility coordinates. No zoning_jurisdictions rows are inserted because
-- statewide zoning does not exist and no local jurisdictions were researched.
