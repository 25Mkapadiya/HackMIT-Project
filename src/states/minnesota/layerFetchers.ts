import type { Feature, FeatureCollection, Geometry, Point } from "geojson";
import { queryArcGisGeoJSON } from "@/lib/gis/arcgis";
import { MN_SOURCES } from "./sources";
import {
  fetchFloodZones,
  fetchPopulationTracts,
  generalizationFor,
  makeColocationFacilitiesFetcher,
  makeDataCentersFetcher,
  makePowerPlantsFetcher,
  makeUsgsGaugesFetcher,
  withGracefulDegradation,
} from "@/lib/gis/nationalLayers";
import type { Bbox, LayerFetcher } from "@/lib/gis/types";

/**
 * Minnesota-specific fetchers. Raw ArcGIS field names differ from the
 * HIFLD/BPA-derived vocabulary the rest of the app (power.ts, popupContent.ts,
 * layerStyles.ts) already reads — each fetcher below remaps the state's own
 * schema into that same vocabulary (XRefCd/OperatingLineNm/VoltageMeas for
 * transmission, Name for utility territory, GNIS_Name for hydrography) at
 * the fetch boundary, so nothing downstream needs to know Minnesota's field
 * names. See src/lib/gis/nationalLayers.ts for the shared national fetchers
 * (population, flood zones, generation, colocation, streamflow, data centers).
 */

// ---------------------------------------------------------------- POWER

interface HifldTransmissionProps {
  ID?: string;
  VOLTAGE?: number;
  OWNER?: string;
  STATUS?: string;
  SUB_1?: string;
  SUB_2?: string;
}

async function fetchTransmissionLines(bbox: Bbox) {
  const raw = await queryArcGisGeoJSON<HifldTransmissionProps>(MN_SOURCES.transmissionNational.url, {
    bbox,
    outFields: "ID,VOLTAGE,OWNER,STATUS,SUB_1,SUB_2",
  });
  return {
    type: "FeatureCollection" as const,
    features: raw.features.map((f) => ({
      ...f,
      properties: {
        XRefCd: f.properties?.ID ?? null,
        OperatingLineNm: [f.properties?.SUB_1, f.properties?.SUB_2].filter(Boolean).join(" – ") || null,
        VoltageMeas: nullIfSentinel(f.properties?.VOLTAGE),
        Owner: f.properties?.OWNER && f.properties.OWNER !== "NOT AVAILABLE" ? f.properties.OWNER : null,
        Status: f.properties?.STATUS ?? null,
      },
    })),
  };
}

interface HifldSubstationProps {
  ID?: string;
  NAME?: string;
  MAX_VOLT?: number;
  MIN_VOLT?: number;
  STATUS?: string;
}

// HIFLD encodes "no data" as a literal -999999 sentinel on numeric fields
// (confirmed via a live sample query — several MN records mix real values
// like 69/115/138 with -999999 on the same feature).
function nullIfSentinel(v: number | undefined): number | null {
  return v == null || v === -999999 ? null : v;
}

async function fetchSubstations(bbox: Bbox) {
  const raw = await queryArcGisGeoJSON<HifldSubstationProps>(MN_SOURCES.substationsNational.url, {
    bbox,
    where: "STATE='MN'",
    outFields: "ID,NAME,MAX_VOLT,MIN_VOLT,STATUS",
  });
  return {
    type: "FeatureCollection" as const,
    features: raw.features.map((f) => ({
      ...f,
      properties: {
        name: f.properties?.NAME && !/^UNKNOWN/i.test(f.properties.NAME) ? f.properties.NAME : "Unnamed substation",
        maxVoltageKv: nullIfSentinel(f.properties?.MAX_VOLT),
        minVoltageKv: nullIfSentinel(f.properties?.MIN_VOLT),
        status: f.properties?.STATUS ?? null,
      },
    })),
  };
}

interface EusaProps {
  elec_comp?: string;
  full_name?: string;
  mpuc_name?: string;
  type?: string;
}

