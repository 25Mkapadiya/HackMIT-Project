import type { RegulationAnalysis, ScenarioConfig } from "@/lib/types";
import { cached, TTL } from "@/lib/cache/memoryCache";
import { getStateGisBundle } from "@/lib/gis/stateGis";
import { NATIONAL_SOURCES } from "@/lib/gis/nationalSources";
import { getUtilities, matchUtility } from "@/lib/supabase/queries";

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
  const bundle = getStateGisBundle(scenario.stateId);
  const [county, utilities] = await Promise.all([
    reverseGeocodeCounty(scenario.lng, scenario.lat),
    getUtilities(bundle.stateCode),
  ]);
  const utility = matchUtility(utilityTerritoryName, utilities);

  return {
    utilityTerritory: {
      label: "Utility service territory",
      value: utilityTerritoryName,
      confidence: utilityTerritoryName ? "proxy" : "unknown",
      source: bundle.utilityTerritorySource,
    },
    county: {
      label: "County",
      value: county,
      confidence: county ? "fact" : "unknown",
      source: NATIONAL_SOURCES.censusGeocoder,
    },
    permittingNote: {
      label: "General permitting context",
      value: bundle.permittingNote.text,
      confidence: "estimated",
      source: bundle.permittingNote.source,
      caveats: ["This is general context, not legal or permitting advice — requirements vary by county and project."],
    },
    utilityLargeLoadContact: {
      label: "Large-load interconnection contact",
      value: utility ? utility.large_load_process_url ?? utility.website ?? utility.name : null,
      confidence: utility ? "fact" : "unknown",
      source: {
        id: `curated-${bundle.stateCode.toLowerCase()}-utilities`,
        name: `Curated ${bundle.stateCode} utility directory (large-load process & contacts)`,
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
