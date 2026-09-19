-- Iowa state-research backend for HackMIT
-- Source basis: user-provided Iowa research brief, 2026-09-19.
-- Purpose: store authoritative/proxy metadata and product rules without
-- representing proximity as available electric or water capacity.
--
-- This migration is intentionally idempotent and can coexist with the app's
-- existing state infrastructure. It does not ingest large GIS geometries; it
-- stores source/configuration metadata that the API layer can use to retrieve
-- those geometries from authoritative services.

begin;

create table if not exists public.state_research_profiles (
  state_code text primary key check (char_length(state_code) = 2),
  state_name text not null,
  researched_at date not null,
  overall_assessment text,
  primary_iso_rto text,
  completeness_notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.state_research_sources (
  source_key text primary key,
  state_code text not null references public.state_research_profiles(state_code) on delete cascade,
  category text not null,
  dataset_name text not null,
  agency text,
  source_url text,
  gis_or_api_url text,
  download_url text,
  data_format text,
  geometry_type text,
  quality text not null check (quality in ('HIGH','MEDIUM','LOW','UNKNOWN','PROXY')),
  classification text not null check (classification in ('FACT','PROXY','ESTIMATE','UNKNOWN')),
  refresh_note text,
  license_note text,
  notes text,
  capabilities jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists state_research_sources_state_category_idx
  on public.state_research_sources(state_code, category);

create table if not exists public.state_research_sections (
  state_code text not null references public.state_research_profiles(state_code) on delete cascade,
  section_number integer not null,
  section_key text not null,
  title text not null,
  reliability text,
  classification text not null default 'FACT'
    check (classification in ('FACT','PROXY','ESTIMATE','UNKNOWN')),
  summary text,
  app_output_rule text,
  critical_rule text,
  notes text,
  metadata jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now(),
  primary key (state_code, section_number)
);

create table if not exists public.state_research_utilities (
  state_code text not null references public.state_research_profiles(state_code) on delete cascade,
  utility_name text not null,
  utility_type text,
  role text,
  territory_available boolean,
  large_load_process_status text,
  source_key text references public.state_research_sources(source_key) on delete set null,
  notes text,
  primary key (state_code, utility_name)
);

create table if not exists public.state_research_interconnection (
  state_code text primary key references public.state_research_profiles(state_code) on delete cascade,
  primary_market text,
  queue_public boolean,
  queue_url text,
  study_required boolean,
  headroom_public boolean not null default false,
  next_step text,
  process_notes text,
  updated_at timestamptz not null default now()
);

create table if not exists public.state_research_known_data_centers (
  state_code text not null references public.state_research_profiles(state_code) on delete cascade,
  operator text not null,
  cluster text not null,
  status text not null default 'KNOWN_CLUSTER',
  known_mw numeric,
  mw_classification text not null default 'UNKNOWN'
    check (mw_classification in ('FACT','PROXY','ESTIMATE','UNKNOWN')),
  source_note text,
  primary key (state_code, operator, cluster)
);

create table if not exists public.state_research_rules (
  state_code text not null references public.state_research_profiles(state_code) on delete cascade,
  rule_key text not null,
  classification text not null check (classification in ('FACT','PROXY','ESTIMATE','UNKNOWN')),
  rule_text text not null,
  source_key text references public.state_research_sources(source_key) on delete set null,
  metadata jsonb not null default '{}'::jsonb,
  primary key (state_code, rule_key)
);

-- Public research metadata is readable by the app, while writes remain restricted
-- to authenticated backend/service-role access.
alter table public.state_research_profiles enable row level security;
alter table public.state_research_sources enable row level security;
alter table public.state_research_sections enable row level security;
alter table public.state_research_utilities enable row level security;
alter table public.state_research_interconnection enable row level security;
alter table public.state_research_known_data_centers enable row level security;
alter table public.state_research_rules enable row level security;

drop policy if exists "public read state research profiles" on public.state_research_profiles;
create policy "public read state research profiles"
  on public.state_research_profiles for select using (true);

drop policy if exists "public read state research sources" on public.state_research_sources;
create policy "public read state research sources"
  on public.state_research_sources for select using (true);

drop policy if exists "public read state research sections" on public.state_research_sections;
create policy "public read state research sections"
  on public.state_research_sections for select using (true);

drop policy if exists "public read state research utilities" on public.state_research_utilities;
create policy "public read state research utilities"
  on public.state_research_utilities for select using (true);

drop policy if exists "public read state research interconnection" on public.state_research_interconnection;
create policy "public read state research interconnection"
  on public.state_research_interconnection for select using (true);

drop policy if exists "public read state research data centers" on public.state_research_known_data_centers;
create policy "public read state research data centers"
  on public.state_research_known_data_centers for select using (true);

drop policy if exists "public read state research rules" on public.state_research_rules;
create policy "public read state research rules"
  on public.state_research_rules for select using (true);

insert into public.state_research_profiles (
  state_code, state_name, researched_at, overall_assessment, primary_iso_rto, completeness_notes
) values (
  'IA',
  'Iowa',
  date '2026-09-19',
  'Iowa is a strong data-center siting MVP state because statewide utility territories, parcels, water permitting, environmental GIS, and broadband mapping are publicly accessible. The largest unresolved items are substation headroom and utility-specific large-load interconnection availability.',
  'MISO',
  'Most statewide infrastructure categories have public mapping or authoritative program sources. Zoning and large-load capacity remain jurisdiction/utility specific.'
)
on conflict (state_code) do update set
  state_name = excluded.state_name,
  researched_at = excluded.researched_at,
  overall_assessment = excluded.overall_assessment,
  primary_iso_rto = excluded.primary_iso_rto,
  completeness_notes = excluded.completeness_notes,
  updated_at = now();

insert into public.state_research_sources (
  source_key, state_code, category, dataset_name, agency, source_url,
  gis_or_api_url, download_url, data_format, geometry_type, quality,
  classification, refresh_note, license_note, notes, capabilities
) values
(
  'ia-iuc-transmission',
  'IA','transmission','Iowa Utilities Commission statewide electric infrastructure mapping',
  'Iowa Utilities Commission',
  'https://iuc.iowa.gov/',
  'https://iowa.maps.arcgis.com/',
  'https://geodata.iowa.gov/',
  'ArcGIS Feature Services / downloadable GIS',
  'LineString',
  'HIGH','FACT',null,null,
  'Primary Iowa transmission source. Use operator and voltage attributes where provided; do not interpret proximity as available MW.',
  '{"line_geometry":true,"voltage":true,"owner_operator":true,"nearest_thresholds_kv":[115,230,345]}'::jsonb
),
(
  'national-hifld-transmission',
  'IA','transmission','Electric Power Transmission Lines baseline',
  'HIFLD archive / national baseline',
  'https://hifld-geoplatform.opendata.arcgis.com/',
  null,null,
  'GIS',
  'LineString',
  'MEDIUM','PROXY',null,null,
  'National baseline/fallback only; Iowa-specific state resources are preferred.',
  '{"line_geometry":true,"voltage":true,"owner_operator":true}'::jsonb
),
(
  'national-hifld-substations',
  'IA','substations','Substations baseline',
  'HIFLD archive',
  null,null,null,
  'GIS',
  'Point',
  'MEDIUM','PROXY',null,null,
  'Use with Iowa utility mapping and OpenStreetMap checks. Available MW/headroom is not public and must remain UNKNOWN.',
  '{"coordinates":true,"name":true,"voltage":"when_published","owner":"when_published","published_capacity":"when_public","available_mw":false,"headroom":false}'::jsonb
),
(
  'ia-electric-service-boundaries',
  'IA','utilities','Electrical Service Boundaries',
  'Iowa Geospatial Data Clearinghouse / Iowa Utilities Commission',
  'https://geodata.iowa.gov/',
  'https://geodata.iowa.gov/',
  'https://geodata.iowa.gov/',
  'GIS polygon',
  'Polygon',
  'HIGH','FACT',null,null,
  'Statewide electric service-area boundaries. Resolve a coordinate to a serving utility, then separately research that utility''s large-load process.',
  '{"territory_polygons":true,"coordinate_lookup":true}'::jsonb
),
(
  'eia-930',
  'IA','grid','EIA Form 930 balancing-authority operating data',
  'U.S. Energy Information Administration',
  'https://www.eia.gov/electricity/gridmonitor/',
  'https://api.eia.gov/v2/',
  'https://www.eia.gov/electricity/gridmonitor/',
  'API / CSV',
  null,
  'HIGH','FACT','Hourly','Public',
  'Use for historical demand, generation and interchange. Iowa is primarily in MISO, with western-boundary interaction with SPP-connected utilities.',
  '{"demand":true,"generation":true,"interchange":true}'::jsonb
),
(
  'eia-860-923',
  'IA','generation','EIA-860 / EIA-923 generation data',
  'U.S. Energy Information Administration',
  'https://www.eia.gov/electricity/data.php',
  null,
  'https://www.eia.gov/electricity/data.php',
  'CSV / XLSX',
  'Point',
  'HIGH','FACT','Annual','Public',
  'Generator/plant-level source for nearby generation. Label outputs NEARBY GENERATION, never available power.',
  '{"radii_miles":[10,25,50],"fuel_types":true,"capacity_mw":true}'::jsonb
),
(
  'eia-retail-electricity',
  'IA','electricity_price','EIA retail electricity data',
  'U.S. Energy Information Administration',
  'https://www.eia.gov/electricity/data.php',
  null,
  'https://www.eia.gov/electricity/data.php',
  'API / CSV',
  null,
  'HIGH','FACT',null,'Public',
  'Baseline for industrial electricity-price estimates; utility tariffs remain utility-specific.',
  '{"load_cases_mw":[100,300,500,1000]}'::jsonb
),
(
  'ia-dnr-public-water-supply',
  'IA','water_systems','Public Water Supply Facilities',
  'Iowa Department of Natural Resources',
  'https://geodata.iowa.gov/',
  'https://geodata.iowa.gov/',
  'https://geodata.iowa.gov/',
  'GIS',
  'Point',
  'HIGH','FACT',null,null,
  'Desired fields include utility, population served, source, capacity/current demand if published, and industrial service availability.',
  '{"population_served":true,"water_source":true,"capacity":"when_published","current_demand":"when_published","industrial_service":"requires_utility_confirmation"}'::jsonb
),
(
  'ia-dnr-water-allocation',
  'IA','water_rights','Water Allocation and Water Use Program',
  'Iowa Department of Natural Resources',
  'https://www.iowadnr.gov/',
  'https://programs.iowadnr.gov/',
  null,
  'Program records / GIS',
  'Point',
  'HIGH','FACT',null,null,
  'Water-use permitting source. App language should say industrial withdrawal authorization exists nearby, never imply water is available solely from proximity.',
  '{"permit_holder":true,"withdrawal_source":true,"permit_status":true,"withdrawal_amount":true,"location":true}'::jsonb
),
(
  'ia-hydrography',
  'IA','surface_water','Iowa DNR / Iowa GeoData hydrography',
  'Iowa DNR / Iowa Geospatial Data Clearinghouse',
  'https://geodata.iowa.gov/',
  'https://geodata.iowa.gov/',
  'https://geodata.iowa.gov/',
  'GIS',
  'LineString / Polygon',
  'HIGH','FACT',null,null,
  'Use for nearest river, lake and watershed. River nearby does not equal available industrial water.',
  '{"nearest_river":true,"nearest_lake":true,"watershed":true}'::jsonb
),
(
  'usgs-nwis-ia',
  'IA','surface_water','USGS National Water Information System',
  'U.S. Geological Survey',
  'https://waterdata.usgs.gov/nwis',
  'https://api.waterdata.usgs.gov/',
  null,
  'API',
  'Point',
  'HIGH','FACT','Near real-time / historical','Public',
  'Use for stream gauges and water observations.',
  '{"stream_gauges":true}'::jsonb
),
(
  'ia-groundwater',
  'IA','groundwater','Iowa groundwater, wells, recharge and source-water mapping',
  'Iowa Geological Survey / Iowa DNR',
  'https://programs.iowadnr.gov/',
  'https://data-iowagis.opendata.arcgis.com/',
  null,
  'GIS',
  'Mixed',
  'HIGH','FACT',null,null,
  'Available layers include aquifers, wells, recharge areas, wellhead protection and groundwater sensitivity.',
  '{"aquifers":true,"wells":true,"recharge_areas":true,"wellhead_protection":true,"groundwater_sensitivity":true}'::jsonb
),
(
  'wri-aqueduct',
  'IA','water_stress','Aqueduct Water Risk Atlas',
  'World Resources Institute',
  'https://www.wri.org/aqueduct',
  null,
  null,
  'GIS / modeled index',
  'Polygon',
  'PROXY','PROXY',null,'CC BY 4.0',
  'Combine with recent drought, groundwater conditions and withdrawal density; final LOW/MEDIUM/HIGH is a proxy.',
  '{"stress_index":true}'::jsonb
),
(
  'us-drought-monitor',
  'IA','water_stress','U.S. Drought Monitor',
  'NDMC / NOAA / USDA',
  'https://droughtmonitor.unl.edu/',
  null,null,
  'GIS',
  'Polygon',
  'HIGH','FACT','Weekly','Public',
  'Current drought condition input to Iowa water-stress proxy.',
  '{"drought_categories":true}'::jsonb
),
(
  'epa-sewersheds',
  'IA','wastewater','EPA Sewersheds',
  'U.S. Environmental Protection Agency',
  'https://www.epa.gov/cwns/sewersheds',
  null,null,
  'GIS',
  'Polygon',
  'MEDIUM','PROXY',null,'Public',
  'Use for sewershed context; treatment capacity, pretreatment and reclaimed-water availability require local utility or permit research.',
  '{"service_area":true,"treatment_capacity":"requires_local_confirmation","pretreatment":"requires_local_confirmation","reclaimed_water":"requires_local_confirmation"}'::jsonb
),
(
  'ia-broadband-map',
  'IA','fiber','Iowa statewide broadband mapping',
  'Iowa Department of Management',
  'https://dom.iowa.gov/',
  'https://iowa.maps.arcgis.com/',
  null,
  'GIS',
  'Polygon',
  'MEDIUM','PROXY',null,null,
  'Label as CONNECTIVITY PROXY. Do not claim long-haul fiber availability from consumer broadband coverage.',
  '{"consumer_broadband":true,"long_haul_fiber":false,"dark_fiber":false,"ixp":false}'::jsonb
),
(
  'fcc-bdc',
  'IA','fiber','FCC Broadband Data Collection / National Broadband Map',
  'Federal Communications Commission',
  'https://broadbandmap.fcc.gov/home',
  null,null,
  'GIS / API',
  'Polygon',
  'PROXY','PROXY','Semiannual','Public',
  'Connectivity proxy only.',
  '{"consumer_broadband":true,"long_haul_fiber":false}'::jsonb
),
(
  'ia-parcels',
  'IA','land','Iowa statewide parcel and geospatial resources',
  'Iowa Geospatial Data Clearinghouse',
  'https://geodata.iowa.gov/',
  'https://geodata.iowa.gov/',
  'https://geodata.iowa.gov/',
  'GIS',
  'Polygon',
  'HIGH','FACT',null,null,
  'Available layers include parcels, ownership, acreage, land use and assessed value.',
  '{"parcels":true,"ownership":true,"acreage":true,"land_use":true,"assessed_value":true}'::jsonb
),
(
  'ia-dnr-environmental',
  'IA','environmental','Iowa DNR GIS Services / Iowa GeoData environmental layers',
  'Iowa Department of Natural Resources',
  'https://programs.iowadnr.gov/',
  'https://geodata.iowa.gov/',
  null,
  'GIS',
  'Mixed',
  'HIGH','FACT',null,null,
  'Wetlands, protected lands, critical habitat, contaminated sites, water quality and environmental-justice context.',
  '{"wetlands":true,"protected_lands":true,"critical_habitat":true,"contaminated_sites":true,"water_quality":true,"environmental_justice":true}'::jsonb
),
(
  'fema-nfhl',
  'IA','flood','FEMA National Flood Hazard Layer',
  'Federal Emergency Management Agency',
  'https://www.fema.gov/flood-maps/national-flood-hazard-layer',
  null,null,
  'GIS',
  'Polygon',
  'HIGH','FACT','Rolling','Public',
  'Use with Iowa DNR floodplain mapping for FEMA zone, 100-year and 500-year floodplain outputs.',
  '{"fema_zone":true,"floodplain_100yr":true,"floodplain_500yr":true}'::jsonb
),
(
  'ia-dor-data-center-incentive',
  'IA','incentives','Data Center Sales and Use Tax Incentives',
  'Iowa Department of Revenue',
  'https://revenue.iowa.gov/',
  null,null,
  'Statute / guidance',
  null,
  'HIGH','FACT',null,'Public',
  'Potential incentive pathway for qualifying data center businesses. Do not claim eligibility without checking all statutory conditions.',
  '{"minimum_investment_usd":200000000,"eligibility_requires_review":true}'::jsonb
)
on conflict (source_key) do update set
  state_code = excluded.state_code,
  category = excluded.category,
  dataset_name = excluded.dataset_name,
  agency = excluded.agency,
  source_url = excluded.source_url,
  gis_or_api_url = excluded.gis_or_api_url,
  download_url = excluded.download_url,
  data_format = excluded.data_format,
  geometry_type = excluded.geometry_type,
  quality = excluded.quality,
  classification = excluded.classification,
  refresh_note = excluded.refresh_note,
  license_note = excluded.license_note,
  notes = excluded.notes,
  capabilities = excluded.capabilities,
  updated_at = now();

insert into public.state_research_sections (
  state_code, section_number, section_key, title, reliability, classification,
  summary, app_output_rule, critical_rule, notes, metadata
) values
('IA',1,'transmission','Transmission Lines','HIGH','FACT',
 'Iowa provides statewide transmission mapping resources; use Iowa IUC GIS as the preferred state source with national transmission data as fallback.',
 'Distance to nearest transmission line; nearest >=115 kV; nearest >=230 kV; nearest >=345 kV.',
 'Transmission proximity is not available MW.',
 'Iowa has 345 kV backbone infrastructure. The state is primarily within MISO; western-edge utilities can interact with SPP.',
 '{"source_keys":["ia-iuc-transmission","national-hifld-transmission"]}'::jsonb),

('IA',2,'substations','Substations','MEDIUM','UNKNOWN',
 'Track substation existence, coordinates, sourced voltage/owner, connected lines and any published transformer/capacity fields.',
 'Show sourced attributes; available MW and headroom remain UNKNOWN.',
 'Do not infer available MW capacity from station size.',
 'Use HIFLD archive, Iowa utility mapping, OSM and utility GIS systems for cross-checking.',
 '{"source_keys":["national-hifld-substations"],"available_mw":"UNKNOWN","headroom":"UNKNOWN"}'::jsonb),

('IA',3,'utilities','Electric Utilities and Service Territories','HIGH','FACT',
 'Statewide electric service-area boundaries are available. Major entities include MidAmerican Energy, Alliant Energy / Interstate Power and Light, ITC Midwest, municipal utilities and rural electric cooperatives.',
 'Coordinate -> Service Territory -> Serving Utility -> Large Load Process.',
 null,
 'Large-load requirements must be tracked per serving utility.',
 '{"source_keys":["ia-electric-service-boundaries"]}'::jsonb),

('IA',4,'grid','ISO / RTO / Balancing Authority','HIGH','FACT',
 'Iowa is primarily within MISO. Western-boundary utilities can interact with SPP-connected systems.',
 'Expose historical peak demand, generation, interchange, congestion/constraints when source data is available.',
 'Do not convert regional transfer capability into substation headroom.',
 'Large-load process remains utility-specific.',
 '{"source_keys":["eia-930"],"primary_rto":"MISO","secondary_context":"SPP"}'::jsonb),

('IA',5,'generation','Power Generation','HIGH','FACT',
 'Use EIA generator-level data. Major Iowa generation types include wind, natural gas, coal, nuclear legacy context and solar.',
 'NEARBY GENERATION within 10 / 25 / 50 miles.',
 'Never label nearby generation as available power.',
 'Duane Arnold is retired in the source brief; future status should be separately verified if surfaced.',
 '{"source_keys":["eia-860-923"],"radii_miles":[10,25,50]}'::jsonb),

('IA',6,'electricity_price','Electricity Price','HIGH','FACT',
 'Use EIA retail-price data plus MidAmerican and Alliant utility tariffs/economic-development tariffs.',
 'Estimated electricity operating expense for 100 MW, 300 MW, 500 MW and 1 GW scenarios.',
 'Price estimates must identify tariff/source assumptions.',
 null,
 '{"source_keys":["eia-retail-electricity"],"load_cases_mw":[100,300,500,1000]}'::jsonb),

('IA',7,'large_load','Large-Load Interconnection','MEDIUM','UNKNOWN',
 'Study requirements vary by utility. MISO queue information is public, but substation headroom is not established by public mapping.',
 'Return serving utility, known process/queue links, and utility-study-required status.',
 'Substation headroom = UNKNOWN unless explicitly published by the utility.',
 'Research MidAmerican, Alliant, ITC Midwest and MISO process details per site.',
 '{"queue_public":true,"headroom":"UNKNOWN","primary_rto":"MISO"}'::jsonb),

('IA',8,'public_water','Public Water Systems','HIGH','FACT',
 'Iowa DNR maintains statewide Public Water Supply Facilities mapping.',
 'Resolve water utility; show population served, source and capacity/current demand only when published.',
 'Industrial service availability requires utility confirmation.',
 null,
 '{"source_keys":["ia-dnr-public-water-supply"]}'::jsonb),

('IA',9,'water_rights','Water Rights','HIGH','FACT',
 'Iowa DNR Water Allocation and Water Use Program is the primary source.',
 'Industrial withdrawal authorization exists nearby.',
 'A nearby permit/right does not establish that a new data center can obtain the same water.',
 'A Water Use Permit is required for withdrawals of at least 25,000 gallons in a 24-hour period, per the source brief.',
 '{"source_keys":["ia-dnr-water-allocation"],"permit_threshold_gpd":25000}'::jsonb),

('IA',10,'surface_water','Surface Water','HIGH','FACT',
 'Use Iowa DNR hydrography, USGS NWIS and Iowa GeoData.',
 'Nearest river; nearest lake; watershed; stream gauge.',
 'River nearby != available industrial water.',
 null,
 '{"source_keys":["ia-hydrography","usgs-nwis-ia"]}'::jsonb),

('IA',11,'groundwater','Groundwater','HIGH','FACT',
 'Use Iowa Geological Survey, Iowa DNR GIS and source-water mapping.',
 'Expose aquifers, wells, recharge areas, wellhead protection and groundwater sensitivity.',
 'Do not infer sustainable withdrawal capacity from aquifer or well proximity.',
 null,
 '{"source_keys":["ia-groundwater"]}'::jsonb),

('IA',12,'water_stress','Drought and Water Stress','PROXY','PROXY',
 'Combine Aqueduct stress, recent drought, groundwater conditions and withdrawal density.',
 'LOW / MEDIUM / HIGH water stress.',
 'The combined score is a PROXY and must expose methodology.',
 null,
 '{"source_keys":["wri-aqueduct","us-drought-monitor"],"components":["aqueduct_stress","recent_drought","groundwater_conditions","withdrawal_density"]}'::jsonb),

('IA',13,'wastewater','Wastewater','MEDIUM','UNKNOWN',
 'Use EPA sewersheds, municipal wastewater utilities and Iowa DNR discharge permits.',
 'Show service area, treatment capacity, pretreatment requirements and reclaimed-water availability when published.',
 'Unknown fields remain UNKNOWN; do not infer capacity from treatment-plant size.',
 null,
 '{"source_keys":["epa-sewersheds"]}'::jsonb),

('IA',14,'fiber','Fiber and Telecom','MEDIUM','PROXY',
 'Use Iowa broadband mapping and FCC BDC for retail-connectivity context; long-haul fiber, carrier hotels, IXPs and dark-fiber operators need additional research.',
 'CONNECTIVITY PROXY.',
 'Do not label FCC/consumer broadband as long-haul fiber proven available.',
 null,
 '{"source_keys":["ia-broadband-map","fcc-bdc"],"long_haul_fiber":"UNKNOWN"}'::jsonb),

('IA',15,'data_centers','Existing Data Centers','MEDIUM','FACT',
 'Known Iowa clusters include Council Bluffs, West Des Moines, Altoona, Cedar Rapids and Davenport; major operators in the source brief include Google, Microsoft, Meta, QTS and Apple.',
 'Show known/announced facilities separately from infrastructure capacity.',
 'Existing facilities indicate ecosystem presence and competing load, not available capacity.',
 null,
 '{"clusters":["Council Bluffs","West Des Moines","Altoona","Cedar Rapids","Davenport"]}'::jsonb),

('IA',16,'land','Land','HIGH','FACT',
 'Iowa statewide parcel/geospatial resources expose parcels, ownership, acreage, land use and assessed value.',
 'Return parcel/acreage/land-use context and acquisition-cost inputs when a defensible price source exists.',
 'Parcel availability does not establish zoning or utility service.',
 null,
 '{"source_keys":["ia-parcels"]}'::jsonb),

('IA',17,'zoning','Zoning','UNKNOWN','UNKNOWN',
 'No statewide zoning database is identified in the source brief.',
 'UNKNOWN unless researched locally.',
 'Zoning must be evaluated municipality by municipality.',
 null,
 '{}'::jsonb),

('IA',18,'moratoria','Data Center Moratoria and Regulation','MEDIUM','UNKNOWN',
 'No statewide data-center moratorium was identified in the source brief, while multiple Iowa cities/counties were reported to be considering or adopting local regulations or temporary moratoria.',
 'Regulatory review required by jurisdiction.',
 'Date every local regulatory entry and verify current ordinance status before treating it as operative.',
 'This layer is maintained and time-sensitive.',
 '{"as_of":"2026-09-19"}'::jsonb),

('IA',19,'incentives','Taxes and Incentives','HIGH','FACT',
 'Iowa offers Data Center Sales and Use Tax Incentives. The source brief identifies a major pathway tied to a minimum $200 million investment plus other statutory conditions.',
 'Potential incentives available.',
 'Never output Eligible without checking all current statutory requirements.',
 null,
 '{"source_keys":["ia-dor-data-center-incentive"],"minimum_investment_usd":200000000}'::jsonb),

('IA',20,'environmental','Environmental','HIGH','FACT',
 'Use Iowa DNR and Iowa GeoData layers for wetlands, protected lands, critical habitat, contaminated sites, water quality and environmental-justice context.',
 'Return site-specific environmental intersections/proximity with source attribution.',
 'Presence near an environmental layer is a screening constraint, not a permit determination.',
 null,
 '{"source_keys":["ia-dnr-environmental"]}'::jsonb),

('IA',21,'flood','Flood Risk','HIGH','FACT',
 'Use FEMA NFHL plus Iowa DNR floodplain mapping.',
 'FEMA zone; 100-year floodplain; 500-year floodplain.',
 null,
 null,
 '{"source_keys":["fema-nfhl"]}'::jsonb),

('IA',22,'hazards','Natural Hazards','HIGH','FACT',
 'Iowa hazard relevance in the source brief: high for tornadoes, severe thunderstorms, flooding and extreme heat; moderate for winter storms, ice storms and extreme cold; low for earthquakes, hurricanes, wildfire, sea-level rise and volcanic activity.',
 'Expose hazard-specific screening; do not collapse into an unsourced single hazard claim.',
 null,
 null,
 '{"high":["tornadoes","severe_thunderstorms","flooding","extreme_heat"],"moderate":["winter_storms","ice_storms","extreme_cold"],"low":["earthquakes","hurricanes","wildfire","sea_level_rise","volcanic_activity"]}'::jsonb),

('IA',32,'sources','Data Sources Table','HIGH','FACT',
 'Canonical Iowa source registry for the app.',
 'Every surfaced metric should retain source, quality and FACT/PROXY/ESTIMATE/UNKNOWN classification.',
 'Do not silently promote PROXY or UNKNOWN to FACT.',
 null,
 '{"source_registry":"state_research_sources"}'::jsonb)
on conflict (state_code, section_number) do update set
  section_key = excluded.section_key,
  title = excluded.title,
  reliability = excluded.reliability,
  classification = excluded.classification,
  summary = excluded.summary,
  app_output_rule = excluded.app_output_rule,
  critical_rule = excluded.critical_rule,
  notes = excluded.notes,
  metadata = excluded.metadata,
  updated_at = now();

insert into public.state_research_utilities (
  state_code, utility_name, utility_type, role, territory_available,
  large_load_process_status, source_key, notes
) values
('IA','MidAmerican Energy','investor-owned utility','distribution / generation',true,'UTILITY-SPECIFIC REVIEW REQUIRED','ia-electric-service-boundaries','Research current large-load request and tariff process before site-level claims.'),
('IA','Alliant Energy (Interstate Power and Light)','investor-owned utility','distribution / generation',true,'UTILITY-SPECIFIC REVIEW REQUIRED','ia-electric-service-boundaries','Research current data-center / large-load electric-service process before site-level claims.'),
('IA','ITC Midwest','transmission owner','transmission',false,'UTILITY-SPECIFIC REVIEW REQUIRED','ia-iuc-transmission','Transmission owner; retail serving utility must be resolved separately.'),
('IA','Municipal utilities','municipal','distribution',true,'VARIES BY MUNICIPALITY','ia-electric-service-boundaries','Local process required.'),
('IA','Rural electric cooperatives','cooperative','distribution',true,'VARIES BY COOPERATIVE','ia-electric-service-boundaries','Local process required.')
on conflict (state_code, utility_name) do update set
  utility_type = excluded.utility_type,
  role = excluded.role,
  territory_available = excluded.territory_available,
  large_load_process_status = excluded.large_load_process_status,
  source_key = excluded.source_key,
  notes = excluded.notes;

insert into public.state_research_interconnection (
  state_code, primary_market, queue_public, queue_url, study_required,
  headroom_public, next_step, process_notes
) values (
  'IA',
  'MISO (with western-boundary SPP interaction)',
  true,
  'https://www.misoenergy.org/planning/generator-interconnection/GI_Queue/',
  true,
  false,
  'Resolve the serving utility, then perform the utility-specific large-load/interconnection study; use MISO planning/queue data only as regional context.',
  'Study requirements vary by MidAmerican, Alliant, ITC Midwest and other serving utilities. A public queue does not establish substation headroom.'
)
on conflict (state_code) do update set
  primary_market = excluded.primary_market,
  queue_public = excluded.queue_public,
  queue_url = excluded.queue_url,
  study_required = excluded.study_required,
  headroom_public = excluded.headroom_public,
  next_step = excluded.next_step,
  process_notes = excluded.process_notes,
  updated_at = now();

insert into public.state_research_known_data_centers (
  state_code, operator, cluster, status, known_mw, mw_classification, source_note
) values
('IA','Google','Council Bluffs','KNOWN_CLUSTER',null,'UNKNOWN','Source brief identifies Google among major Iowa operators. Facility-level MW requires separate sourced verification.'),
('IA','Microsoft','West Des Moines','KNOWN_CLUSTER',null,'UNKNOWN','Source brief identifies Microsoft among major Iowa operators. Facility-level MW requires separate sourced verification.'),
('IA','Meta','Altoona','KNOWN_CLUSTER',null,'UNKNOWN','Source brief identifies Meta among major Iowa operators. Facility-level MW requires separate sourced verification.'),
('IA','QTS','Cedar Rapids','KNOWN_CLUSTER',null,'UNKNOWN','Source brief identifies QTS among major Iowa operators. Facility-level MW requires separate sourced verification.'),
('IA','Apple','Iowa','KNOWN_OPERATOR',null,'UNKNOWN','Source brief identifies Apple among major Iowa operators; site/cluster should be verified before mapping.')
on conflict (state_code, operator, cluster) do update set
  status = excluded.status,
  known_mw = excluded.known_mw,
  mw_classification = excluded.mw_classification,
  source_note = excluded.source_note;

insert into public.state_research_rules (
  state_code, rule_key, classification, rule_text, source_key, metadata
) values
('IA','power.no_available_mw','UNKNOWN','Never infer or display available MW from line voltage, substation size, nearby generation or map proximity.',null,'{}'::jsonb),
('IA','power.transmission_thresholds','FACT','Calculate distance to the nearest transmission line and nearest line at or above 115 kV, 230 kV and 345 kV.','ia-iuc-transmission','{"thresholds_kv":[115,230,345]}'::jsonb),
('IA','generation.label','FACT','Label generation-radius outputs NEARBY GENERATION, never available power.','eia-860-923','{"radii_miles":[10,25,50]}'::jsonb),
('IA','water.permit_threshold','FACT','The source brief states Iowa requires a Water Use Permit for withdrawals of at least 25,000 gallons in a 24-hour period.','ia-dnr-water-allocation','{"gallons_per_24h":25000}'::jsonb),
('IA','water.nearby_not_available','FACT','River, aquifer, public-system or water-right proximity does not establish industrial water availability.',null,'{}'::jsonb),
('IA','fiber.connectivity_proxy','PROXY','FCC and Iowa broadband coverage must be labeled CONNECTIVITY PROXY, not long-haul fiber proven available.','ia-broadband-map','{}'::jsonb),
('IA','zoning.local_only','UNKNOWN','No statewide zoning database is assumed; zoning is UNKNOWN until researched for the municipality/county.',null,'{}'::jsonb),
('IA','regulation.jurisdiction_review','UNKNOWN','Local data-center regulation and moratorium status must be verified for the jurisdiction and dated.','ia-dor-data-center-incentive','{"as_of":"2026-09-19"}'::jsonb),
('IA','incentives.potential_only','FACT','Output Potential incentives available; never output Eligible before statutory requirements are checked.','ia-dor-data-center-incentive','{"minimum_investment_usd":200000000}'::jsonb)
on conflict (state_code, rule_key) do update set
  classification = excluded.classification,
  rule_text = excluded.rule_text,
  source_key = excluded.source_key,
  metadata = excluded.metadata;

commit;
