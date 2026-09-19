import type {
  FiberAnalysis,
  InfrastructureGap,
  LandAnalysis,
  PowerAnalysis,
  RegulationAnalysis,
  WaterAnalysis,
} from "@/lib/types";
import { TRANSMISSION_PROXIMITY_BANDS } from "@/lib/constants/assumptions";

/**
 * Synthesizes plain-language infrastructure gaps from the sequential analysis output.
 * Deliberately rule-based and transparent rather than a black-box score — every gap
 * traces back to a specific metric computed earlier in the pipeline.
 */
export function synthesizeGaps(
  power: PowerAnalysis,
  fiber: FiberAnalysis,
  regulation: RegulationAnalysis,
  water: WaterAnalysis,
  land: LandAnalysis,
  stateCode: string
): InfrastructureGap[] {
  const gaps: InfrastructureGap[] = [];

  const nearestKv = power.nearestTransmission.distanceMiles;
  if (nearestKv == null) {
    gaps.push({
      category: "power",
      severity: "likely_required",
      summary: "No mapped transmission line found near this site.",
      detail: "No transmission line was found within the search radius. New transmission or a long interconnection extension is likely required.",
    });
  } else if (nearestKv > TRANSMISSION_PROXIMITY_BANDS.moderate) {
    gaps.push({
      category: "power",
      severity: "likely_required",
      summary: `Nearest transmission line is ${nearestKv} mi away.`,
      detail: "Significant new transmission or distribution build-out is likely required to reach the grid at this distance.",
    });
  } else if (nearestKv > TRANSMISSION_PROXIMITY_BANDS.close) {
    gaps.push({
      category: "power",
      severity: "watch",
      summary: `Nearest transmission line is ${nearestKv} mi away.`,
      detail: "A dedicated interconnection line/tap extension is likely needed to reach the site.",
    });
  }

  gaps.push({
    category: "power",
    severity: "likely_required",
    summary: "Interconnection study required to confirm available capacity.",
    detail: "Transmission proximity does not indicate available substation/feeder headroom. A formal interconnection study with the serving utility or transmission operator is the standard next step for a facility of this size.",
  });

  if (fiber.nearestIxp.distanceMiles == null || fiber.nearestIxp.distanceMiles > 25) {
    gaps.push({
      category: "fiber",
      severity: "watch",
      summary: "No nearby colocation/interconnection facility identified.",
      detail: "Long-haul fiber routing to this site is unverified. Confirm carrier availability directly with regional providers.",
    });
  }

  if (water.waterStressLabel.value === "High") {
    gaps.push({
      category: "water",
      severity: "likely_required",
      summary: "Site is within a declared drought area.",
      detail: "Water-cooled designs may face permitting or supply constraints. Consider air-cooled or closed-loop alternatives, or confirm supply with the local water purveyor.",
    });
  } else if (water.waterStressLabel.value === "Medium") {
    gaps.push({
      category: "water",
      severity: "watch",
      summary: "Moderate existing water-right allocation density nearby.",
      detail: "Multiple existing water rights were found near this site — new water rights or a municipal supply agreement may take longer to secure.",
    });
  }

  if (water.nearestWaterBody.distanceMiles == null || water.nearestWaterBody.distanceMiles > 10) {
    gaps.push({
      category: "water",
      severity: "watch",
      summary: "No major surface water body found nearby.",
      detail: "Open-loop / evaporative cooling designs relying on surface water withdrawal may not be viable at this location; groundwater or municipal supply would need to be confirmed.",
    });
  }

  const floodValue = String(land.femaFloodZone.value ?? "");
  if (floodValue.includes("high-risk")) {
    gaps.push({
      category: "land",
      severity: "likely_required",
      summary: "Site is in a FEMA high-risk (SFHA) flood zone.",
      detail: "Flood mitigation design and flood insurance requirements are likely, and permitting may be more complex.",
    });
  }

  if (land.nearestMajorRoadMiles.value != null && land.nearestMajorRoadMiles.value > 5) {
    gaps.push({
      category: "land",
      severity: "watch",
      summary: `Nearest state highway is ${land.nearestMajorRoadMiles.value} mi away.`,
      detail: "Construction logistics and equipment delivery may require new or upgraded access roads.",
    });
  }

  if (regulation.county.value == null) {
    gaps.push({
      category: "land",
      severity: "info",
      summary: "Jurisdiction could not be determined automatically.",
      detail: "Confirm the governing county/city directly to scope permitting requirements.",
    });
  }

  const highHazards = land.naturalHazards.value.filter((h) => h.endsWith("HIGH"));
  if (highHazards.length > 0) {
    gaps.push({
      category: "land",
      severity: "watch",
      summary: `${highHazards.length} statewide hazard(s) rated HIGH for ${stateCode}.`,
      detail: `${highHazards.join(", ")}. Confirm design provisions appropriate to these hazards during engineering — this is a statewide baseline, not a site-specific study.`,
    });
  }

  return gaps;
}
