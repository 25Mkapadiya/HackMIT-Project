import type { CountyScore } from "../lib/types";

interface Props {
  score: CountyScore | null;
  stateHasCustomRules: boolean;
  isPlaced: boolean;
  onPlace: () => void;
}

const FACTOR_LABELS: Record<keyof CountyScore["breakdown"], string> = {
  grid: "Grid proximity",
  carbon: "Carbon intensity",
  land: "Land availability",
  demand: "Demand headroom",
};

export default function DetailPanel({ score, stateHasCustomRules, isPlaced, onPlace }: Props) {
  return (
    <div className="panel" id="tilePanel">
      <div className="panel-title">Selected county</div>
      {!score ? (
        <div className="tile-empty">Click a county on the map to evaluate it.</div>
      ) : (
        <div className="tile-detail">
          <div className="tile-name">{score.name}</div>
          <div className="tile-score-row">
            <span className="tile-score" style={{ color: `var(--${score.tier.cls})` }}>
              {score.blocked ? "—" : score.score}
            </span>
            <span className="tile-tier" style={{ color: `var(--${score.tier.cls})` }}>
              {score.tier.label}
            </span>
          </div>

          {!score.blocked && (
            <div className="factor-bars">
              {(Object.keys(FACTOR_LABELS) as (keyof CountyScore["breakdown"])[]).map(
                (k) => (
                  <div className="factor-row" key={k}>
                    <span className="factor-label">{FACTOR_LABELS[k]}</span>
                    <div className="factor-track">
                      <div
                        className="factor-fill"
                        style={{ width: `${score.breakdown[k]}%` }}
                      />
                    </div>
                    <span className="factor-val">{Math.round(score.breakdown[k])}</span>
                  </div>
                )
              )}
            </div>
          )}

          {score.nearestHub && (
            <div className="nearest-hub">
              Nearest grid hub: {score.nearestHub.name} (~{score.nearestHub.distanceKm} km)
            </div>
          )}

          {score.notes.length > 0 && (
            <ul className="tile-notes">
              {score.notes.map((n, i) => (
                <li key={i}>{n}</li>
              ))}
            </ul>
          )}

          {!stateHasCustomRules && (
            <p className="tile-generic-note">
              No state-specific regulatory dataset is modeled for this state yet —
              score reflects grid proximity, carbon intensity, land availability, and
              demand headroom only.
            </p>
          )}

          <button
            className="btn btn-primary"
            onClick={onPlace}
            disabled={score.blocked || isPlaced}
          >
            {score.blocked
              ? "Can't place — protected zone"
              : isPlaced
              ? "Placed"
              : "Place datacenter here"}
          </button>
        </div>
      )}
    </div>
  );
}
