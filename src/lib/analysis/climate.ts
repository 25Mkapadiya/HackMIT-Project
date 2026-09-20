import type { ClimateAnalysis, ScenarioConfig } from "@/lib/types";
import { NATIONAL_SOURCES } from "@/lib/gis/nationalSources";
import { cached, TTL } from "@/lib/cache/memoryCache";
import {
  CDD65_US_REFERENCE,
  CLIMATE_LOOKBACK_YEARS,
  CLIMATE_WUE_MULTIPLIER_BOUNDS,
  CLIMATE_WUE_SENSITIVITY,
  COOLING_DEGREE_DAY_BASE_F,
} from "@/lib/constants/assumptions";

const UA = "Mozilla/5.0 (compatible; DataCenterSitingPlatform/1.0; +https://vercel.com)";

interface OpenMeteoArchiveResponse {
  daily?: {
    time: string[];
    temperature_2m_mean: (number | null)[];
  };
}

interface ClimateStats {
  annualAvgTempF: number | null;
  coolingDegreeDays65: number | null;
}

/**
 * Point-queries Open-Meteo's free, key-free Historical Weather (ERA5) API at
 * the exact site coordinates for the most recent CLIMATE_LOOKBACK_YEARS
 * complete calendar years, and reduces the daily means to an annualized
 * average temperature and base-65°F cooling degree days. Works anywhere in
 * the contiguous/greater US at the underlying ERA5 grid resolution — no
 * county/state bucketing needed. Cached 1 day per rounded coordinate so
 * repeat scenarios near the same site (and computeWaterAnalysis's own call
 * below) share one network round trip.
 */
async function fetchClimateStats(lng: number, lat: number): Promise<ClimateStats> {
  const nowYear = new Date().getUTCFullYear();
  const endYear = nowYear - 1; // most recent COMPLETE calendar year
  const startYear = endYear - (CLIMATE_LOOKBACK_YEARS - 1);
  const key = `climate:${lat.toFixed(2)},${lng.toFixed(2)}:${startYear}-${endYear}`;

  return cached(key, TTL.ONE_DAY, async () => {
    const url =
      `https://archive-api.open-meteo.com/v1/archive?latitude=${lat}&longitude=${lng}` +
      `&start_date=${startYear}-01-01&end_date=${endYear}-12-31` +
      `&daily=temperature_2m_mean&temperature_unit=fahrenheit&timezone=UTC`;
    try {
      const res = await fetch(url, { headers: { "User-Agent": UA }, cache: "no-store" });
      if (!res.ok) throw new Error(`Open-Meteo archive query failed (${res.status})`);
      const data = (await res.json()) as OpenMeteoArchiveResponse;
      const daily = data.daily?.temperature_2m_mean?.filter((v): v is number => v != null) ?? [];
      if (daily.length === 0) return { annualAvgTempF: null, coolingDegreeDays65: null };

      const avgTempF = daily.reduce((sum, v) => sum + v, 0) / daily.length;
      const totalCdd = daily.reduce((sum, v) => sum + Math.max(0, v - COOLING_DEGREE_DAY_BASE_F), 0);
      const yearsCovered = daily.length / 365.25;
      const annualizedCdd = totalCdd / yearsCovered;

      return {
        annualAvgTempF: Math.round(avgTempF * 10) / 10,
        coolingDegreeDays65: Math.round(annualizedCdd),
      };
    } catch {
      return { annualAvgTempF: null, coolingDegreeDays65: null };
    }
  });
}

export async function computeClimateAnalysis(scenario: ScenarioConfig): Promise<ClimateAnalysis> {
  const { lng, lat } = scenario;
  const { annualAvgTempF, coolingDegreeDays65 } = await fetchClimateStats(lng, lat);
  const yearRangeLabel = `${new Date().getUTCFullYear() - CLIMATE_LOOKBACK_YEARS}-${new Date().getUTCFullYear() - 1}`;

  return {
    annualAvgTempF: {
      label: "Annual average temperature",
      value: annualAvgTempF,
      unit: "°F",
      confidence: annualAvgTempF != null ? "estimated" : "unknown",
      source: NATIONAL_SOURCES.openMeteoArchive,
      caveats:
        annualAvgTempF != null
          ? [`${CLIMATE_LOOKBACK_YEARS}-year average (${yearRangeLabel}) from ERA5 reanalysis at this point, not a 30-year climate normal.`]
          : ["Could not reach the Open-Meteo archive for this location — temperature context is unavailable."],
    },
    coolingDegreeDays65: {
      label: "Cooling degree days (base 65°F)",
      value: coolingDegreeDays65,
      unit: "CDD65/yr",
      confidence: coolingDegreeDays65 != null ? "estimated" : "unknown",
      source: NATIONAL_SOURCES.openMeteoArchive,
      caveats: [
        `Standard proxy for cooling-system workload; contiguous-US 1991-2020 average is roughly ${CDD65_US_REFERENCE} CDD65/yr for comparison.`,
      ],
    },
  };
}

/**
 * Multiplier applied to the evaporative water-use estimate in water.ts,
 * scaling with the site's cooling-degree-day burden relative to the national
 * reference. Exported separately (rather than folded into
 * computeClimateAnalysis) so water.ts can get just the number it needs
 * without re-deriving it from the display Metric shape.
 */
export async function computeClimateWaterMultiplier(scenario: ScenarioConfig): Promise<{
  multiplier: number;
  annualAvgTempF: number | null;
  coolingDegreeDays65: number | null;
}> {
  const { lng, lat } = scenario;
  const { annualAvgTempF, coolingDegreeDays65 } = await fetchClimateStats(lng, lat);
  if (coolingDegreeDays65 == null) {
    return { multiplier: 1, annualAvgTempF, coolingDegreeDays65 };
  }

  const relativeDelta = (coolingDegreeDays65 - CDD65_US_REFERENCE) / CDD65_US_REFERENCE;
  const rawMultiplier = 1 + CLIMATE_WUE_SENSITIVITY * relativeDelta;
  const [min, max] = CLIMATE_WUE_MULTIPLIER_BOUNDS;
  const multiplier = Math.min(max, Math.max(min, rawMultiplier));

  return { multiplier: Math.round(multiplier * 100) / 100, annualAvgTempF, coolingDegreeDays65 };
}
