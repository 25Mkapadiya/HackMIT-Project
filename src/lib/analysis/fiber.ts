import type { FeatureCollection, Geometry } from "geojson";
import type { FiberAnalysis, ScenarioConfig } from "@/lib/types";
import { getFetcher } from "@/lib/gis/stateGis";
import { NATIONAL_SOURCES } from "@/lib/gis/nationalSources";
import { nearestFeature } from "@/lib/spatial/geo";
import { getState, DEFAULT_STATE_ID } from "@/states/registry";
import { IXP_SEARCH_RADIUS_MI } from "@/lib/constants/assumptions";

export async function computeFiberAnalysis(scenario: ScenarioConfig): Promise<FiberAnalysis> {
  const { lng, lat, stateId } = scenario;
  const state = getState(stateId) ?? getState(DEFAULT_STATE_ID)!;
  const [west, south] = state.bounds[0];
  const [east, north] = state.bounds[1];

  const facilitiesFc = (await getFetcher(stateId, "colocation-facilities")([
    west,
    south,
    east,
    north,
  ])) as FeatureCollection<Geometry, { name?: string; city?: string }>;

  const nearest = nearestFeature(lng, lat, facilitiesFc);
  const fccConfigured = Boolean(process.env.FCC_BDC_API_KEY);

  return {
    broadbandContext: {
      label: "Retail broadband context",
      value: fccConfigured ? null : "Unknown",
      confidence: "unknown",
      source: NATIONAL_SOURCES.fccBroadband,
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
