import type {
  FiberAnalysis,
  InfrastructureGap,
  LandAnalysis,
  NoiseAnalysis,
  PowerAnalysis,
  RegulationAnalysis,
  WaterAnalysis,
} from "@/lib/types";
import { TRANSMISSION_PROXIMITY_BANDS, VOLTAGE_TIERS } from "@/lib/constants/assumptions";

/**
 * Synthesizes plain-language infrastructure gaps from the sequential analysis output.
 * Deliberately rule-based and transparent rather than a black-box score — every gap
 * traces back to a specific metric computed earlier in the pipeline.
 *
 * Copy here is written for a general audience, not an engineer: short sentences,
 * no acronyms/jargon (kV, SFHA, PUE, etc.) without a plain-language stand-in, and
 * one clear idea per gap rather than a technical justification.
 */
export function synthesizeGaps(
  power: PowerAnalysis,
  fiber: FiberAnalysis,
  regulation: RegulationAnalysis,
  water: WaterAnalysis,
  land: LandAnalysis,
  noise: NoiseAnalysis
): InfrastructureGap[] {
  const gaps: InfrastructureGap[] = [];

  const nearestKv = power.nearestTransmission.distanceMiles;
  if (nearestKv == null) {
    gaps.push({
      category: "power",
      severity: "likely_required",
      summary: "No power line found nearby.",
      detail: "Building a new connection to the power grid would likely be needed, which adds cost and time.",
    });
  } else if (nearestKv > TRANSMISSION_PROXIMITY_BANDS.moderate) {
    gaps.push({
      category: "power",
      severity: "likely_required",
      summary: `The closest power line is ${nearestKv} mi away.`,
      detail: "That's far enough that a new power line would likely need to be built to reach this site.",
    });
  } else if (nearestKv > TRANSMISSION_PROXIMITY_BANDS.close) {
    gaps.push({
      category: "power",
      severity: "watch",
      summary: `The closest power line is ${nearestKv} mi away.`,
      detail: "A new connector line would likely be needed to reach the site.",
    });
  }

  gaps.push({
    category: "power",
    severity: "likely_required",
    summary: "The power company needs to confirm there's enough capacity.",
    detail: "Being near a power line doesn't guarantee it has room for a facility this size — that has to be checked and approved by the local utility.",
  });

  const nearestSubMi = power.nearestSubstation.distanceMiles;
  const substationLabel = power.nearestSubstation.nearestFeatureLabel;
  if (nearestSubMi == null) {
    gaps.push({
      category: "power",
      severity: "likely_required",
      summary: "No power substation found nearby.",
      detail: "A new substation, or a long new power line, would likely be needed to connect this site.",
    });
  } else if (nearestSubMi > TRANSMISSION_PROXIMITY_BANDS.moderate) {
    gaps.push({
      category: "power",
      severity: "likely_required",
      summary: `The closest substation is ${nearestSubMi} mi away.`,
      detail: "At this distance, a new substation or major power line work is likely needed — expect higher cost and a longer timeline than a closer site.",
    });
  } else if (nearestSubMi > TRANSMISSION_PROXIMITY_BANDS.close) {
    gaps.push({
      category: "power",
      severity: "watch",
      summary: `The closest substation (${substationLabel ?? "unnamed"}) is ${nearestSubMi} mi away.`,
      detail: "A new connector line to that substation would likely be needed, adding some cost and time.",
    });
  } else if (nearestSubMi <= TRANSMISSION_PROXIMITY_BANDS.veryClose) {
    gaps.push({
      category: "power",
      severity: "info",
      summary: `${substationLabel ?? "A substation"} is only ${nearestSubMi} mi away.`,
      detail: "Good sign — being this close to a substation usually makes connecting power faster and cheaper. The utility still needs to confirm there's enough capacity, though.",
    });
  }

  const demandPressure = power.gridDemandPressure.demandPressureLabel;
  const densityInfo = power.gridDemandPressure.value;
  if ((demandPressure === "High" || demandPressure === "Very High") && densityInfo) {
    const nearestKvValue = power.nearest230kv.voltageKv;
    gaps.push({
      category: "power",
      severity: demandPressure === "Very High" && (nearestKvValue == null || nearestKvValue < VOLTAGE_TIERS.high) ? "watch" : "info",
      summary: `${densityInfo.countyName ?? "This county"} is a ${demandPressure.toLowerCase()}-density area.`,
      detail: `About ${Math.round(densityInfo.densityPerSqMi ?? 0).toLocaleString()} people per square mile already live here, which usually means less spare power capacity for a new large facility. This should be weighed alongside the utility's own capacity check.`,
    });
  }

  if (fiber.nearestIxp.distanceMiles == null || fiber.nearestIxp.distanceMiles > 25) {
    gaps.push({
      category: "fiber",
      severity: "watch",
      summary: "No nearby internet hub found.",
      detail: "It's unclear whether high-speed fiber internet reaches this site — confirm directly with local internet providers.",
    });
  }

  if (water.waterStressLabel.value === "High") {
    gaps.push({
      category: "water",
      severity: "likely_required",
      summary: "This area experiences drought conditions.",
      detail: "Cooling systems that use a lot of water may run into supply or permitting problems here. Air-cooling or other water-saving designs would likely work better.",
    });
  } else if (water.waterStressLabel.value === "Medium") {
    gaps.push({
      category: "water",
      severity: "watch",
      summary: "Water is already in moderate demand nearby.",
      detail: "Other users nearby already hold water rights, so getting new water access here could take longer than usual.",
    });
  }

  if (water.nearestWaterBody.distanceMiles == null || water.nearestWaterBody.distanceMiles > 10) {
    gaps.push({
      category: "water",
      severity: "watch",
      summary: "No lake or river found nearby.",
      detail: "Cooling that relies on river or lake water isn't a good fit here — the site would likely need groundwater or a city water supply instead.",
    });
  }

  const floodValue = String(land.femaFloodZone.value ?? "");
  if (floodValue.includes("high-risk")) {
    gaps.push({
      category: "land",
      severity: "likely_required",
      summary: "This site is in a high-risk flood zone.",
      detail: "Flood insurance and flood-resistant construction would likely be required, and permitting will probably take longer.",
    });
  }

  if (land.nearestMajorRoadMiles.value != null && land.nearestMajorRoadMiles.value > 5) {
    gaps.push({
      category: "land",
      severity: "watch",
      summary: `The nearest major road is ${land.nearestMajorRoadMiles.value} mi away.`,
      detail: "That distance could make it more expensive to deliver construction equipment and materials.",
    });
  }

  // Noise alone never disqualifies a site — it's one input to the gaps list,
  // same as flood risk or water stress, not an automatic fail. Kept in plain
  // language for the general-audience gaps list, separate from the technical
  // methodology explanation shown elsewhere (noise.explanation).
  if (noise.classification === "high") {
    gaps.push({
      category: "community",
      severity: "likely_required",
      summary: "Noise could be a problem for nearby residents.",
      detail: "The combination of a loud cooling system and nearby homes means noise controls — like sound barriers or equipment enclosures — would likely be needed to satisfy neighbors and permitting.",
    });
  } else if (noise.classification === "significant") {
    gaps.push({
      category: "community",
      severity: "watch",
      summary: "Noise is worth keeping an eye on.",
      detail: "Nearby residents could notice some noise from this facility. Planning ahead — sound barriers, or talking with the community early — can help avoid issues later.",
    });
  }

  if (regulation.county.value == null) {
    gaps.push({
      category: "land",
      severity: "info",
      summary: "Couldn't automatically identify the local government.",
      detail: "Confirm the county or city directly to understand the permitting rules for this site.",
    });
  }

  return gaps;
}
