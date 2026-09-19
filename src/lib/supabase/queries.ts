import { getSupabaseServerClient } from "./server";
import { cached, TTL } from "@/lib/cache/memoryCache";

/**
 * Read-side helpers for the state-research tables (utilities, hazards,
 * incentives). These are WA-wide reference data, not per-coordinate GIS
 * queries, so they're cached process-wide rather than per-bbox.
 */

export interface UtilityRecord {
  name: string;
  utility_type: string | null;
  website: string | null;
  large_load_process_url: string | null;
  large_load_contact: string | null;
  large_load_notes: string | null;
}

export interface HazardRecord {
  hazard_type: string;
  risk_level: string;
  description: string | null;
}

export interface IncentiveRecord {
  title: string;
  category: string;
  status: string;
  description: string | null;
  eligibility_notes: string | null;
  date_verified: string;
}

export async function getWaUtilities(): Promise<UtilityRecord[]> {
  const supabase = getSupabaseServerClient();
  if (!supabase) return [];
  return cached("wa-utilities", TTL.ONE_DAY, async () => {
    const { data, error } = await supabase
      .from("utilities")
      .select("name, utility_type, website, large_load_process_url, large_load_contact, large_load_notes")
      .eq("state_code", "WA");
    if (error) {
      console.error("[supabase] utilities query failed:", error);
      return [];
    }
    return data ?? [];
  });
}

export async function getWaHazards(): Promise<HazardRecord[]> {
  const supabase = getSupabaseServerClient();
  if (!supabase) return [];
  return cached("wa-hazards", TTL.ONE_DAY, async () => {
    const { data, error } = await supabase
      .from("hazards")
      .select("hazard_type, risk_level, description")
      .eq("state_code", "WA");
    if (error) {
      console.error("[supabase] hazards query failed:", error);
      return [];
    }
    return data ?? [];
  });
}

export async function getWaIncentives(): Promise<IncentiveRecord[]> {
  const supabase = getSupabaseServerClient();
  if (!supabase) return [];
  return cached("wa-incentives", TTL.ONE_DAY, async () => {
    const { data, error } = await supabase
      .from("incentives")
      .select("title, category, status, description, eligibility_notes, date_verified")
      .eq("state_code", "WA");
    if (error) {
      console.error("[supabase] incentives query failed:", error);
      return [];
    }
    return data ?? [];
  });
}

/**
 * The live ArcGIS utility-territory layer (WA_SOURCES.waUtilityTerritories)
 * returns a free-text `Name` field (e.g. "PUBLIC UTILITY DISTRICT NO 2 OF
 * GRANT COUNTY") that doesn't match our seeded utilities.name verbatim.
 * Match on the utility's identifying keyword rather than exact string.
 */
const TERRITORY_KEYWORDS: [RegExp, string][] = [
  [/GRANT/i, "Grant County PUD"],
  [/CHELAN/i, "Chelan County PUD"],
  [/DOUGLAS/i, "Douglas County PUD"],
  [/PUGET SOUND/i, "Puget Sound Energy"],
  [/AVISTA/i, "Avista"],
  [/PACIFICORP|PACIFIC POWER/i, "PacifiCorp"],
  [/SEATTLE CITY LIGHT|CITY OF SEATTLE/i, "Seattle City Light"],
  [/TACOMA/i, "Tacoma Power"],
  [/BONNEVILLE|\bBPA\b/i, "Bonneville Power Administration (BPA)"],
];

export function matchUtility(territoryName: string | null, utilities: UtilityRecord[]): UtilityRecord | null {
  if (!territoryName) return null;
  for (const [pattern, name] of TERRITORY_KEYWORDS) {
    if (pattern.test(territoryName)) {
      return utilities.find((u) => u.name === name) ?? null;
    }
  }
  return null;
}
