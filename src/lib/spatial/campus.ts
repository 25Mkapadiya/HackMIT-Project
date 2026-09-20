import * as turf from "@turf/turf";
import type { Feature, FeatureCollection, Polygon } from "geojson";
import type { ScenarioConfig } from "@/lib/types";
import { getCoolingTechOption } from "@/lib/constants/options";

export interface BuildingProps {
  buildingIndex: number;
  heightM: number;
  scenarioId: string;
}

/**
 * Generates a simple grid of extruded building footprints around a scenario's
 * point, sized loosely from the configured acreage/building count. This is a
 * schematic campus visualization, not a site plan.
 */
export function generateCampusFootprint(scenario: ScenarioConfig): FeatureCollection<Polygon, BuildingProps> {
  const { lng, lat, buildings, coolingTechnology } = scenario;
  const n = Math.max(1, Math.min(buildings, 12));
  const cols = Math.ceil(Math.sqrt(n));
  const rows = Math.ceil(n / cols);

  const buildingSideM = 70; // ~ illustrative hyperscale-hall footprint
  const gapM = 40;
  const cellM = buildingSideM + gapM;
  const heightM = getCoolingTechOption(coolingTechnology).medium === "water_cooled" ? 16 : 14;

  const features: Feature<Polygon, BuildingProps>[] = [];
  let idx = 0;
  const originOffsetX = -((cols - 1) * cellM) / 2;
  const originOffsetY = -((rows - 1) * cellM) / 2;

  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      if (idx >= n) break;
      const cx = originOffsetX + c * cellM;
      const cy = originOffsetY + r * cellM;
      const half = buildingSideM / 2;
      const corners: [number, number][] = [
        [cx - half, cy - half],
        [cx + half, cy - half],
        [cx + half, cy + half],
        [cx - half, cy + half],
        [cx - half, cy - half],
      ];
      const coords = corners.map(([dx, dy]) => offsetMeters(lng, lat, dx, dy));
      features.push({
        type: "Feature",
        geometry: { type: "Polygon", coordinates: [coords] },
        properties: { buildingIndex: idx, heightM, scenarioId: scenario.id },
      });
      idx += 1;
    }
  }

  return { type: "FeatureCollection", features };
}

function offsetMeters(lng: number, lat: number, dxM: number, dyM: number): [number, number] {
  const origin = turf.point([lng, lat]);
  const distKm = Math.hypot(dxM, dyM) / 1000;
  if (distKm === 0) return [lng, lat];
  const bearing = (Math.atan2(dxM, dyM) * 180) / Math.PI;
  const dest = turf.destination(origin, distKm, bearing, { units: "kilometers" });
  return dest.geometry.coordinates as [number, number];
}
