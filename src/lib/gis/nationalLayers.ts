import type { Feature, FeatureCollection, Geometry, Point } from "geojson";
import { queryArcGisGeoJSON } from "./arcgis";
import { cached, TTL } from "@/lib/cache/memoryCache";
import { getSupabaseServerClient } from "@/lib/supabase/server";
import { NATIONAL_SOURCES } from "./nationalSources";
import type { Bbox, LayerFetcher } from "./types";

/**
 * Fetchers for datasets that are genuinely nationwide — the exact same
 * service/schema works for any US state, just filtered by bbox and/or a
 * state code parameter. Every state's own layerFetchers module imports and
 * re-uses these rather than re-implementing them. See nationalSources.ts
 * for the matching SourceMeta.
 */

const UA = "Mozilla/5.0 (compatible; DataCenterSitingPlatform/1.0; +https://vercel.com)";

export function inBbox(lng: number, lat: number, bbox: Bbox): boolean {
  return lng >= bbox[0] && lng <= bbox[2] && lat >= bbox[1] && lat <= bbox[3];
}

/**
 * Geometry generalization tolerance (degrees), scaled to query width.
 * A statewide query (~8° wide) gets generalized hard (huge polygon layers like
 * FEMA flood zones and census tracts are multi-tens-of-MB at full resolution);
 * a small analysis-radius query (a few tenths of a degree) stays effectively
 * full-resolution, since exact-boundary precision matters there.
 */
export function generalizationFor(bbox: Bbox): number {
  const width = bbox[2] - bbox[0];
  return Math.max(0.00005, width / 600);
}

/**
 * Wraps a set of fetchers so an upstream failure (rate limit, outage, timeout)
 * degrades just that one layer/metric to "no features" rather than throwing
 * through the analysis pipeline or the map's GIS route. Callers read an empty
 * FeatureCollection as "unavailable" and label the corresponding metric
 * UNKNOWN — they never see the exception.
 */
export function withGracefulDegradation(
  fetchers: Record<string, LayerFetcher<any>>
): Record<string, LayerFetcher<any>> {
  return Object.fromEntries(
    Object.entries(fetchers).map(([layerId, fetcher]) => [
      layerId,
      async (bbox: Bbox) => {
        try {
          return await fetcher(bbox);
        } catch (err) {
          console.error(`[layer:${layerId}] fetch failed, treating as unavailable:`, err instanceof Error ? err.message : err);
          return { type: "FeatureCollection", features: [] } as FeatureCollection<Geometry, Record<string, unknown>>;
        }
      },
    ])
  );
}

// ---------------------------------------------------------------- WATER (national USGS)

export async function fetchHydrographyRivers(bbox: Bbox) {
  return queryArcGisGeoJSON(NATIONAL_SOURCES.usgsNhdFlowline.url, { bbox, outFields: "GNIS_Name,FType" }, TTL.ONE_DAY);
}

