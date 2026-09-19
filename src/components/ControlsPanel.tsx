import type { Interconnect, ScenarioInputs, Weights } from "../lib/types";

interface Props {
  inputs: ScenarioInputs;
  onChange: (next: ScenarioInputs) => void;
}

const WEIGHT_FIELDS: { key: keyof Weights; label: string }[] = [
  { key: "grid", label: "Grid proximity" },
  { key: "carbon", label: "Carbon intensity" },
  { key: "land", label: "Land availability" },
  { key: "demand", label: "Demand headroom" },
];

export default function ControlsPanel({ inputs, onChange }: Props) {
  const setWeight = (key: keyof Weights, value: number) => {
    onChange({ ...inputs, weights: { ...inputs.weights, [key]: value } });
  };
  const setLoad = (value: number) => onChange({ ...inputs, loadMW: value });
  const setInterconnect = (value: Interconnect) =>
    onChange({ ...inputs, interconnect: value });

  return (
    <div className="panel">
      <div className="panel-title">Scoring weights</div>
      {WEIGHT_FIELDS.map(({ key, label }) => (
        <div className="field" key={key}>
          <label htmlFor={`w-${key}`}>{label}</label>
          <input
            id={`w-${key}`}
            type="range"
            min={0}
            max={100}
            value={inputs.weights[key]}
            onChange={(e) => setWeight(key, +e.target.value)}
          />
          <div className="field-readout">{inputs.weights[key]}</div>
        </div>
      ))}

      <div className="panel-title panel-title-spaced">Proposed facility</div>
      <div className="field">
        <label htmlFor="loadMW">Load size (MW)</label>
        <input
          id="loadMW"
          type="range"
          min={10}
          max={300}
          value={inputs.loadMW}
          onChange={(e) => setLoad(+e.target.value)}
        />
        <div className="field-readout">{inputs.loadMW} MW</div>
      </div>
      <div className="field">
        <label>Interconnection</label>
        <div className="toggle-row">
          {(["grid-tied", "self-generated"] as Interconnect[]).map((opt) => (
            <button
              key={opt}
              className={"toggle-opt" + (inputs.interconnect === opt ? " selected" : "")}
              onClick={() => setInterconnect(opt)}
            >
              {opt === "grid-tied" ? "Grid-tied" : "Self-generated"}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
