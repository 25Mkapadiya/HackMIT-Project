import type { CoolingMedium, CoolingTechnology, LoopType } from "@/lib/types";

export interface CoolingTechOption {
  value: CoolingTechnology;
  label: string;
  /** Which medium actually rejects heat for this technology — implied by the tech, never a separate user choice. */
  medium: CoolingMedium;
  /**
   * The loop type this technology is physically stuck with (e.g. an
   * evaporative cooling tower is inherently open to atmosphere; a chiller
   * plant's refrigerant/chilled-water circuit is inherently closed), or null
   * when the technology genuinely supports either (direct-to-chip liquid
   * cooling can be paired with a closed dry cooler or an open tower/loop at
   * the facility level).
   */
  fixedLoopType: LoopType | null;
}

export const COOLING_TECH_OPTIONS: CoolingTechOption[] = [
  { value: "air_cooled_dx", label: "Air-cooled (DX)", medium: "air_cooled", fixedLoopType: "closed_loop" },
  {
    value: "chilled_water_air_cooled_chiller",
    label: "Chilled water — air-cooled chiller",
    medium: "water_cooled",
    fixedLoopType: "closed_loop",
  },
  {
    value: "cooling_tower_evaporative",
    label: "Cooling tower (evaporative)",
    medium: "water_cooled",
    fixedLoopType: "open_loop",
  },
  {
    value: "closed_loop_liquid",
    label: "Direct-to-chip liquid cooling",
    medium: "water_cooled",
    fixedLoopType: null,
  },
  { value: "immersion", label: "Immersion cooling", medium: "water_cooled", fixedLoopType: "closed_loop" },
];

export function getCoolingTechOption(tech: CoolingTechnology): CoolingTechOption {
  return COOLING_TECH_OPTIONS.find((o) => o.value === tech) ?? COOLING_TECH_OPTIONS[0]!;
}

export const REDUNDANCY_OPTIONS: { value: "N" | "N+1" | "2N"; label: string }[] = [
  { value: "N", label: "N (no redundancy)" },
  { value: "N+1", label: "N+1" },
  { value: "2N", label: "2N (full redundancy)" },
];
