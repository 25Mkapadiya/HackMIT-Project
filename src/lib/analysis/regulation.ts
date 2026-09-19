import type { RegulationAnalysis, ScenarioConfig } from "@/lib/types";
import { cached, TTL } from "@/lib/cache/memoryCache";
import { getUtilities, matchUtility } from "@/lib/supabase/queries";
import { getSource, type StateAnalysisContext } from "./context";

const UA = "Mozilla/5.0 (compatible; DataCenterSitingPlatform/1.0; +https://vercel.com)";

interface CensusGeographyResponse {
  result: {
    geographies: {
      Counties?: { NAME: string; STATE: string }[];
    };
  };
}

async function reverseGeocodeCounty(lng: number, lat: number): Promise<string | null> {
  const url = `https://geocoding.geo.census.gov/geocoder/geographies/coordinates?x=${lng}&y=${lat}&benchmark=Public_AR_Current&vintage=Current_Current&layers=Counties&format=json`;
  try {
    const data = await cached(`county:${lng.toFixed(3)},${lat.toFixed(3)}`, TTL.ONE_DAY, async () => {
      const res = await fetch(url, { headers: { "User-Agent": UA }, cache: "no-store" });
      if (!res.ok) throw new Error(`Census geocoder failed (${res.status})`);
      return (await res.json()) as CensusGeographyResponse;
    });
    return data.result.geographies.Counties?.[0]?.NAME ?? null;
  } catch {
    return null;
  }
}

export async function computeRegulationAnalysis(
  scenario: ScenarioConfig,
  utilityTerritoryName: string | null,
  ctx: StateAnalysisContext
): Promise<RegulationAnalysis> {
  const utilityTerritorySource = getSource(ctx, "utilityTerritories");

  const [county, utilities] = await Promise.all([
    reverseGeocodeCounty(scenario.lng, scenario.lat),
    getUtilities(ctx.stateCode),
  ]);
  const utility = matchUtility(utilityTerritoryName, utilities);

  return {
    utilityTerritory: {
      label: "Utility service territory",
      value: utilityTerritoryName,
      confidence: utilityTerritoryName ? "proxy" : "unknown",
      source: utilityTerritorySource,
    },
    county: {
      label: "County",
      value: county,
      confidence: county ? "fact" : "unknown",
      source: {
        id: "census-geocoder",
        name: "US Census Bureau Geocoder",
        url: "https://geocoding.geo.census.gov/geocoder/",
        methodology: "Reverse point-in-polygon lookup against current county boundaries.",
      },
    },
    permittingNote: {
      label: "General permitting context",
      value:
        ctx.permittingNote ??
        "Large facilities typically trigger county conditional-use/site-plan review and, depending on size and location, state environmental review. Utility interconnection is a separate process from land-use permitting.",
      confidence: "estimated",
      source: {
        id: `${ctx.stateId}-permitting-general`,
        name: `${ctx.stateCode} general permitting reference`,
        url: "",
        methodology: "General regulatory context, not a jurisdiction-specific legal determination.",
      },
      caveats: ["This is general context, not legal or permitting advice — requirements vary by county and project."],
    },
    utilityLargeLoadContact: {
      label: "Large-load interconnection contact",
      value: utility ? utility.large_load_process_url ?? utility.website ?? utility.name : null,
      confidence: utility ? "fact" : "unknown",
      source: {
        id: `curated-${ctx.stateCode.toLowerCase()}-utilities`,
        name: `Curated ${ctx.stateCode} utility directory (large-load process & contacts)`,
        url: "",
        methodology: "Utility resolved by matching the live service-territory name to a hand-curated utility record.",
      },
      caveats: utility
        ? [utility.large_load_notes, utility.large_load_contact ? `Contact: ${utility.large_load_contact}` : null].filter(
            (c): c is string => Boolean(c)
          )
        : ["Utility could not be matched from the resolved service-territory name — verify service territory manually."],
    },
  };
}
