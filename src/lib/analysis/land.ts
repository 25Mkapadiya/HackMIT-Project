import * as turf from "@turf/turf";
import type { Feature, FeatureCollection, Geometry, Polygon, MultiPolygon } from "geojson";
import type { LandAnalysis, ScenarioConfig } from "@/lib/types";
import { WA_LAYER_FETCHERS } from "@/lib/gis/layerFetchers";
import { bboxAroundMiles, milesBetween, nearestFeatureWhere, polygonContaining } from "@/lib/spatial/geo";
import { WA_SOURCES } from "@/states/washington/sources";
import { ACREAGE_PER_MW, POPULATION_RADIUS_MI } from "@/lib/constants/assumptions";
import { cached, TTL } from "@/lib/cache/memoryCache";

const UA = "Mozilla/5.0 (compatible; DataCenterSitingPlatform/1.0; +https://vercel.com)";

interface FloodProps {
  FLD_ZONE?: string;
  ZONE_SUBTY?: string;
  SFHA_TF?: string;
}
interface RoadProps {
  StateRouteNumber?: string;
  FederalFunctionalClassCode?: number;
}
interface TractProps {
  GEOID?: string;
  STATE?: string;
  COUNTY?: string;
  TRACT?: string;
  NAME?: string;
}

async function getElevationFt(lng: number, lat: number): Promise<number | null> {
  try {
    const url = `https://epqs.nationalmap.gov/v1/json?x=${lng}&y=${lat}&units=Feet&wkid=4326&includeDate=false`;
    const data = await cached(`epqs:${lng.toFixed(4)},${lat.toFixed(4)}`, TTL.ONE_DAY, async () => {
      const res = await fetch(url, { headers: { "User-Agent": UA }, cache: "no-store" });
      if (!res.ok) throw new Error(`EPQS failed (${res.status})`);
      return (await res.json()) as { value: number };
    });
    return typeof data.value === "number" ? Math.round(data.value) : null;
  } catch {
    return null;
  }
}

async function getPopulationWithin5mi(
  lng: number,
  lat: number,
  tractsFc: FeatureCollection<Geometry, TractProps>
): Promise<{ value: number | null; confidence: "estimated" | "unknown"; caveats: string[] }> {
  const apiKey = process.env.CENSUS_API_KEY;
  if (!apiKey) {
    return {
      value: null,
      confidence: "unknown",
      caveats: ["CENSUS_API_KEY is not configured on the server — population estimate is unavailable."],
    };
  }

  const buffer = turf.circle([lng, lat], POPULATION_RADIUS_MI, { units: "miles" });
  const byCounty = new Map<string, TractProps[]>();
  for (const f of tractsFc.features) {
    const p = f.properties;
    if (!p?.STATE || !p?.COUNTY) continue;
    const key = `${p.STATE}:${p.COUNTY}`;
    if (!byCounty.has(key)) byCounty.set(key, []);
    byCounty.get(key)!.push(p);
  }

  let totalPop = 0;
  try {
    for (const [key] of byCounty) {
      const [state, county] = key.split(":");
      const url = `https://api.census.gov/data/2022/acs/acs5?get=B01003_001E&for=tract:*&in=state:${state}+county:${county}&key=${apiKey}`;
      const rows = await cached(`acs:${key}`, TTL.ONE_DAY, async () => {
        const res = await fetch(url, { headers: { "User-Agent": UA }, cache: "no-store" });
        if (!res.ok) throw new Error(`ACS query failed (${res.status})`);
        return (await res.json()) as string[][];
      });
      const [header, ...data] = rows;
      if (!header) continue;
      const popIdx = header.indexOf("B01003_001E");
      const tractIdx = header.indexOf("tract");
      const popByTract = new Map<string, number>();
      for (const row of data) {
        const tractCode = row[tractIdx];
        if (!tractCode) continue;
        popByTract.set(tractCode, Number(row[popIdx]) || 0);
      }

      for (const f of tractsFc.features) {
        const p = f.properties;
        if (!p?.TRACT || p.STATE !== state || p.COUNTY !== county) continue;
        const pop = popByTract.get(p.TRACT) ?? 0;
        if (pop <= 0 || !f.geometry) continue;
        try {
          const tractGeom = f as Feature<Polygon | MultiPolygon>;
          const tractArea = turf.area(tractGeom);
          if (tractArea <= 0) continue;
          const intersection = turf.intersect(turf.featureCollection([tractGeom, buffer as Feature<Polygon>]));
          if (!intersection) continue;
          const overlapArea = turf.area(intersection);
          totalPop += pop * (overlapArea / tractArea);
        } catch {
          continue;
        }
      }
    }
    return { value: Math.round(totalPop), confidence: "estimated", caveats: [
      "Area-weighted allocation of ACS 5-year tract population against a 5-mile radius circle — assumes uniform population density within each tract.",
    ] };
  } catch {
    return { value: null, confidence: "unknown", caveats: ["Census ACS request failed."] };
  }
}