async function fetchUtilityTerritories(bbox: Bbox) {
  const raw = await queryArcGisGeoJSON<EusaProps>(MN_SOURCES.utilityServiceAreas.url, {
    bbox,
    outFields: "elec_comp,full_name,mpuc_name,type",
    maxAllowableOffset: generalizationFor(bbox),
  });
  return {
    type: "FeatureCollection" as const,
    features: raw.features.map((f) => ({
      ...f,
      properties: {
        Name: f.properties?.full_name ?? f.properties?.mpuc_name ?? f.properties?.elec_comp ?? null,
        UtilityType: f.properties?.type ?? null,
      },
    })),
  };
}

// ---------------------------------------------------------------- WATER

interface PwiWatercourseProps {
  kittle_name?: string;
  length_mi?: number;
}
interface PwiBasinProps {
  pw_basin_name?: string;
  pwi_label?: string;
  acres?: number;
}

async function fetchHydrographyRivers(bbox: Bbox) {
  const raw = await queryArcGisGeoJSON<PwiWatercourseProps>(MN_SOURCES.dnrPublicWatersLines.url, {
    bbox,
    outFields: "kittle_name,length_mi",
  });
  return {
    type: "FeatureCollection" as const,
    features: raw.features.map((f) => ({
      ...f,
      properties: { GNIS_Name: f.properties?.kittle_name ?? null },
    })),
  };
}

async function fetchHydrographyWaterbodies(bbox: Bbox) {
  const raw = await queryArcGisGeoJSON<PwiBasinProps>(MN_SOURCES.dnrPublicWatersBasins.url, {
    bbox,
    outFields: "pw_basin_name,pwi_label,acres",
    maxAllowableOffset: generalizationFor(bbox),
  });
  return {
    type: "FeatureCollection" as const,
    features: raw.features.map((f) => ({
      ...f,
      properties: { GNIS_Name: f.properties?.pw_basin_name && f.properties.pw_basin_name !== "Unnamed" ? f.properties.pw_basin_name : null },
    })),
  };
}

// --------------------------------------------------------- CONNECTIVITY

interface FiberCoverageProps {
  TechType?: string;
}

async function fetchBroadbandCoverage(bbox: Bbox) {
  return queryArcGisGeoJSON<FiberCoverageProps>(MN_SOURCES.deedBroadbandFiber.url, {
    bbox,
    where: "TechType='Fiber'",
    outFields: "TechType",
    maxAllowableOffset: generalizationFor(bbox),
  });
}

// ----------------------------------------------------------- ENVIRONMENT

interface RimEasementProps {
  ease_type?: string;
  ease_acres?: number;
  exp_status?: string;
}

async function fetchProtectedLand(bbox: Bbox) {
  return queryArcGisGeoJSON<RimEasementProps>(MN_SOURCES.bwsrConservationEasements.url, {
    bbox,
    outFields: "ease_type,ease_acres,exp_status",
  });
}

const RAW_FETCHERS: Record<string, LayerFetcher<any>> = {
  "transmission-lines": fetchTransmissionLines,
  "substations": fetchSubstations,
  "utility-territories": fetchUtilityTerritories,
  "hydrography-rivers": fetchHydrographyRivers,
  "hydrography-waterbodies": fetchHydrographyWaterbodies,
  "usgs-gauges": makeUsgsGaugesFetcher("MN"),
  "colocation-facilities": makeColocationFacilitiesFetcher("MN"),
  "broadband-coverage": fetchBroadbandCoverage,
  "flood-zones": fetchFloodZones,
  "protected-land": fetchProtectedLand,
  "population-tracts": fetchPopulationTracts,
  "data-centers": makeDataCentersFetcher("MN"),
  "power-plants": makePowerPlantsFetcher("MN"),
};

export const MN_LAYER_FETCHERS: Record<string, LayerFetcher<any>> = withGracefulDegradation(RAW_FETCHERS);
