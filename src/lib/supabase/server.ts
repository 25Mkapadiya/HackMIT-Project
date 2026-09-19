import { createClient } from "@supabase/supabase-js";
import type { Database } from "./types";

/**
 * Server-side Supabase client. Reference tables (data_sources, utilities,
 * existing_data_centers, etc.) are public-read; scenarios/scenario_analyses
 * accept anon insert. Both are covered by RLS policies, so the publishable
 * anon key is safe to use here even though this only runs server-side.
 */
export function getSupabaseServerClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key) return null;
  return createClient<Database>(url, key, {
    auth: { persistSession: false },
  });
}
