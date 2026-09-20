import type { DataDrivenPropertyValueSpecification, LayerSpecification } from "maplibre-gl";
import type { LayerDefinition } from "@/lib/types";
import { POPULATION_DENSITY_TIERS } from "@/lib/constants/assumptions";

/**
 * One shared "grid demand pressure" color ramp, keyed to POPULATION_DENSITY_TIERS,
 * used by BOTH the population-density choropleth and the transmission-line halo
 * below. Same color at the same density everywhere on the map is what makes the
 * connection between the two datasets legible: a reddish county and a reddish
 * line running through it are visually the same claim.
 */
const DEMAND_PRESSURE_LOW_COLOR = "#f2b93b";
const DEMAND_PRESSURE_MODERATE_COLOR = "#f2703b";
const DEMAND_PRESSURE_HIGH_COLOR = "#ff5470";

/** Builds the MapLibre layer spec(s) for a given layer definition + its GeoJSON source id. */
export function buildLayerSpecs(
  layer: LayerDefinition,
  sourceId: string,
  idPrefix = ""
): LayerSpecification[] {
  const baseColor = layer.color ?? "#8fa3bf";
  const mapLayerId = idPrefix ? `${idPrefix}-${layer.id}` : layer.id;

  if (layer.id === "transmission-lines") {
    const voltageColor: DataDrivenPropertyValueSpecification<string> = [
      "step",
      ["coalesce", ["get", "VoltageMeas"], 0],
      "#8fa3bf",
      115,
      "#f2d98b",
      230,
      "#f2b93b",
      500,
      "#ff5470",
    ];
    const voltageWidth: DataDrivenPropertyValueSpecification<number> = [
      "step",
      ["coalesce", ["get", "VoltageMeas"], 0],
      1.3,
      115,
      1.8,
      230,
      2.4,
      500,
      3.2,
    ];
    // Soft blurred glow behind the voltage-colored line, present only where the
    // line runs through a county with meaningful population density (below the
    // "low" tier it's fully transparent, so most rural transmission draws with
    // no glow at all — this is additive context on the existing line, not a
    // second competing layer, which is what keeps it from being distracting.
    const pressureHaloColor: DataDrivenPropertyValueSpecification<string> = [
      "step",
      ["coalesce", ["get", "PopulationDensityPerSqMi"], -1],
      "transparent",
      POPULATION_DENSITY_TIERS.low, DEMAND_PRESSURE_LOW_COLOR,
      POPULATION_DENSITY_TIERS.moderate, DEMAND_PRESSURE_MODERATE_COLOR,
      POPULATION_DENSITY_TIERS.high, DEMAND_PRESSURE_HIGH_COLOR,
    ];
    const pressureHaloOpacity: DataDrivenPropertyValueSpecification<number> = [
      "step",
      ["coalesce", ["get", "PopulationDensityPerSqMi"], -1],
      0,
      POPULATION_DENSITY_TIERS.low, 0.22,
      POPULATION_DENSITY_TIERS.moderate, 0.32,
      POPULATION_DENSITY_TIERS.high, 0.45,
    ];
    return [
      {
        id: `${mapLayerId}-pressure-halo`,
        type: "line",
        source: sourceId,
        layout: { "line-cap": "round", "line-join": "round" },
        paint: {
          "line-color": pressureHaloColor,
          "line-opacity": pressureHaloOpacity,
          "line-width": ["+", voltageWidth, 5],
          "line-blur": 3,
        },
      },
      {
        id: `${mapLayerId}-line`,
        type: "line",
        source: sourceId,
        paint: {
          "line-color": voltageColor,
          "line-width": voltageWidth,
          "line-opacity": 0.9,
        },
      },
    ];
  }

  if (layer.id === "electric-substations") {
    const voltageColor: DataDrivenPropertyValueSpecification<string> = [
      "step",
      ["coalesce", ["get", "MaxVoltKv"], 0],
      "#8fa3bf",
      115,
      "#f2b93b",
      345,
      "#ff5470",
    ];
    return [
      {
        id: `${mapLayerId}-point`,
        type: "circle",
        source: sourceId,
        paint: {
          "circle-radius": 4.5,
          "circle-color": voltageColor,
          "circle-stroke-width": 1.2,
          "circle-stroke-color": "#0a0d12",
          "circle-opacity": 0.9,
        },
      },
    ];
  }

  if (layer.id === "population-density") {
    // Same demand-pressure ramp as the transmission-line halo above, but kept
    // deliberately quiet: no fill at all below the "low" tier (most of a state's
    // land area), and even at the highest tier this tops out well under the
    // opacity of a normal layer fill — a wash of context to read alongside the
    // transmission lines, not a bold layer competing with them.
    const densityColor: DataDrivenPropertyValueSpecification<string> = [
      "step",
      ["coalesce", ["get", "PopulationDensityPerSqMi"], -1],
      "transparent",
      POPULATION_DENSITY_TIERS.low, DEMAND_PRESSURE_LOW_COLOR,
      POPULATION_DENSITY_TIERS.moderate, DEMAND_PRESSURE_MODERATE_COLOR,
      POPULATION_DENSITY_TIERS.high, DEMAND_PRESSURE_HIGH_COLOR,
    ];
    const densityOpacity: DataDrivenPropertyValueSpecification<number> = [
      "step",
      ["coalesce", ["get", "PopulationDensityPerSqMi"], -1],
      0,
      POPULATION_DENSITY_TIERS.low, 0.08,
      POPULATION_DENSITY_TIERS.moderate, 0.14,
      POPULATION_DENSITY_TIERS.high, 0.2,
    ];
    return [
      {
        id: `${mapLayerId}-fill`,
        type: "fill",
        source: sourceId,
        paint: { "fill-color": densityColor, "fill-opacity": densityOpacity },
      },
      {
        id: `${mapLayerId}-outline`,
        type: "line",
        source: sourceId,
        paint: { "line-color": densityColor, "line-width": 0.5, "line-opacity": 0.25 },
      },
    ];
  }

  if (layer.id === "flood-zones") {
    return [
      {
        id: `${mapLayerId}-fill`,
        type: "fill",
        source: sourceId,
        paint: {
          "fill-color": ["match", ["get", "SFHA_TF"], "T", "#e0524a", "#e0a84a"],
          "fill-opacity": 0.28,
        },
      },
      {
        id: `${mapLayerId}-outline`,
        type: "line",
        source: sourceId,
        paint: { "line-color": ["match", ["get", "SFHA_TF"], "T", "#e0524a", "#e0a84a"], "line-width": 1 },
      },
    ];
  }

  switch (layer.geometryType) {
    case "line":
      return [
        {
          id: `${mapLayerId}-line`,
          type: "line",
          source: sourceId,
          paint: { "line-color": baseColor, "line-width": 1.4, "line-opacity": 0.85 },
        },
      ];
    case "polygon":
      return [
        {
          id: `${mapLayerId}-fill`,
          type: "fill",
          source: sourceId,
          paint: { "fill-color": baseColor, "fill-opacity": 0.16 },
        },
        {
          id: `${mapLayerId}-outline`,
          type: "line",
          source: sourceId,
          paint: { "line-color": baseColor, "line-width": 1.1, "line-opacity": 0.8 },
        },
      ];
    case "point":
    default:
      return [
        {
          id: `${mapLayerId}-point`,
          type: "circle",
          source: sourceId,
          paint: {
            "circle-radius": 5,
            "circle-color": baseColor,
            "circle-stroke-width": 1.4,
            "circle-stroke-color": "#0a0d12",
            "circle-opacity": 0.9,
          },
        },
      ];
  }
}

export function interactiveLayerIds(layer: LayerDefinition, idPrefix = ""): string[] {
  const mapLayerId = idPrefix ? `${idPrefix}-${layer.id}` : layer.id;
  if (layer.id === "transmission-lines") return [`${mapLayerId}-line`];
  if (layer.id === "flood-zones") return [`${mapLayerId}-fill`];
  switch (layer.geometryType) {
    case "line":
      return [`${mapLayerId}-line`];
    case "polygon":
      return [`${mapLayerId}-fill`];
    default:
      return [`${mapLayerId}-point`];
  }
}
