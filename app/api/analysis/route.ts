import { NextRequest, NextResponse } from "next/server";
import type { ScenarioConfig } from "@/lib/types";
import { runScenarioAnalysis } from "@/lib/analysis";

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
    return NextResponse.json(analysis);
  } catch (err) {
    console.error("[api/analysis] failed:", err);
    return NextResponse.json({ error: "Analysis failed. One or more upstream data sources may be unavailable." }, { status: 502 });
  }
}
