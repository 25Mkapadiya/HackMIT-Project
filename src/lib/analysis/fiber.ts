import type { FeatureCollection, Geometry } from "geojson";
import type { FiberAnalysis, ScenarioConfig } from "@/lib/types";
import { WA_LAYER_FETCHERS } from "@/lib/gis/layerFetchers";
import { nearestFeature } from "@/lib/spatial/geo";
import { WA_SOURCES } from "@/states/washington/sources";
import { WASHINGTON } from "@/states/washington";
import { IXP_SEARCH_RADIUS_MI } from "@/lib/constants/assumptions";

export async function computeFiberAnalysis(scenario: ScenarioConfig): Promise<FiberAnalysis> {
  const { lng, lat } = scenario;
  const [west, south] = WASHINGTON.bounds[0];
  const [east, north] = WASHINGTON.bounds[1];

  const facilitiesFc = (await WA_LAYER_FETCHERS["colocation-facilities"]!([
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
      source: WA_SOURCES.fccBroadband,
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
      source: WA_SOURCES.peeringDb,
    },
    longHaulFiberAvailability: {
      label: "Long-haul fiber route availability",
      value: "Unknown",
      confidence: "unknown",
      source: WA_SOURCES.peeringDb,
      caveats: [
        "No public long-haul fiber route dataset is integrated. Colocation-facility proximity is a weak proxy for interconnection density, not a survey of actual fiber routes.",
        "Architecture supports plugging in a licensed or state DOT conduit/fiber dataset later without UI changes.",
      ],
    },
  };
}