export async function computeLandAnalysis(scenario: ScenarioConfig): Promise<LandAnalysis> {
  const { lng, lat, mwLoad, acreageOverride } = scenario;

  const floodBbox = bboxAroundMiles(lng, lat, 5);
  const roadBbox = bboxAroundMiles(lng, lat, 15);
  const tractBbox = bboxAroundMiles(lng, lat, POPULATION_RADIUS_MI + 2);

  const [floodFc, roadsFc, tractsFc, elevationFt] = await Promise.all([
    WA_LAYER_FETCHERS["flood-zones"]!(floodBbox) as Promise<FeatureCollection<Geometry, FloodProps>>,
    WA_LAYER_FETCHERS["state-highways"]!(roadBbox) as Promise<FeatureCollection<Geometry, RoadProps>>,
    WA_LAYER_FETCHERS["population-tracts"]!(tractBbox) as Promise<FeatureCollection<Geometry, TractProps>>,
    getElevationFt(lng, lat),
  ]);

  const floodZone = polygonContaining(lng, lat, floodFc);
  const zoneCode = (floodZone?.properties as FloodProps | undefined)?.FLD_ZONE ?? null;
  const isHighRisk = zoneCode ? ["A", "AE", "AH", "AO", "V", "VE"].includes(zoneCode) : false;

  const nearestMajorRoad = nearestFeatureWhere(
    lng,
    lat,
    roadsFc,
    (p) => (p.FederalFunctionalClassCode ?? 99) <= 3
  );

  const population = await getPopulationWithin5mi(lng, lat, tractsFc);

  const constraints: string[] = [];
  if (floodZone) {
    constraints.push(`Site falls within FEMA flood zone ${zoneCode ?? "(unclassified)"}${isHighRisk ? " — high-risk (SFHA)" : ""}.`);
  }
  constraints.push("SEPA (WA State Environmental Policy Act) environmental review is likely required for a project of this scale.");

  const acreage = acreageOverride ?? Math.round(mwLoad * ACREAGE_PER_MW.typical * 10) / 10;

  return {
    femaFloodZone: {
      label: "FEMA flood zone",
      value: floodZone ? `${zoneCode ?? "Unclassified"}${isHighRisk ? " (high-risk / SFHA)" : ""}` : "Not in a mapped FEMA flood hazard zone (or unmapped area)",
      confidence: "fact",
      source: WA_SOURCES.femaNfhl,
      caveats: !floodZone ? ["Absence of a mapped zone can also mean the area has not been studied by FEMA."] : undefined,
    },
    elevationFt: {
      label: "Ground elevation",
      value: elevationFt,
      unit: "ft",
      confidence: elevationFt != null ? "fact" : "unknown",
      source: WA_SOURCES.usgsEpqs,
    },
    nearestMajorRoadMiles: {
      label: "Nearest state highway (functional class ≤ 3)",
      value: nearestMajorRoad.distanceMiles,
      unit: "mi",
      confidence: nearestMajorRoad.feature ? "fact" : "unknown",
      source: WA_SOURCES.wsdotHighways,
      caveats: ["State-route network only — does not include county/city arterials or private access roads."],
    },
    populationWithin5mi: {
      label: `Estimated population within ${POPULATION_RADIUS_MI} mi`,
      value: population.value,
      confidence: population.confidence,
      source: WA_SOURCES.censusAcs,
      caveats: population.caveats,
    },
    environmentalConstraints: {
      label: "Environmental / regulatory constraints",
      value: constraints,
      confidence: "proxy",
      source: WA_SOURCES.femaNfhl,
      caveats: [
        "Not a substitute for a wetlands, species, or cultural-resource survey. Only flood-zone status is derived from GIS data here.",
      ],
    },
    estimatedAcreage: {
      label: "Estimated site footprint",
      value: acreage,
      unit: "acres",
      confidence: "estimated",
      source: {
        id: "acreage-model",
        name: "Acreage-per-MW reference model",
        url: "",
        methodology: `${ACREAGE_PER_MW.typical} acres/MW (typical) × ${mwLoad} MW IT load.`,
      },
    },
  };
}
