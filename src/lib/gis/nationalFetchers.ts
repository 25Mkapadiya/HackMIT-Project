import type { Feature, FeatureCollection, Geometry, Point } from "geojson";
import { queryArcGisGeoJSON, type Bbox } from "./arcgis";
import { cached, TTL } from "@/lib/cache/memoryCache";
import { NATIONAL_SOURCES } from "./nationalSources";

const UA = "Mozilla/5.0 (compatible; DataCenterSitingPlatform/1.0; +https://vercel.com)";

function inBbox(lng: number, lat: number, bbox: Bbox): boolean {
  return lng >= bbox[0] && lng <= bbox[2] && lat >= bbox[1] && lat <= bbox[3];
}

/** Same generalization heuristic as layerFetchers.ts — see that file for rationale. */
function generalizationFor(bbox: Bbox): number {
  const width = bbox[2] - bbox[0];
  return Math.max(0.00005, width / 600);
}

// ---------------------------------------------------------------- WATER (nationwide)

export async function fetchNhdFlowline(bbox: Bbox) {
  return queryArcGisGeoJSON(NATIONAL_SOURCES.usgsNhdFlowline.url, { bbox, outFields: "GNIS_Name,FType" }, TTL.ONE_DAY);
}

export async function fetchNhdWaterbody(bbox: Bbox) {
  return queryArcGisGeoJSON(NATIONAL_SOURCES.usgsNhdWaterbody.url, { bbox, outFields: "GNIS_Name,FType" }, TTL.ONE_DAY);
}

interface NwisTimeSeries {
  sourceInfo: {
    siteName: string;
    siteCode: { value: string }[];
    geoLocation: { geogLocation: { latitude: number; longitude: number } };
  };
  variable: { variableName: string; unit: { unitCode: string } };
  values: { value: { value: string; dateTime: string }[] }[];
}

export async function fetchUsgsGauges(bbox: Bbox, stateAbbr: string): Promise<FeatureCollection<Point>> {
  const url = `https://waterservices.usgs.gov/nwis/iv/?format=json&stateCd=${stateAbbr}&siteType=ST&parameterCd=00060&siteStatus=active`;
  const data = await cached(`usgs-gauges-${stateAbbr.toLowerCase()}`, TTL.FIFTEEN_MINUTES, async () => {
    const res = await fetch(url, { headers: { "User-Agent": UA }, cache: "no-store" });
    if (!res.ok) throw new Error(`USGS NWIS query failed (${res.status})`);
    return (await res.json()) as { value: { timeSeries: NwisTimeSeries[] } };
  });

  const features: Feature<Point>[] = [];
  for (const ts of data.value.timeSeries) {
    const lat = ts.sourceInfo.geoLocation.geogLocation.latitude;
    const lng = ts.sourceInfo.geoLocation.geogLocation.longitude;
    if (!inBbox(lng, lat, bbox)) continue;
    const latest = ts.values[0]?.value[ts.values[0]?.value.length - 1];
    features.push({
      type: "Feature",
      geometry: { type: "Point", coordinates: [lng, lat] },
      properties: {
        siteName: ts.sourceInfo.siteName,
        siteCode: ts.sourceInfo.siteCode[0]?.value ?? null,
        variable: ts.variable.variableName,
        unit: ts.variable.unit.unitCode,
        latestValue: latest?.value ?? null,
        latestDateTime: latest?.dateTime ?? null,
      },
    });
  }
  return { type: "FeatureCollection", features };
}

/** Nationwide weekly drought classification (D0-D4) — see NATIONAL_SOURCES.usDroughtMonitor. */
export async function fetchUsDroughtMonitor(bbox: Bbox) {
  return queryArcGisGeoJSON(
    NATIONAL_SOURCES.usDroughtMonitor.url,
    { bbox, outFields: "DM" },
    TTL.ONE_DAY
  );
}

// ---------------------------------------------------------- CONNECTIVITY (nationwide)

interface PeeringDbFacility {
  id: number;
  name: string;
  city: string;
  state: string;
  latitude: number | null;
  longitude: number | null;
  website: string | null;
}

export async function fetchColocationFacilities(bbox: Bbox, stateAbbr: string): Promise<FeatureCollection<Point>> {
  const data = await cached(`peeringdb-fac-${stateAbbr.toLowerCase()}`, TTL.ONE_DAY, async () => {
    const res = await fetch(`https://www.peeringdb.com/api/fac?country=US&state=${stateAbbr}`, {
      headers: { "User-Agent": UA, Accept: "application/json" },
      cache: "no-store",
    });
    if (!res.ok) throw new Error(`PeeringDB query failed (${res.status})`);
    return (await res.json()) as { data: PeeringDbFacility[] };
  });

  const features: Feature<Point>[] = data.data
    .filter((f) => f.latitude != null && f.longitude != null && inBbox(f.longitude, f.latitude, bbox))
    .map((f) => ({
      type: "Feature",
      geometry: { type: "Point", coordinates: [f.longitude as number, f.latitude as number] },
      properties: { name: f.name, city: f.city, website: f.website },
    }));
  return { type: "FeatureCollection", features };
}

// ----------------------------------------------------------- ENVIRONMENT (nationwide)

