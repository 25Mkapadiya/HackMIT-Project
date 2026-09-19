import type { DevelopmentEstimate, LandAnalysis, ScenarioConfig } from "@/lib/types";
import { CONSTRUCTION_COST_PER_MW_USD, DEVELOPMENT_TIMELINE_YEARS } from "@/lib/constants/assumptions";
import { getIncentives } from "@/lib/supabase/queries";
import { getStateGisBundle } from "@/lib/gis/stateGis";

export async function computeDevelopmentEstimate(
  scenario: ScenarioConfig,
  land: LandAnalysis
): Promise<DevelopmentEstimate> {
  const bundle = getStateGisBundle(scenario.stateId);
  const incentives = await getIncentives(bundle.stateCode);
  const [lowPerMw, highPerMw] = CONSTRUCTION_COST_PER_MW_USD;
  const low = Math.round((lowPerMw * scenario.mwLoad) / 1_000_000) * 1_000_000;
  const high = Math.round((highPerMw * scenario.mwLoad) / 1_000_000) * 1_000_000;

  return {
    acreage: land.estimatedAcreage,
    constructionCostUsd: {
      label: "Estimated construction cost",
      value: [low, high],
      unit: "USD",
      confidence: "estimated",
      source: {
        id: "cost-model",
        name: "Cost-per-MW reference model",
        url: "",
        methodology: `$${(lowPerMw / 1_000_000).toFixed(0)}M–$${(highPerMw / 1_000_000).toFixed(
          0
        )}M per critical MW (broad hyperscale/colo range) × ${scenario.mwLoad} MW.`,
      },
      caveats: ["Order-of-magnitude range only — actual cost depends heavily on site conditions, design, and market."],
    },
    timelineYears: {
      label: "Estimated development timeline",
      value: DEVELOPMENT_TIMELINE_YEARS,
      unit: "years",
      confidence: "estimated",
      source: {
        id: "timeline-model",
        name: "Timeline reference range",
        url: "",
        methodology: "Typical permitting-through-construction range for a large greenfield facility.",
      },
      caveats: ["Excludes utility interconnection queue time, which can add years and is not modeled here."],
    },
    potentialIncentives: {
      label: "Potential tax incentives",
      value: incentives.map((i) => `${i.title} (${i.status})`),
      confidence: "proxy",
      source: {
        id: `curated-${bundle.stateCode.toLowerCase()}-incentives`,
        name: `Curated ${bundle.stateCode} data center tax incentive tracker`,
        url: "",
        methodology: "Compiled from statute/agency guidance references, not a per-site eligibility determination.",
      },
      caveats: [
        "Do not assume eligibility until conditions (county, job/investment minimums, MW threshold) are checked against current statute and agency guidance.",
      ],
    },
  };
}
