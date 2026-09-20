import type { CoolingTechnology } from "@/lib/types";

export const COOLING_TECH_OPTIONS: { value: CoolingTechnology; label: string }[] = [
  { value: "air_cooled_dx", label: "Air-cooled DX — dry / no tower" },
  { value: "chilled_water_air_cooled_chiller", label: "Chilled water — closed loop + air-cooled chiller" },
  { value: "cooling_tower_evaporative", label: "Cooling tower — evaporative" },
  { value: "closed_loop_liquid", label: "Direct-to-chip — closed loop + dry cooler" },
  { value: "immersion", label: "Immersion — dry heat rejection" },
];

export const REDUNDANCY_OPTIONS: { value: "N" | "N+1" | "2N"; label: string }[] = [
  { value: "N", label: "N (no redundancy)" },
  { value: "N+1", label: "N+1" },
  { value: "2N", label: "2N (full redundancy)" },
];
