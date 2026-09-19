import type { FeatureCollection } from "geojson";
import { queryArcGisGeoJSON, type Bbox } from "@/lib/gis/arcgis";
import {
  fetchUsgsGauges,
  fetchColocationFacilities,
  fetchFemaFloodZones,
  fetchPopulationTracts,
  fetchEiaPowerPlants,
  fetchHifldTransmissionLines,
  fetchUsDroughtMonitor,
  makeExistingDataCentersFetcher,
} from "@/lib/gis/nationalFetchers";
import { MN_SOURCES } from "./sources";

/**
 * Minnesota-specific fetchers. Raw ArcGIS field names differ from the
 * HIFLD/BPA-derived vocabulary the rest of the app (power.ts, popupContent.ts,
 * layerStyles.ts) already reads — each fetcher below remaps the state's own
 * schema into that same vocabulary (Name for utility territory, GNIS_Name for
 * hydrography) at the fetch boundary, so nothing downstream needs to know
 * Minnesota's field names. See src/lib/gis/nationalFetchers.ts for the shared
 * national fetchers (transmission, population, flood zones, generation,
 * colocation, streamflow, drought, data centers).
 *
 * No "water-diversions" entry: Minnesota's water-appropriation-permit system
 * (MPARS) is a login-gated web app with no public REST/GIS endpoint — land.ts's
 * nearbyWaterRightsCount metric degrades to UNKNOWN rather than guessing.
 */

// ---------------------------------------------------------------- POWER
// Minnesota's own official transmission-line dataset (MnGeo util-elec-trans)
// was withdrawn — Commerce could not keep it accurate — so transmission uses
// the shared nationwide HIFLD mirror, same as Oklahoma.

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

function generalizationFor(bbox: Bbox): number {
  const width = bbox[2] - bbox[0];
  return Math.max(0.00005, width / 600);
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
// Minnesota DNR's own Public Waters Inventory is used in place of the shared
// nationwide USGS NHD hydrography — more current MN-specific naming.

interface PwiWatercourseProps {
  kittle_name?: string;
}
interface PwiBasinProps {
  pw_basin_name?: string;
}

async function fetchHydrographyRivers(bbox: Bbox) {
  const raw = await queryArcGisGeoJSON<PwiWatercourseProps>(MN_SOURCES.dnrPublicWatersLines.url, {
    bbox,
    outFields: "kittle_name",
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
    outFields: "pw_basin_name",
    maxAllowableOffset: generalizationFor(bbox),
  });
  return {
    type: "FeatureCollection" as const,
    features: raw.features.map((f) => ({
      ...f,
      properties: {
        GNIS_Name: f.properties?.pw_basin_name && f.properties.pw_basin_name !== "Unnamed" ? f.properties.pw_basin_name : null,
      },
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

const RAW_FETCHERS: Record<string, (bbox: Bbox) => Promise<FeatureCollection>> = {
  "transmission-lines": fetchHifldTransmissionLines,
  "substations": fetchSubstations,
  "utility-territories": fetchUtilityTerritories,
  "hydrography-rivers": fetchHydrographyRivers,
  "hydrography-waterbodies": fetchHydrographyWaterbodies,
  "drought-areas": fetchUsDroughtMonitor,
  "usgs-gauges": (bbox) => fetchUsgsGauges(bbox, "MN"),
  "colocation-facilities": (bbox) => fetchColocationFacilities(bbox, "MN"),
  "broadband-coverage": fetchBroadbandCoverage,
  "flood-zones": fetchFemaFloodZones,
  "protected-land": fetchProtectedLand,
  "population-tracts": fetchPopulationTracts,
  "data-centers": makeExistingDataCentersFetcher("MN"),
  "power-plants": (bbox) => fetchEiaPowerPlants(bbox, "MN"),
  // No "state-highways" entry: no verified Minnesota road-classification GIS
  // service was found for this integration. land.ts's nearestMajorRoadMiles
  // metric degrades to UNKNOWN for Minnesota rather than guessing.
};

/** Same fail-soft wrapping as WA_LAYER_FETCHERS/OK_LAYER_FETCHERS — see those files for rationale. */
export const MN_LAYER_FETCHERS: Record<string, (bbox: Bbox) => Promise<FeatureCollection>> = Object.fromEntries(
  Object.entries(RAW_FETCHERS).map(([layerId, fetcher]) => [
    layerId,
    async (bbox: Bbox): Promise<FeatureCollection> => {
      try {
        return await fetcher(bbox);
      } catch (err) {
        console.error(`[mn-layer:${layerId}] fetch failed, treating as unavailable:`, err instanceof Error ? err.message : err);
        return { type: "FeatureCollection", features: [] };
      }
    },
  ])
);
