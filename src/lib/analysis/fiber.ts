import type { FeatureCollection, Geometry } from "geojson";
import type { Confidence, FiberAnalysis, ScenarioConfig } from "@/lib/types";
import { getFetcher } from "@/lib/gis/stateGis";
import { NATIONAL_SOURCES } from "@/lib/gis/nationalSources";
import { nearestFeature } from "@/lib/spatial/geo";
import { getState, DEFAULT_STATE_ID } from "@/states/registry";
import { IXP_SEARCH_RADIUS_MI } from "@/lib/constants/assumptions";
import { cached, TTL } from "@/lib/cache/memoryCache";

const UA = "Mozilla/5.0 (compatible; DataCenterSitingPlatform/1.0; +https://vercel.com)";

interface CensusTractGeographyResponse {
  result: {
    geographies: {
      "Census Tracts"?: { NAME: string; STATE: string; COUNTY: string; TRACT: string }[];
    };
  };
}

async function getTract(lng: number, lat: number): Promise<{ state: string; county: string; tract: string; name: string } | null> {
  const url = `https://geocoding.geo.census.gov/geocoder/geographies/coordinates?x=${lng}&y=${lat}&benchmark=Public_AR_Current&vintage=Current_Current&layers=Census%20Tracts&format=json`;
  try {
    const data = await cached(`tract:${lng.toFixed(3)},${lat.toFixed(3)}`, TTL.ONE_DAY, async () => {
      const res = await fetch(url, { headers: { "User-Agent": UA }, cache: "no-store" });
      if (!res.ok) throw new Error(`Census geocoder failed (${res.status})`);
      return (await res.json()) as CensusTractGeographyResponse;
    });
    const tract = data.result.geographies["Census Tracts"]?.[0];
    return tract ? { state: tract.STATE, county: tract.COUNTY, tract: tract.TRACT, name: tract.NAME } : null;
  } catch {
    return null;
  }
}

interface AcsSubjectRow {
  totalHouseholds: number | null;
  anyBroadbandPct: number | null;
  wirelineBroadbandPct: number | null;
}

/**
 * Live per-tract ACS Subject Table S2801 lookup — see NATIONAL_SOURCES.censusBroadband
 * for why this stands in for a point-level FCC BDC query, which the BDC Public
 * Data API doesn't offer (bulk file downloads only).
 */
async function getTractBroadband(state: string, county: string, tract: string): Promise<AcsSubjectRow | null> {
  const url = `https://api.census.gov/data/2022/acs/acs5/subject?get=NAME,S2801_C01_001E,S2801_C02_014E,S2801_C02_017E&for=tract:${tract}&in=state:${state}+county:${county}&key=${process.env.CENSUS_API_KEY}`;
  try {
    const rows = await cached(`acs-broadband:${state}${county}${tract}`, TTL.ONE_DAY, async () => {
      const res = await fetch(url, { headers: { "User-Agent": UA }, cache: "no-store" });
      if (!res.ok) throw new Error(`ACS subject query failed (${res.status})`);
      return (await res.json()) as string[][];
    });
    const [header, row] = rows;
    if (!header || !row) return null;
    const idx = (name: string) => header.indexOf(name);
    const num = (name: string) => {
      const v = Number(row[idx(name)]);
      return Number.isFinite(v) && v >= 0 ? v : null;
    };
    return {
      totalHouseholds: num("S2801_C01_001E"),
      anyBroadbandPct: num("S2801_C02_014E"),
      wirelineBroadbandPct: num("S2801_C02_017E"),
    };
  } catch {
    return null;
  }
}

async function computeBroadbandContext(
  lng: number,
  lat: number
): Promise<{ value: string | null; confidence: Confidence; caveats: string[] }> {
  const censusConfigured = Boolean(process.env.CENSUS_API_KEY);
  if (!censusConfigured) {
    return {
      value: null,
      confidence: "unknown",
      caveats: [
        "CENSUS_API_KEY is not configured on the server — retail broadband context is unavailable.",
        "The FCC's own Broadband Data Collection API only exposes bulk per-state file downloads, not a live per-point lookup, so it can't fill this in directly either — see the source note for details.",
      ],
    };
  }

  const tract = await getTract(lng, lat);
  if (!tract) {
    return { value: null, confidence: "unknown", caveats: ["Census tract could not be determined for this location."] };
  }

  const row = await getTractBroadband(tract.state, tract.county, tract.tract);
  if (!row || row.wirelineBroadbandPct == null) {
    return {
      value: null,
      confidence: "unknown",
      caveats: [`Broadband subscription data was not returned for ${tract.name}.`],
    };
  }

  return {
    value: `${Math.round(row.wirelineBroadbandPct)}% of households have wireline broadband (cable/fiber/DSL)`,
    confidence: "estimated",
    caveats: [
      `${tract.name}: ~${Math.round(row.wirelineBroadbandPct)}% of households subscribe to wireline broadband; ~${
        row.anyBroadbandPct != null ? Math.round(row.anyBroadbandPct) : "—"
      }% subscribe to any broadband (incl. cellular/satellite)${row.totalHouseholds != null ? ` of ${row.totalHouseholds.toLocaleString()} households` : ""}.`,
      "A household-subscription (demand-side) figure from the Census Bureau, not a provider-reported availability survey — the FCC's Broadband Data Collection API doesn't expose a live per-point availability query, only bulk per-state downloads.",
      "Not a substitute for confirming actual serviceable bandwidth/latency with carriers for a commercial site.",
    ],
  };
}

export async function computeFiberAnalysis(scenario: ScenarioConfig): Promise<FiberAnalysis> {
  const { lng, lat, stateId } = scenario;
  const state = getState(stateId) ?? getState(DEFAULT_STATE_ID)!;
  const [west, south] = state.bounds[0];
  const [east, north] = state.bounds[1];

  const [facilitiesFc, broadband] = await Promise.all([
    getFetcher(stateId, "colocation-facilities")([west, south, east, north]) as Promise<
      FeatureCollection<Geometry, { name?: string; city?: string }>
    >,
    computeBroadbandContext(lng, lat),
  ]);

  const nearest = nearestFeature(lng, lat, facilitiesFc);

  return {
    broadbandContext: {
      label: "Retail broadband context",
      value: broadband.value,
      confidence: broadband.confidence,
      source: NATIONAL_SOURCES.censusBroadband,
      caveats: broadband.caveats,
    },
    nearestIxp: {
      distanceMiles:
        nearest.distanceMiles != null && nearest.distanceMiles <= IXP_SEARCH_RADIUS_MI ? nearest.distanceMiles : null,
      nearestFeatureLabel: nearest.feature?.properties?.name ?? null,
      confidence: nearest.feature ? "fact" : "unknown",
      source: NATIONAL_SOURCES.peeringDb,
    },
    longHaulFiberAvailability: {
      label: "Long-haul fiber route availability",
      value: "Unknown",
      confidence: "unknown",
      source: NATIONAL_SOURCES.peeringDb,
      caveats: [
        "No public long-haul fiber route dataset is integrated. Colocation-facility proximity is a weak proxy for interconnection density, not a survey of actual fiber routes.",
        "Architecture supports plugging in a licensed or state DOT conduit/fiber dataset later without UI changes.",
      ],
    },
  };
}