export async function fetchFemaFloodZones(bbox: Bbox) {
  return queryArcGisGeoJSON(
    NATIONAL_SOURCES.femaNfhl.url,
    { bbox, outFields: "FLD_ZONE,ZONE_SUBTY,SFHA_TF", maxAllowableOffset: generalizationFor(bbox) },
    TTL.ONE_DAY
  );
}

// ------------------------------------------------------------- COMMUNITY (nationwide)

export async function fetchPopulationTracts(bbox: Bbox) {
  return queryArcGisGeoJSON(
    NATIONAL_SOURCES.censusTiger.url + "/8",
    { bbox, outFields: "GEOID,NAME,BASENAME,STATE,COUNTY,TRACT", maxAllowableOffset: generalizationFor(bbox) },
    TTL.ONE_DAY
  );
}

// ------------------------------------------------------------------ POWER (nationwide)

export async function fetchEiaPowerPlants(bbox: Bbox, stateAbbr: string): Promise<FeatureCollection<Point>> {
  const apiKey = process.env.EIA_API_KEY;
  if (!apiKey) {
    return { type: "FeatureCollection", features: [] };
  }
  const url = `https://api.eia.gov/v2/electricity/operating-generator-capacity/data/?api_key=${apiKey}&frequency=monthly&data[]=nameplate-capacity-mw&facets[stateid][]=${stateAbbr}&sort[0][column]=period&sort[0][direction]=desc&length=500`;
  try {
    const data = await cached(`eia-generators-${stateAbbr.toLowerCase()}`, TTL.ONE_DAY, async () => {
      const res = await fetch(url, { cache: "no-store" });
      if (!res.ok) throw new Error(`EIA query failed (${res.status})`);
      return res.json();
    });
    const rows: any[] = data?.response?.data ?? [];
    const features: Feature<Point>[] = rows
      .filter((r) => typeof r.latitude === "number" && typeof r.longitude === "number")
      .filter((r) => inBbox(r.longitude, r.latitude, bbox))
      .map((r) => ({
        type: "Feature",
        geometry: { type: "Point", coordinates: [r.longitude, r.latitude] },
        properties: {
          plantName: r["plantName"] ?? r["plant-name"] ?? "Unknown",
          fuel: r["energy-source-desc"] ?? r["technology"] ?? "Unknown",
          nameplateMw: r["nameplate-capacity-mw"] ?? null,
        },
      }));
    return { type: "FeatureCollection", features };
  } catch {
    return { type: "FeatureCollection", features: [] };
  }
}

interface HifldTransmissionRaw {
  owner?: string;
  voltage?: number | string;
  volt_class?: string;
  type?: string;
  status?: string;
  id?: string;
  source?: string;
}

/**
 * HIFLD's nationwide transmission-line extract, normalized onto the SAME property
 * names Washington's BPA feed already uses (VoltageMeas / OperatingLineNm / XRefCd)
 * so the map's voltage-based styling (layerStyles.ts), the popup (popupContent.ts),
 * and the analysis engine (power.ts) all work unmodified regardless of which state's
 * fetcher produced the feature. See Step 6 in the integration brief this follows:
 * "The frontend should NOT need to understand each state's original field names."
 */
export async function fetchHifldTransmissionLines(bbox: Bbox): Promise<FeatureCollection<Geometry, Record<string, unknown>>> {
  const fc = await queryArcGisGeoJSON<HifldTransmissionRaw>(
    NATIONAL_SOURCES.hifldTransmission.url,
    { bbox, outFields: "owner,voltage,volt_class,type,status,id,source" },
    TTL.ONE_DAY
  );
  return {
    type: "FeatureCollection",
    features: fc.features.map((f) => {
      const p = f.properties ?? {};
      const voltage = typeof p.voltage === "number" ? p.voltage : Number(p.voltage) || null;
      return {
        ...f,
        properties: {
          VoltageMeas: voltage,
          OperatingLineNm: p.owner ? `${p.owner}${p.type ? ` (${p.type})` : ""}` : null,
          XRefCd: p.id ?? null,
          Owner: p.owner ?? null,
          Status: p.status ?? null,
          Source: p.source ?? null,
        },
      };
    }),
  };
}

interface HifldTerritoryRaw {
  NAME?: string;
  STATE?: string;
  TYPE?: string;
}

/** Normalized onto WA's `Name` property so utility-territories works unmodified for any state. */
export async function fetchHifldUtilityTerritories(bbox: Bbox): Promise<FeatureCollection<Geometry, Record<string, unknown>>> {
  const fc = await queryArcGisGeoJSON<HifldTerritoryRaw>(
    NATIONAL_SOURCES.hifldUtilityTerritories.url,
    { bbox, outFields: "NAME,STATE,TYPE", maxAllowableOffset: generalizationFor(bbox) },
    TTL.ONE_DAY
  );
  return {
    type: "FeatureCollection",
    features: fc.features.map((f) => ({
      ...f,
      properties: {
        Name: f.properties?.NAME ?? null,
        State: f.properties?.STATE ?? null,
        UtilityType: f.properties?.TYPE ?? null,
      },
    })),
  };
}
