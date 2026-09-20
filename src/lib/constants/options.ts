import type { CoolingTechnology } from "@/lib/types";

export const COOLING_TECH_OPTIONS: {
  value: CoolingTechnology;
  label: string;
  summary: string;
}[] = [
  {
    value: "air_cooled_dx",
    label: "Air Cooling",
    summary: "Uses air to remove heat directly from the data center. No cooling tower is used, so routine cooling-water use is essentially zero.",
  },
  {
    value: "chilled_water_air_cooled_chiller",
    label: "Chilled Water",
    summary: "Water circulates in a closed loop to carry heat away from the equipment, while outdoor chillers reject that heat to the air. The same water is reused, with only small makeup or maintenance refills.",
  },
  {
    value: "cooling_tower_evaporative",
    label: "Evaporative Cooling",
    summary: "Water carries heat to a cooling tower, where part of it evaporates to release heat outdoors. This is efficient but uses substantially more water than dry-cooling systems.",
  },
  {
    value: "closed_loop_liquid",
    label: "Direct-to-Chip",
    summary: "Liquid flows through cold plates attached directly to processors, then moves heat to a dry cooler outside. The liquid stays in a closed loop, so routine water consumption is near zero.",
  },
  {
    value: "immersion",
    label: "Immersion Cooling",
    summary: "Servers are submerged in a non-conductive cooling fluid that absorbs heat, which is then rejected to outdoor air through a dry cooler. The fluid is recirculated rather than consumed.",
  },
];

export const REDUNDANCY_OPTIONS: { value: "N" | "N+1" | "2N"; label: string }[] = [
  { value: "N", label: "N (no redundancy)" },
  { value: "N+1", label: "N+1" },
  { value: "2N", label: "2N (full redundancy)" },
];
