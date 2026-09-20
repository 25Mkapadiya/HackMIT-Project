import type { DataDrivenPropertyValueSpecification, LayerSpecification } from "maplibre-gl";
import type { LayerDefinition } from "@/lib/types";

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
    return [
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

  if (layer.id === "population-density") {
    // Sequential choropleth by county population density (people/sq mi). Bucketed
    // to match POPULATION_DENSITY_TIERS in src/lib/constants/assumptions.ts, so
    // the map legend and the analysis engine's "grid demand pressure" tiers agree.
    const densityColor: DataDrivenPropertyValueSpecification<string> = [
      "step",
      ["coalesce", ["get", "PopulationDensityPerSqMi"], -1],
      "#3a4658", // no data
      0, "#d8e6f2",
      25, "#9dc3e6",
      150, "#4f81bd",
      1000, "#1f3864",
    ];
    return [
      {
        id: `${mapLayerId}-fill`,
        type: "fill",
        source: sourceId,
        paint: { "fill-color": densityColor, "fill-opacity": 0.55 },
      },
      {
        id: `${mapLayerId}-outline`,
        type: "line",
        source: sourceId,
        paint: { "line-color": "#0a0d12", "line-width": 0.4, "line-opacity": 0.4 },
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
