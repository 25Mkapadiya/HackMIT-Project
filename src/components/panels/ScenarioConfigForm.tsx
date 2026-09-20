"use client";

import type { ScenarioConfig } from "@/lib/types";
import { SQ_FT_PER_ACRE } from "@/lib/constants/assumptions";
import { COOLING_TECH_OPTIONS, REDUNDANCY_OPTIONS } from "@/lib/constants/options";


const COOLING_CONFIGURATION: Record<
  ScenarioConfig["coolingTechnology"],
  Pick<ScenarioConfig, "loopType" | "coolingMedium">
> = {
  air_cooled_dx: { loopType: "closed_loop", coolingMedium: "air_cooled" },
  chilled_water_air_cooled_chiller: { loopType: "closed_loop", coolingMedium: "water_cooled" },
  cooling_tower_evaporative: { loopType: "open_loop", coolingMedium: "water_cooled" },
  closed_loop_liquid: { loopType: "closed_loop", coolingMedium: "water_cooled" },
  immersion: { loopType: "closed_loop", coolingMedium: "water_cooled" },
};

const inputCls =
  "w-full bg-base-900 border border-base-700 rounded-md px-2.5 py-1.5 text-[12.5px] text-ink-100 focus:outline-none focus:ring-1 focus:ring-accent-power/50 focus:border-accent-power/50";
const labelCls = "text-[10.5px] uppercase tracking-[0.06em] text-ink-500 mb-1 block";

const coolingSummary = (technology: ScenarioConfig["coolingTechnology"]) =>
  COOLING_TECH_OPTIONS.find((option) => option.value === technology)?.summary ?? "";

export default function ScenarioConfigForm({
  scenario,
  onChange,
}: {
  scenario: ScenarioConfig;
  onChange: (patch: Partial<ScenarioConfig>) => void;
}) {
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
          onChange={(e) => {
            const coolingTechnology = e.target.value as ScenarioConfig["coolingTechnology"];
            onChange({
              coolingTechnology,
              ...COOLING_CONFIGURATION[coolingTechnology],
            });
          }}
          className={inputCls}
        >
          {COOLING_TECH_OPTIONS.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </select>
        <div className="mt-2 rounded-md border border-base-800 bg-base-900/60 px-2.5 py-2 text-[11px] leading-relaxed text-ink-400">
          {coolingSummary(scenario.coolingTechnology)}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className={labelCls}>Loop Type</label>
          <div className={`${inputCls} opacity-80 cursor-default`}>
            {scenario.loopType === "closed_loop" ? "Closed" : "Open"}
          </div>
        </div>
        <div>
          <label className={labelCls}>Cooling Medium</label>
          <div className={`${inputCls} opacity-80 cursor-default`}>
            {scenario.coolingMedium === "air_cooled" ? "Air" : "Water"}
          </div>
        </div>
      </div>

      <div>
        <label className={labelCls}>Facility Area, sq ft (optional override)</label>
        <input
          type="number"
          min={0}
          step="any"
          placeholder="Auto-estimated"
          value={scenario.acreageOverride != null ? Math.round(scenario.acreageOverride * SQ_FT_PER_ACRE * 100) / 100 : ""}
          onKeyDown={(e) => {
            if (e.key === "-" || e.key === "e" || e.key === "E") e.preventDefault();
          }}
          onChange={(e) => {
            const sqFt = Number(e.target.value);
            // Blank or negative input clears the override; the area can never be below zero.
            onChange({ acreageOverride: e.target.value && sqFt >= 0 ? sqFt / SQ_FT_PER_ACRE : undefined });
          }}
          className={inputCls}
        />
      </div>
    </div>
  );
}
