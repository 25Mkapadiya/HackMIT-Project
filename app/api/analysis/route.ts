import { NextRequest, NextResponse } from "next/server";
import type { ScenarioConfig } from "@/lib/types";
import { runScenarioAnalysis } from "@/lib/analysis";
import { getSupabaseServerClient } from "@/lib/supabase/server";
import type { Json } from "@/lib/supabase/types";

export const dynamic = "force-dynamic";
export const maxDuration = 30;

export async function POST(req: NextRequest) {
  let scenario: ScenarioConfig;
  try {
    scenario = (await req.json()) as ScenarioConfig;
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  if (
    typeof scenario?.lng !== "number" ||
    typeof scenario?.lat !== "number" ||
    typeof scenario?.mwLoad !== "number"
  ) {
    return NextResponse.json({ error: "scenario.lng, scenario.lat, and scenario.mwLoad are required" }, { status: 400 });
  }

  try {
    const analysis = await runScenarioAnalysis(scenario);
    void persistScenario(scenario, analysis);
    return NextResponse.json(analysis);
  } catch (err) {
    console.error("[api/analysis] failed:", err);
    return NextResponse.json({ error: "Analysis failed. One or more upstream data sources may be unavailable." }, { status: 502 });
  }
}

/**
 * Best-effort persistence of the proposed site + its computed result to
 * Supabase, so scenarios survive beyond the browser's in-memory store.
 * Never blocks or fails the analysis response — this is a record, not a
 * dependency of the feature.
 */
async function persistScenario(scenario: ScenarioConfig, analysis: Awaited<ReturnType<typeof runScenarioAnalysis>>) {
  const supabase = getSupabaseServerClient();
  if (!supabase) return;
  try {
    const { error: scenarioError } = await supabase.from("scenarios").insert({
      id: scenario.id,
      state_code: "WA",
      label: scenario.label,
      lng: scenario.lng,
      lat: scenario.lat,
      mw_load: scenario.mwLoad,
      buildings: scenario.buildings,
      cooling_technology: scenario.coolingTechnology,
      loop_type: scenario.loopType,
      cooling_medium: scenario.coolingMedium,
      acreage_override: scenario.acreageOverride ?? null,
      redundancy: scenario.redundancy,
    });
    // Ignore duplicate-id conflicts (re-running analysis on an already-saved scenario).
    if (scenarioError && scenarioError.code !== "23505") throw scenarioError;

    const { error: analysisError } = await supabase.from("scenario_analyses").insert({
      scenario_id: scenario.id,
      power: analysis.power as unknown as Json,
      fiber: analysis.fiber as unknown as Json,
      regulation: analysis.regulation as unknown as Json,
      water: analysis.water as unknown as Json,
      land: analysis.land as unknown as Json,
      development: analysis.development as unknown as Json,
      gaps: analysis.gaps as unknown as Json,
    });
    if (analysisError) throw analysisError;
  } catch (err) {
    console.error("[api/analysis] failed to persist scenario to Supabase:", err);
  }
}
