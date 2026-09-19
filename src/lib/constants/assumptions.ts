/**
 * Every numeric assumption used by the analysis engine lives here, named and
 * documented, rather than inline as a "magic number" in calculation code.
 * Values are widely-cited industry reference points, not measurements of any
 * specific facility — the UI always labels figures derived from these as
 * MODEL ESTIMATE, never FACT.
 */

/** Water Usage Effectiveness (WUE): liters of water per kWh of IT energy. */
export const WUE_L_PER_KWH = {
  us_average: {
    value: 1.8,
    label: "US data center average",
    description: "Commonly cited industry-average WUE for evaporative-cooled US data centers.",
  },
  best_in_class: {
    value: 0.19,
    label: "Best-in-class (closed-loop / free air)",
    description: "Reference figure for highly efficient closed-loop or free-cooling designs.",
  },
  air_cooled_dx: {
    value: 0.2,
    label: "Air-cooled (DX / no evaporative water use)",
    description: "Direct-expansion air cooling uses effectively no site water for heat rejection.",
  },
  chilled_water_air_cooled_chiller: {
    value: 0.5,
    label: "Chilled water, air-cooled chiller",
    description: "Closed chilled-water loop rejecting heat via dry air-cooled chillers.",
  },
  cooling_tower_evaporative: {
    value: 1.8,
    label: "Open cooling tower (evaporative)",
    description: "Conventional evaporative cooling tower — highest site water consumption.",
  },
  closed_loop_liquid: {
    value: 0.4,
    label: "Closed-loop liquid / direct-to-chip",
    description: "Closed liquid loop with dry heat rejection; minimal evaporative losses.",
  },
  immersion: {
    value: 0.15,
    label: "Immersion cooling",
    description: "Dielectric immersion cooling with dry heat rejection.",
  },
} satisfies Record<string, { value: number; label: string; description: string }>;

/** Maps the UI's cooling technology selector to a WUE coefficient key above. */
export const COOLING_TECH_TO_WUE_KEY: Record<string, keyof typeof WUE_L_PER_KWH> = {
  air_cooled_dx: "air_cooled_dx",
  chilled_water_air_cooled_chiller: "chilled_water_air_cooled_chiller",
  cooling_tower_evaporative: "cooling_tower_evaporative",
  closed_loop_liquid: "closed_loop_liquid",
  immersion: "immersion",
};

/** Fraction of IT load that becomes total facility (IT + mechanical/electrical) load, i.e. PUE. */
export const ASSUMED_PUE = 1.4;

export const GALLONS_PER_LITER = 0.264172;

/** Acreage per MW of IT load — wide industry range; used only as a rough footprint estimate. */
export const ACREAGE_PER_MW = {
  low: 0.4,
  typical: 0.6,
  high: 1.0,
};

/** Construction cost per MW of critical IT load, USD — broad hyperscale/colo range (2024-class pricing). */
export const CONSTRUCTION_COST_PER_MW_USD: [number, number] = [9_000_000, 14_000_000];

/** Typical permitting + construction timeline range, years, for a large greenfield facility. */
export const DEVELOPMENT_TIMELINE_YEARS: [number, number] = [2, 4];

/** Distance bands (miles) used to describe transmission proximity qualitatively. */
export const TRANSMISSION_PROXIMITY_BANDS = {
  veryClose: 2,
  close: 5,
  moderate: 15,
};

/** Radius (miles) used for "nearby generation" and "population within" queries. */
export const NEARBY_GENERATION_RADIUS_MI = 25;
export const POPULATION_RADIUS_MI = 5;
export const IXP_SEARCH_RADIUS_MI = 100;

/** Voltage thresholds (kV) used when classifying BPA transmission line tiers. */
export const VOLTAGE_TIERS = {
  min: 0,
  mid: 115,
  high: 230,
  extraHigh: 500,
};

/**
 * County population-density thresholds (people/sq mi, US Census Bureau PEP +
 * Gazetteer) used to bucket "existing grid demand pressure" near a site — a
 * rough proxy for how much residential/commercial load already competes for
 * headroom on the local transmission/distribution system, not a substitute
 * for a utility interconnection study.
 */
export const POPULATION_DENSITY_TIERS = {
  low: 25, // below this: rural, minimal competing local load
  moderate: 150, // suburban
  high: 1000, // urban
  // 1000+/sq mi: dense urban
};
