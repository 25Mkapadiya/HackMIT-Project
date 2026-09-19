import { useMemo } from "react";
import { geoMercator, geoPath } from "d3-geo";
import type { CountyCollection, CountyScore } from "../lib/types";
import { scoreColor } from "../lib/color";

const WIDTH = 720;
const HEIGHT = 560;

interface Props {
  counties: CountyCollection;
  scores: Map<string, CountyScore>;
  selectedFips: string | null;
  hoveredFips: string | null;
  onHover: (fips: string | null) => void;
  onSelect: (fips: string) => void;
}

export default function StateMap({
  counties,
  scores,
  selectedFips,
  hoveredFips,
  onHover,
  onSelect,
}: Props) {
  const path = useMemo(() => {
    const projection = geoMercator().fitSize([WIDTH, HEIGHT], counties);
    return geoPath(projection);
  }, [counties]);

  return (
    <svg
      viewBox={`0 0 ${WIDTH} ${HEIGHT}`}
      className="state-map"
      role="img"
      aria-label="Counties in the selected state, colored by siting score"
    >
      <defs>
        <pattern
          id="blockedHatch"
          patternUnits="userSpaceOnUse"
          width="6"
          height="6"
          patternTransform="rotate(45)"
        >
          <rect width="6" height="6" fill="#3a2430" />
          <line x1="0" y1="0" x2="0" y2="6" stroke="#e0614a" strokeWidth="2" />
        </pattern>
      </defs>
      {counties.features.map((f) => {
        const fips = f.properties.fips;
        const s = scores.get(fips);
        const d = path(f) ?? undefined;
        const isSelected = selectedFips === fips;
        const isHovered = hoveredFips === fips;
        const fill = s ? (s.blocked ? "url(#blockedHatch)" : scoreColor(s.score)) : "#26323d";
        return (
          <path
            key={fips}
            d={d}
            fill={fill}
            className={
              "county-path" +
              (isSelected ? " selected" : "") +
              (isHovered ? " hovered" : "") +
              (s?.blocked ? " blocked" : "")
            }
            onMouseEnter={() => onHover(fips)}
            onMouseLeave={() => onHover(null)}
            onClick={() => onSelect(fips)}
          >
            <title>
              {f.properties.name}
              {s ? (s.blocked ? " — blocked" : ` — score ${s.score} (${s.tier.label})`) : ""}
            </title>
          </path>
        );
      })}
    </svg>
  );
}
