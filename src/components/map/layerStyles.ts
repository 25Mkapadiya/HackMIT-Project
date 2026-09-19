import type { DataDrivenPropertyValueSpecification, LayerSpecification } from "maplibre-gl";
import type { LayerDefinition } from "@/lib/types";

/** Builds the MapLibre layer spec(s) for a given layer definition + its GeoJSON source id. */
export function buildLayerSpecs(layer: LayerDefinition, sourceId: string): LayerSpecification[] {
  const baseColor = layer.color ?? "#8fa3bf";

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
        id: `${layer.id}-line`,
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

  if (layer.id === "flood-zones") {
    return [
      {
        id: `${layer.id}-fill`,
        type: "fill",
        source: sourceId,
        paint: {
          "fill-color": ["match", ["get", "SFHA_TF"], "T", "#e0524a", "#e0a84a"],
          "fill-opacity": 0.28,
        },
      },
      {
        id: `${layer.id}-outline`,
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
          id: `${layer.id}-line`,
          type: "line",
          source: sourceId,
          paint: { "line-color": baseColor, "line-width": 1.4, "line-opacity": 0.85 },
        },
      ];
    case "polygon":
      return [
        {
          id: `${layer.id}-fill`,
          type: "fill",
          source: sourceId,
          paint: { "fill-color": baseColor, "fill-opacity": 0.16 },
        },
        {
          id: `${layer.id}-outline`,
          type: "line",
          source: sourceId,
          paint: { "line-color": baseColor, "line-width": 1.1, "line-opacity": 0.8 },
        },
      ];
    case "point":
    default:
      return [
        {
          id: `${layer.id}-point`,
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

export function interactiveLayerIds(layer: LayerDefinition): string[] {
  if (layer.id === "transmission-lines") return [`${layer.id}-line`];
  if (layer.id === "flood-zones") return [`${layer.id}-fill`];
  switch (layer.geometryType) {
    case "line":
      return [`${layer.id}-line`];
    case "polygon":
      return [`${layer.id}-fill`];
    default:
      return [`${layer.id}-point`];
  }
}
