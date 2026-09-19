import type { RegulationAnalysis, ScenarioConfig } from "@/lib/types";
import { cached, TTL } from "@/lib/cache/memoryCache";
import { WA_SOURCES } from "@/states/washington/sources";
import { getWaUtilities, matchUtility } from "@/lib/supabase/queries";

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
  utilityTerritoryName: string | null
): Promise<RegulationAnalysis> {
  const [county, utilities] = await Promise.all([
    reverseGeocodeCounty(scenario.lng, scenario.lat),
    getWaUtilities(),
  ]);
  const utility = matchUtility(utilityTerritoryName, utilities);

  return {
    utilityTerritory: {
      label: "Utility service territory",
      value: utilityTerritoryName,
      confidence: utilityTerritoryName ? "proxy" : "unknown",
      source: WA_SOURCES.waUtilityTerritories,
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
        "Large facilities in Washington typically trigger county conditional-use/site-plan review and, depending on size and location, State Environmental Policy Act (SEPA) review. Utility interconnection is a separate process from land-use permitting.",
      confidence: "estimated",
      source: {
        id: "wa-sepa-general",
        name: "Washington State Environmental Policy Act (general reference)",
        url: "https://ecology.wa.gov/regulations-permits/sepa",
        methodology: "General regulatory context, not a jurisdiction-specific legal determination.",
      },
      caveats: ["This is general context, not legal or permitting advice — requirements vary by county and project."],
    },
    utilityLargeLoadContact: {
      label: "Large-load interconnection contact",
      value: utility ? utility.large_load_process_url ?? utility.website ?? utility.name : null,
      confidence: utility ? "fact" : "unknown",
      source: {
        id: "curated-wa-utilities",
        name: "Curated WA utility directory (large-load process & contacts)",
        url: "",
        methodology: "Utility resolved by matching the ArcGIS service-territory name to a hand-curated utility record.",
      },
      caveats: utility
        ? [utility.large_load_notes, utility.large_load_contact ? `Contact: ${utility.large_load_contact}` : null].filter(
            (c): c is string => Boolean(c)
          )
        : ["Utility could not be matched from the resolved service-territory name — verify service territory manually."],
    },
  };
}
