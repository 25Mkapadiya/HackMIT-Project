import { useMemo } from "react";
import { geoAlbersUsa, geoPath } from "d3-geo";
import type { StateCollection } from "../lib/types";
import { scoreColor } from "../lib/color";

const WIDTH = 960;
const HEIGHT = 600;

interface Props {
  states: StateCollection;
  stateAvgScore: Map<string, number>;
  selectedFips: string | null;
  hoveredFips: string | null;
  onHover: (fips: string | null) => void;
  onSelect: (fips: string, postal: string | null) => void;
}

export default function USMap({
  states,
  stateAvgScore,
  selectedFips,
  hoveredFips,
  onHover,
  onSelect,
}: Props) {
  const path = useMemo(() => {
    const projection = geoAlbersUsa().fitSize([WIDTH, HEIGHT], states);
    return geoPath(projection);
  }, [states]);

  return (
    <svg
      viewBox={`0 0 ${WIDTH} ${HEIGHT}`}
      className="us-map"
      role="img"
      aria-label="United States, colored by average county siting score"
    >
      {states.features.map((f) => {
        const fips = f.properties.fips;
        const avg = stateAvgScore.get(fips);
        const d = path(f) ?? undefined;
        const isSelected = selectedFips === fips;
        const isHovered = hoveredFips === fips;
        return (
          <path
            key={fips}
            d={d}
            fill={avg !== undefined ? scoreColor(avg) : "#26323d"}
            className={
              "state-path" +
              (isSelected ? " selected" : "") +
              (isHovered ? " hovered" : "")
            }
            onMouseEnter={() => onHover(fips)}
            onMouseLeave={() => onHover(null)}
            onClick={() => onSelect(fips, f.properties.postal)}
          >
            <title>
              {f.properties.name}
              {avg !== undefined ? ` — avg score ${Math.round(avg)}` : ""}
            </title>
          </path>
        );
      })}
    </svg>
  );
}
