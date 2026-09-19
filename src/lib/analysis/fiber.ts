import type { FiberAnalysis, ScenarioConfig } from "@/lib/types";
import { nearestFeature } from "@/lib/spatial/geo";
import { IXP_SEARCH_RADIUS_MI } from "@/lib/constants/assumptions";
import { fetchLayer, getSource, type StateAnalysisContext } from "./context";

export async function computeFiberAnalysis(scenario: ScenarioConfig, ctx: StateAnalysisContext): Promise<FiberAnalysis> {
  const { lng, lat } = scenario;
  const [west, south] = ctx.bounds[0];
  const [east, north] = ctx.bounds[1];
  const fccSource = getSource(ctx, "fccBroadband");
  const peeringDbSource = getSource(ctx, "peeringDb");

  const facilitiesFc = await fetchLayer<{ name?: string; city?: string }>(ctx, "colocation-facilities", [
    west,
    south,
    east,
    north,
  ]);

  const nearest = nearestFeature(lng, lat, facilitiesFc);
  const fccConfigured = Boolean(process.env.FCC_BDC_API_KEY);

  return {
    broadbandContext: {
      label: "Retail broadband context",
      value: fccConfigured ? null : "Unknown",
      confidence: "unknown",
      source: fccSource,
      caveats: fccConfigured
        ? []
        : [
            "FCC_BDC_API_KEY is not configured on the server — retail broadband availability is unavailable.",
            "Retail broadband availability is not a reliable indicator of long-haul/enterprise fiber capacity in any case.",
          ],
    },
    nearestIxp: {
      distanceMiles:
        nearest.distanceMiles != null && nearest.distanceMiles <= IXP_SEARCH_RADIUS_MI ? nearest.distanceMiles : null,
      nearestFeatureLabel: nearest.feature?.properties?.name ?? null,
      confidence: nearest.feature ? "fact" : "unknown",
      source: peeringDbSource,
    },
    longHaulFiberAvailability: {
      label: "Long-haul fiber route availability",
      value: "Unknown",
      confidence: "unknown",
      source: peeringDbSource,
      caveats: [
        "No public long-haul fiber route dataset is integrated. Colocation-facility proximity is a weak proxy for interconnection density, not a survey of actual fiber routes.",
        "Architecture supports plugging in a licensed or state DOT conduit/fiber dataset later without UI changes.",
      ],
    },
  };
}
