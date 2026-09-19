import type { CountyScore } from "../lib/types";

interface Props {
  scores: CountyScore[];
  selectedFips: string | null;
  onSelect: (fips: string) => void;
}

export default function TopList({ scores, selectedFips, onSelect }: Props) {
  const ranked = [...scores]
    .filter((s) => !s.blocked)
    .sort((a, b) => b.score - a.score)
    .slice(0, 8);

  return (
    <div className="panel">
      <div className="panel-title">Top counties in this state</div>
      <ol className="top-list">
        {ranked.map((s) => (
          <li key={s.fips}>
            <button
              className={"top-list-item" + (selectedFips === s.fips ? " selected" : "")}
              onClick={() => onSelect(s.fips)}
            >
              <span className="top-list-name">{s.name}</span>
              <span className="top-list-score" style={{ color: `var(--${s.tier.cls})` }}>
                {s.score}
              </span>
            </button>
          </li>
        ))}
      </ol>
    </div>
  );
}
