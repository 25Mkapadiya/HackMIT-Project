"use client";

import type { ScenarioConfig } from "@/lib/types";
import { COOLING_TECH_OPTIONS, REDUNDANCY_OPTIONS, getCoolingTechOption } from "@/lib/constants/options";

const inputCls =
  "w-full bg-base-900 border border-base-700 rounded-md px-2.5 py-1.5 text-[12.5px] text-ink-100 focus:outline-none focus:ring-1 focus:ring-accent-power/50 focus:border-accent-power/50";
const labelCls = "text-[10.5px] uppercase tracking-[0.06em] text-ink-500 mb-1 block";

export default function ScenarioConfigForm({
  scenario,
  onChange,
}: {
  scenario: ScenarioConfig;
  onChange: (patch: Partial<ScenarioConfig>) => void;
}) {
  const coolingTechOption = getCoolingTechOption(scenario.coolingTechnology);
  return (
    <div className="space-y-3.5">
      <div>
        <label className={labelCls}>IT Load / Power Demand — {scenario.mwLoad} MW</label>
        <input
          type="range"
          min={5}
          max={500}
          step={5}
          value={scenario.mwLoad}
          onChange={(e) => onChange({ mwLoad: Number(e.target.value) })}
          className="w-full accent-[#f2b93b]"
        />
        <div className="flex justify-between text-[9.5px] text-ink-500 mt-0.5">
          <span>5 MW</span>
          <span>500 MW</span>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className={labelCls}>Buildings / Stacks</label>
          <input
            type="number"
            min={1}
            max={12}
            value={scenario.buildings}
            onChange={(e) => onChange({ buildings: Math.max(1, Math.min(12, Number(e.target.value))) })}
            className={inputCls}
          />
        </div>
        <div>
          <label className={labelCls}>Redundancy</label>
          <select
            value={scenario.redundancy}
            onChange={(e) => onChange({ redundancy: e.target.value as ScenarioConfig["redundancy"] })}
            className={inputCls}
          >
            {REDUNDANCY_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div>
        <label className={labelCls}>Cooling Technology</label>
        <select
          value={scenario.coolingTechnology}
          onChange={(e) => onChange({ coolingTechnology: e.target.value as ScenarioConfig["coolingTechnology"] })}
          className={inputCls}
        >
          {COOLING_TECH_OPTIONS.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </select>
        <div className="mt-1 text-[10px] text-ink-500">
          Heat rejection medium: <span className="text-ink-300">{coolingTechOption.medium === "water_cooled" ? "Water" : "Air"}</span> (implied by the selected technology)
        </div>
      </div>

      <div>
        <label className={labelCls}>Loop Type</label>
        {coolingTechOption.fixedLoopType ? (
          <div
            className="flex items-center justify-between rounded-md border border-base-800 bg-base-900/50 px-2.5 py-1.5 text-[11px] text-ink-500"
            title={`Fixed by ${coolingTechOption.label} — this cooling technology only operates as ${coolingTechOption.fixedLoopType === "closed_loop" ? "a closed loop" : "an open loop"}.`}
          >
            <span className="text-ink-100">{coolingTechOption.fixedLoopType === "closed_loop" ? "Closed" : "Open"}</span>
            <span className="text-[9.5px] uppercase tracking-[0.06em]">Fixed by technology</span>
          </div>
        ) : (
          <div className="flex rounded-md border border-base-700 overflow-hidden">
            {(["closed_loop", "open_loop"] as const).map((v) => (
              <button
                key={v}
                onClick={() => onChange({ loopType: v })}
                className={`flex-1 py-1.5 text-[11px] transition-colors ${
                  scenario.loopType === v ? "bg-accent-power/20 text-accent-power" : "text-ink-500 hover:text-ink-100"
                }`}
              >
                {v === "closed_loop" ? "Closed" : "Open"}
              </button>
            ))}
          </div>
        )}
      </div>

      <div>
        <label className={labelCls}>Facility Acreage (optional override)</label>
        <input
          type="number"
          placeholder="Auto-estimated"
          value={scenario.acreageOverride ?? ""}
          onChange={(e) => onChange({ acreageOverride: e.target.value ? Number(e.target.value) : undefined })}
          className={inputCls}
        />
      </div>
    </div>
  );
}
