import { getSupabaseServerClient } from "./server";
import { cached, TTL } from "@/lib/cache/memoryCache";

/**
 * Read-side helpers for the state-research tables (utilities, hazards,
 * incentives). These are statewide reference data, not per-coordinate GIS
 * queries, so they're cached process-wide (per state) rather than per-bbox.
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

export async function getUtilities(stateCode: string): Promise<UtilityRecord[]> {
  const supabase = getSupabaseServerClient();
  if (!supabase) return [];
  return cached(`utilities:${stateCode}`, TTL.ONE_DAY, async () => {
    const { data, error } = await supabase
      .from("utilities")
      .select("name, utility_type, website, large_load_process_url, large_load_contact, large_load_notes")
      .eq("state_code", stateCode);
    if (error) {
      console.error(`[supabase] utilities query failed for ${stateCode}:`, error);
      return [];
    }
    return data ?? [];
  });
}

export async function getHazards(stateCode: string): Promise<HazardRecord[]> {
  const supabase = getSupabaseServerClient();
  if (!supabase) return [];
  return cached(`hazards:${stateCode}`, TTL.ONE_DAY, async () => {
    const { data, error } = await supabase
      .from("hazards")
      .select("hazard_type, risk_level, description")
      .eq("state_code", stateCode);
    if (error) {
      console.error(`[supabase] hazards query failed for ${stateCode}:`, error);
      return [];
    }
    return data ?? [];
  });
}

export async function getIncentives(stateCode: string): Promise<IncentiveRecord[]> {
  const supabase = getSupabaseServerClient();
  if (!supabase) return [];
  return cached(`incentives:${stateCode}`, TTL.ONE_DAY, async () => {
    const { data, error } = await supabase
      .from("incentives")
      .select("title, category, status, description, eligibility_notes, date_verified")
      .eq("state_code", stateCode);
    if (error) {
      console.error(`[supabase] incentives query failed for ${stateCode}:`, error);
      return [];
    }
    return data ?? [];
  });
}

/**
 * Live ArcGIS utility-territory layers return a free-text name field (e.g.
 * "PUBLIC UTILITY DISTRICT NO 2 OF GRANT COUNTY" or "XCEL ENERGY SERVICE
 * AREA") that won't match our seeded utilities.name verbatim, and the
 * wording pattern differs by state — so instead of a hardcoded per-state
 * keyword list, derive each utility's distinguishing token(s) from its own
 * name (stripping generic corporate/utility words) and match on whichever
 * token is unique within that state's utility list. Works for any state's
 * seeded utilities without per-state code.
 */
const GENERIC_UTILITY_WORDS = new Set([
  "UTILITY", "UTILITIES", "DISTRICT", "ENERGY", "POWER", "COMPANY", "CO", "INC", "LLC",
  "COOPERATIVE", "COOP", "MUNICIPAL", "CITY", "COUNTY", "PUBLIC", "ELECTRIC", "ELECTRICAL",
  "ADMINISTRATION", "AND", "THE", "OF", "FEDERAL", "MARKETING", "LIGHT", "GAS", "GRID",
  "GROUP", "SERVICE", "SERVICES", "GENERAL", "PUD", "NO", "AREA", "SYSTEM",
]);

function tokenize(name: string): string[] {
  return name
    .toUpperCase()
    .replace(/[^A-Z0-9 ]/g, " ")
    .split(/\s+/)
    .filter((w) => w.length > 2 && !GENERIC_UTILITY_WORDS.has(w));
}

export function matchUtility(territoryName: string | null, utilities: UtilityRecord[]): UtilityRecord | null {
  if (!territoryName || utilities.length === 0) return null;
  const territoryUpper = territoryName.toUpperCase();

  const tokenCounts = new Map<string, number>();
  const tokensByUtility = utilities.map((u) => {
    const tokens = tokenize(u.name);
    for (const t of tokens) tokenCounts.set(t, (tokenCounts.get(t) ?? 0) + 1);
    return { utility: u, tokens };
  });

  let best: UtilityRecord | null = null;
  let bestScore = 0;
  for (const { utility, tokens } of tokensByUtility) {
    // Only count tokens that are unique to this utility within the state's list —
    // a token every utility shares (e.g. the state's own name) carries no signal.
    const distinctive = tokens.filter((t) => tokenCounts.get(t) === 1);
    const score = distinctive.filter((t) => territoryUpper.includes(t)).length;
    if (score > bestScore) {
      bestScore = score;
      best = utility;
    }
  }
  return best;
}
