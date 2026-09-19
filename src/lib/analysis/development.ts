import type { DevelopmentEstimate, LandAnalysis, ScenarioConfig } from "@/lib/types";
import { CONSTRUCTION_COST_PER_MW_USD, DEVELOPMENT_TIMELINE_YEARS } from "@/lib/constants/assumptions";

export function computeDevelopmentEstimate(scenario: ScenarioConfig, land: LandAnalysis): DevelopmentEstimate {
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
  };
}
