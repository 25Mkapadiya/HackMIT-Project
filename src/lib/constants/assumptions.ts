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
    label: "Evaporative-cooled reference",
    description:
      "Reference site WUE for an evaporative-cooled data center. WUE is site water use divided by IT-equipment energy, so it must be applied to IT kWh rather than PUE-adjusted facility kWh.",
  },
  best_in_class: {
    value: 0.19,
    label: "Low-water reference",
    description:
      "Low-water industry reference retained for comparison; not used as the default for dry heat-rejection technologies.",
  },
  air_cooled_dx: {
    value: 0,
    label: "Air-cooled DX / dry heat rejection",
    description:
      "Routine cooling-process site water use is modeled as effectively zero because heat is rejected directly to air without an evaporative cooling tower. Domestic, humidification, fire-system, and one-time fill water are outside this cooling model.",
  },
  chilled_water_air_cooled_chiller: {
    value: 0,
    label: "Chilled water + air-cooled chiller",
    description:
      "The chilled-water loop is closed and heat is rejected by dry air-cooled chillers, so routine cooling-process make-up water is modeled as effectively zero. One-time loop fill and non-cooling facility water are excluded.",
  },
  cooling_tower_evaporative: {
    value: 1.8,
    label: "Evaporative cooling tower",
    description:
      "Site-WUE reference for conventional evaporative cooling. Applied to IT-equipment energy, consistent with the WUE definition.",
  },
  closed_loop_liquid: {
    value: 0,
    label: "Closed-loop liquid / direct-to-chip with dry rejection",
    description:
      "A sealed liquid loop with dry heat rejection is modeled as having effectively zero routine cooling-process make-up water. Initial fill, maintenance losses, and non-cooling facility water are excluded.",
  },
  immersion: {
    value: 0,
    label: "Immersion cooling with dry rejection",
    description:
      "Immersion cooling paired with dry heat rejection is modeled as having effectively zero routine cooling-process site water use. Non-cooling facility water is excluded.",
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

export const GALLONS_PER_LITER = 0.264172;

/**
 * Default cooling-tower cycles of concentration used to split site water use
 * (make-up / withdrawal) into consumptive losses versus blowdown discharge.
 * DOE notes many systems operate around 2–4 cycles, while 6+ may be achievable.
 * Four cycles is a transparent, middle-of-typical-range planning assumption.
 */
export const COOLING_TOWER_CYCLES_OF_CONCENTRATION = 4;;

/**
 * DOE FEMP full-load cooling-tower table: at 4 cycles of concentration,
 * a 100-ton chiller uses 4,930 gal/day of cooling-tower make-up water.
 * The table scales linearly with chiller tonnage, so 49.3 gal/ton-day is
 * the appropriate planning factor at 4 cycles for 24/7 full-load operation.
 */
export const COOLING_TOWER_MAKEUP_GAL_PER_TON_DAY_AT_4_COC = 49.3;

/**
 * Closed chilled-water loop planning assumptions.
 * Johnson Controls recommends 8-10 gal/ton system water volume for variable
 * primary flow on its YVAM air-cooled chillers, and 5-8 gal/ton is preferred
 * for constant-flow YVFA applications. We use 8 gal/ton as a conservative
 * planning value within those published ranges, not a universal requirement.
 */
export const CLOSED_LOOP_GALLONS_PER_TON = 8;

/**
 * ASHRAE describes closed hydronic loops as systems typically requiring
 * less than 5% makeup per year. Using 5% is therefore a conservative
 * upper-bound planning assumption for leakage / routine makeup.
 */
export const CLOSED_LOOP_ANNUAL_MAKEUP_FRACTION = 0.05;

/**
 * Maintenance refresh interval used to annualize periodic loop refill.
 * Three years is a planning assumption, not a universal ASHRAE requirement;
 * manufacturer service intervals vary by fluid chemistry and equipment.
 */
export const CLOSED_LOOP_REFRESH_INTERVAL_YEARS = 3;

/** One refrigeration ton equals approximately 3.517 kW of heat removal. */
export const KW_PER_REFRIGERATION_TON = 3.517;

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

/**
 * Search radius (miles) for the nearest Interstate highway or active rail
 * line, used as a geographic PROXY for likely long-haul fiber routes (see
 * FiberAnalysis.longHaulFiberAvailability) — carriers commonly, not
 * universally, bury long-haul conduit within these rights-of-way. No public
 * nationwide dataset of actual carrier fiber routes exists, so this is a
 * corridor-proximity signal, not a fiber survey.
 */
export const LONG_HAUL_CORRIDOR_SEARCH_RADIUS_MI = 25;

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

/**
 * Base PUE (Power Usage Effectiveness) by cooling technology — the site's
 * "if built well" baseline before any local siting adjustment. Sourced from
 * published 2025-era industry figures, not measured from this app's own data:
 *   - Uptime Institute 2025 Global Data Center Survey: industry-wide average
 *     PUE ~1.54 (flat for the 6th straight year).
 *   - DX (no economizer): ~1.5-1.7 (compressor cooling runs continuously,
 *     no free-cooling path).
 *   - Air-cooled chiller with economizer hours: ~1.38 industry-cited figure.
 *   - Water-cooled chiller + evaporative cooling tower: ~1.29 industry-cited
 *     figure — more efficient than air-cooled, at the cost of water use.
 *   - Direct-to-chip liquid cooling: commonly cited as "a path to 1.1 PUE";
 *     ~70-75% of rack heat is removed directly, the rest still needs air
 *     handling, so a mid-1.1x figure is used rather than the 1.1 ceiling.
 *   - Immersion cooling: ~1.05-1.10 (single-phase) to ~1.05-1.07 (two-phase).
 * See src/lib/analysis/efficiency.ts for how this combines with the
 * density/water-stress adjustments below into an estimated PUE.
 */
export const BASE_PUE_BY_COOLING_TECH: Record<string, { value: number; label: string; description: string }> = {
  air_cooled_dx: {
    value: 1.6,
    label: "Air-cooled (DX, no economizer)",
    description:
      "Direct-expansion compressor cooling runs continuously with no free-cooling path — commonly cited near 1.5-1.7 PUE.",
  },
  chilled_water_air_cooled_chiller: {
    value: 1.38,
    label: "Chilled water, air-cooled chiller",
    description:
      "Air-cooled chiller plant with some economizer hours — commonly cited near 1.38 PUE, vs. ~1.29 for a water-cooled tower equivalent.",
  },
  cooling_tower_evaporative: {
    value: 1.29,
    label: "Open cooling tower (evaporative)",
    description:
      "Water-cooled chiller plus cooling tower — commonly cited near 1.29 PUE, more efficient than air-cooled equivalents at the cost of water use.",
  },
  closed_loop_liquid: {
    value: 1.15,
    label: "Closed-loop liquid / direct-to-chip",
    description:
      "Direct-to-chip cold plates remove roughly 70-75% of rack heat directly; the remainder still needs air handling. Industry sources describe this as a path toward 1.1 PUE.",
  },
  immersion: {
    value: 1.08,
    label: "Immersion cooling",
    description:
      "Single- and two-phase immersion cooling is commonly cited in the 1.05-1.10 PUE range, eliminating most air-handling overhead.",
  },
};

/**
 * Modeled PUE adjustment from local "grid demand pressure" (county population
 * density — see PowerAnalysis.gridDemandPressure). This is NOT a measured
 * statistical correlation: no public dataset joins per-facility PUE to county
 * population data. It's a directional nudge reflecting a documented industry
 * pattern instead — Uptime Institute reporting puts hyperscale, single-tenant
 * facilities (easier to site on cheap contiguous rural/exurban land) at
 * ~1.1-1.2 PUE, against ~1.5-1.8 for smaller/multi-tenant facilities more
 * common where land and power headroom are scarce (i.e. dense counties).
 */
export const PUE_DENSITY_ADJUSTMENT: Record<"Low" | "Moderate" | "High" | "Very High" | "Unknown", number> = {
  Low: 0,
  Moderate: 0.03,
  High: 0.08,
  "Very High": 0.15,
  Unknown: 0,
};

/**
 * Modeled PUE penalty applied only when evaporative cooling is selected at a
 * site that is BOTH in a high-demand-pressure county AND water-stressed —
 * the scenario where evaporative cooling's water draw is most likely to run
 * into permitting or supply friction and get value-engineered into an
 * air-cooled fallback. Sized as the gap between the evaporative baseline
 * (~1.29) and the air-cooled-chiller baseline (~1.38) above, rounded up
 * slightly for the added friction of a forced late redesign.
 */
export const PUE_WATER_STRESS_CONSTRAINT_DELTA = 0.1;

/** Square feet in one acre. */
export const SQ_FT_PER_ACRE = 43560;
