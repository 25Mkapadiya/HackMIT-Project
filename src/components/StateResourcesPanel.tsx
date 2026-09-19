import type { StateMeters } from "../lib/types";

interface Props {
  stateName: string;
  meters: StateMeters;
  placedCount: number;
  onReset: () => void;
  onDemoGood: () => void;
  onDemoBad: () => void;
}

export default function StateResourcesPanel({
  stateName,
  meters,
  placedCount,
  onReset,
  onDemoGood,
  onDemoBad,
}: Props) {
  return (
    <div className="panel">
      <div className="panel-title">{stateName} resources</div>
      <div className="meter-row">
        <div className="meter-head"><span>Grid headroom</span><span>{meters.headroom}</span></div>
        <div className="meter-track"><div className="meter-fill fill-headroom" style={{ width: `${meters.headroom}%` }} /></div>
      </div>
      <div className="meter-row">
        <div className="meter-head"><span>Water reserve</span><span>{meters.water}</span></div>
        <div className="meter-track"><div className="meter-fill fill-water" style={{ width: `${meters.water}%` }} /></div>
      </div>
      <div className="meter-row">
        <div className="meter-head"><span>Community approval</span><span>{meters.approval}</span></div>
        <div className="meter-track"><div className="meter-fill fill-approval" style={{ width: `${meters.approval}%` }} /></div>
      </div>

      <p className="sim-note">
        {placedCount === 0
          ? "Illustrative starting point — place a facility to see the draw."
          : `${placedCount} facilit${placedCount === 1 ? "y" : "ies"} placed in this state.`}
      </p>

      <div className="demo-row">
        <button className="btn btn-ghost btn-small" onClick={onDemoBad}>
          Demo: bad placement
        </button>
        <button className="btn btn-ghost btn-small" onClick={onDemoGood}>
          Demo: good placement
        </button>
        <button className="btn btn-ghost btn-small" onClick={onReset} disabled={placedCount === 0}>
          Reset
        </button>
      </div>
    </div>
  );
}