export async function fetchHydrographyWaterbodies(bbox: Bbox) {
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

export function makeUsgsGaugesFetcher(stateAbbrev: string): LayerFetcher<any> {
  return async (bbox: Bbox): Promise<FeatureCollection<Point>> => {
    const url = `https://waterservices.usgs.gov/nwis/iv/?format=json&stateCd=${stateAbbrev}&siteType=ST&parameterCd=00060&siteStatus=active`;
    const data = await cached(`usgs-gauges-${stateAbbrev.toLowerCase()}`, TTL.FIFTEEN_MINUTES, async () => {
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
  };
}

// ---------------------------------------------------------- CONNECTIVITY (national PeeringDB)

interface PeeringDbFacility {
  id: number;
  name: string;
  city: string;
  state: string;
  latitude: number | null;
  longitude: number | null;
  website: string | null;
}

export function makeColocationFacilitiesFetcher(stateAbbrev: string): LayerFetcher<any> {
  return async (bbox: Bbox): Promise<FeatureCollection<Point>> => {
    const data = await cached(`peeringdb-fac-${stateAbbrev.toLowerCase()}`, TTL.ONE_DAY, async () => {
      const res = await fetch(`https://www.peeringdb.com/api/fac?country=US&state=${stateAbbrev}`, {
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
  };
}

// ----------------------------------------------------------- ENVIRONMENT (national FEMA)

export async function fetchFloodZones(bbox: Bbox) {
  return queryArcGisGeoJSON(
    NATIONAL_SOURCES.femaNfhl.url,
    { bbox, outFields: "FLD_ZONE,ZONE_SUBTY,SFHA_TF", maxAllowableOffset: generalizationFor(bbox) },
    TTL.ONE_DAY
  );
}

// ------------------------------------------------------------- COMMUNITY (national Census)

export async function fetchPopulationTracts(bbox: Bbox) {
  return queryArcGisGeoJSON(
    "https://tigerweb.geo.census.gov/arcgis/rest/services/TIGERweb/tigerWMS_Current/MapServer/8",
    { bbox, outFields: "GEOID,NAME,BASENAME,STATE,COUNTY,TRACT", maxAllowableOffset: generalizationFor(bbox) },
    TTL.ONE_DAY
  );
}

// ----------------------------------------------------- EXISTING INFRA (national EIA + Supabase)

export function makePowerPlantsFetcher(stateAbbrev: string): LayerFetcher<any> {
  return async (bbox: Bbox): Promise<FeatureCollection<Point>> => {
    const apiKey = process.env.EIA_API_KEY;
    if (!apiKey) {
      return { type: "FeatureCollection", features: [] };
    }
    // EIA v2 does not expose per-plant lat/lng directly on the generation-capacity route;
    // the operating generator inventory route below includes plant-level lat/lon.
    const url = `https://api.eia.gov/v2/electricity/operating-generator-capacity/data/?api_key=${apiKey}&frequency=monthly&data[]=nameplate-capacity-mw&facets[stateid][]=${stateAbbrev}&sort[0][column]=period&sort[0][direction]=desc&length=500`;
    try {
      const data = await cached(`eia-generators-${stateAbbrev.toLowerCase()}`, TTL.ONE_DAY, async () => {
        const res = await fetch(url, { cache: "no-store" });
        if (!res.ok) throw new Error(`EIA query failed (${res.status})`);
        return res.json();
      });
      // Defensive: EIA responses vary; this route does not reliably return lat/lon,
      // so we surface it only if present, otherwise return empty (handled as UNKNOWN upstream).
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
  };
}

export interface DataCenterProps {
  name: string;
  operator: string;
  city: string;
  approxCriticalMw: number | null;
  notes: string;
}

/**
 * Reads existing_data_centers from Supabase filtered by state_code, with an
 * optional hand-curated static fallback (only Washington has one — every
 * other state returns an empty collection if Supabase is unavailable or has
 * no rows yet, which is the honest answer, not a fabricated one).
 */
export function makeDataCentersFetcher(
  stateAbbrev: string,
  staticFallback?: FeatureCollection<Point, DataCenterProps>
): LayerFetcher<DataCenterProps> {
  return async (bbox: Bbox): Promise<FeatureCollection<Point, DataCenterProps>> => {
    const supabase = getSupabaseServerClient();
    if (supabase) {
      const { data, error } = await cached(`existing-data-centers-${stateAbbrev.toLowerCase()}`, TTL.ONE_DAY, async () => {
        return supabase.from("existing_data_centers").select("*").eq("state_code", stateAbbrev);
      });
      if (!error && data) {
        const features: Feature<Point, DataCenterProps>[] = data
          .filter((r) => inBbox(r.longitude, r.latitude, bbox))
          .map((r) => ({
            type: "Feature",
            geometry: { type: "Point", coordinates: [r.longitude, r.latitude] },
            properties: {
              name: r.name,
              operator: r.operator ?? "Unknown",
              city: r.city ?? "",
              approxCriticalMw: r.known_mw ?? r.estimated_mw ?? null,
              notes: r.notes ?? "",
            },
          }));
        return { type: "FeatureCollection", features };
      }
      console.error(`[fetchDataCenters:${stateAbbrev}] Supabase query failed:`, error);
    }

    const fallback = staticFallback?.features ?? [];
    const features = fallback.filter((f) => inBbox(f.geometry.coordinates[0]!, f.geometry.coordinates[1]!, bbox));
    return { type: "FeatureCollection", features };
  };
}
