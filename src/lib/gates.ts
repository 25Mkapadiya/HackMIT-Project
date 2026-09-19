/*
 * Sequential gate pipeline — ported from the reference project's real-data
 * build. Siting constraints are SEQUENTIAL, not a weighted composite: a site
 * that fails an earlier gate can't be rescued by scoring well on a later
 * one. Gates run in this order:
 *
 *     Power -> Fiber -> Regulation -> Water -> Land
 *
 * "Power" is the only gate backed by a real, siting-relevant proxy dataset
 * (nearby EIA-860 generation + interconnected grid voltage, standing in for
 * substation headroom, which is CEII-restricted under 18 CFR 388.113 and
 * not public). "Fiber", "Water", and "Land" are wired as real gates in the
 * pipeline but currently always pass with an informational note, because
 * the underlying datasets (FCC BDC / PeeringDB, EPA CWS service
 * boundaries, parcel/zoning) aren't fetched yet — see README.
 */
import stateNotesRaw from "../data/state-notes.json";
import type {
  CountyFeature,
  GateResult,
  Note,
  PowerPlantFeature,
  ScenarioInputs,
  SiteEvaluation,
  Tier,
  TierInfo,
} from "./types";
import { findCounty, milesBetween } from "./geo";

type RegStatus = "blocked" | "paused" | "notable";
interface StateRule {
  gridTiedPauseNote?: string;
  counties?: Record<string, { status: RegStatus; reason: string }>;
}
const STATE_NOTES = stateNotesRaw as unknown as Record<string, StateRule>;

export function note(text: string, terms: string[] = []): Note {
  return { text, terms };
}

// ---- cooling trade-offs (relative units; see gateWater for the real WUE math) ----
export const COOLING: Record<
  ScenarioInputs["cooling"],
  { headroom: number; waterMultiplier: number; approval: number }
> = {
  air: { headroom: 16, waterMultiplier: 0.11, approval: 5 },
  evaporative: { headroom: 9, waterMultiplier: 1.0, approval: 8 },
  liquid: { headroom: 7, waterMultiplier: 0.22, approval: 4 },
};

// Real published coefficients (see README) — used for the Water and Land
// gates' informational estimates.
const COEFFICIENTS = {
  GAL_PER_DAY_PER_MW_AVG: 11000, // 100MW facility ~= 1.1M gal/day at US-average WUE (1.8 L/kWh)
  EVAP_CONSUMED_FRACTION: 0.8, // evaporative cooling: ~80% of withdrawal is consumed, not returned
  LAND_COST_PER_ACRE: 244000, // 2024 average
  AVG_CAMPUS_ACRES: 244,
};

export function tierFor(score: number): TierInfo {
  if (score >= 75) return { label: "Buildable now", cls: "good" };
  if (score >= 50) return { label: "Minor upgrade", cls: "caution" };
  if (score >= 25) return { label: "Major upgrade", cls: "major" };
  return { label: "Try a nearby site", cls: "bad" };
}

function clamp(n: number, lo: number, hi: number) {
  return Math.max(lo, Math.min(hi, n));
}

// ---- gate 1: Power (real EIA-860 proxy) ----
export function nearbyPlants(
  lat: number,
  lng: number,
  radiusMiles: number,
  plants: PowerPlantFeature[]
) {
  const out: { feature: PowerPlantFeature; distanceMiles: number }[] = [];
  for (const f of plants) {
    const c = f.geometry as any;
    if (!c || c.type !== "Point") continue;
    const [lon2, lat2] = c.coordinates as [number, number];
    const d = milesBetween(lat, lng, lat2, lon2);
    if (d <= radiusMiles) out.push({ feature: f, distanceMiles: d });
  }
  return out;
}

export function gatePower(
  lat: number,
  lng: number,
  plants: PowerPlantFeature[],
  inputs: ScenarioInputs,
  statePostal: string | null
): GateResult {
  const nearby100 = nearbyPlants(lat, lng, 100, plants);
  if (nearby100.length === 0) {
    return {
      key: "power",
      label: "Power",
      pass: false,
      blocked: true,
      reason: note(
        "No EIA-860 generation facility within 100 miles — proxy suggests very weak transmission access here.",
        ["EIA-860"]
      ),
      notes: [],
    };
  }
  nearby100.sort((a, b) => a.distanceMiles - b.distanceMiles);
  const nearest = nearby100[0];

  const within25 = nearby100.filter((p) => p.distanceMiles <= 25);
  const totalNearbyMW = within25.reduce(
    (s, p) => s + (p.feature.properties.nameplate_mw || 0),
    0
  );

  const highVoltage = nearby100.filter(
    (p) => (p.feature.properties.max_grid_voltage_kv || 0) >= 230
  );
  const nearestHighVoltage = highVoltage.length ? highVoltage[0] : null;

  const base = 100 - Math.min(90, nearest.distanceMiles * 1.2);
  const capacityBoost = Math.min(20, totalNearbyMW / 500);
  let score = clamp(Math.round(base + capacityBoost), 5, 95);

  const notes: Note[] = [];
  notes.push(
    note(
      `Estimate: nearest EIA-860 plant is ${nearest.feature.properties.name} (${nearest.feature.properties.nameplate_mw} MW), ${nearest.distanceMiles.toFixed(1)} mi away. This is a proxy for grid density, not real substation headroom (CEII-restricted, not public).`,
      ["EIA-860", "nameplate capacity", "substation headroom", "CEII"]
    )
  );
  if (nearestHighVoltage) {
    notes.push(
      note(
        `${nearestHighVoltage.feature.properties.max_grid_voltage_kv}kV+ interconnection nearby: ${nearestHighVoltage.feature.properties.name}, ${nearestHighVoltage.distanceMiles.toFixed(1)} mi.`,
        ["grid voltage"]
      )
    );
  } else {
    notes.push(
      note("No 230kV+ interconnected plant found within 100 miles — likely a distribution-only area.", [
        "grid voltage",
      ])
    );
  }
  notes.push(
    note(
      `${Math.round(totalNearbyMW).toLocaleString()} MW of nameplate generation capacity within 25 miles (proxy for local grid strength).`,
      ["nameplate capacity"]
    )
  );

  if (statePostal === "TX") {
    if (inputs.loadMW >= 75) {
      notes.push(
        note("SB6 (2025): loads ≥75MW are subject to statewide interconnection/curtailment rules.", [
          "SB6",
          "ERCOT",
        ])
      );
    }
    if (inputs.interconnect === "grid-tied" && score >= 75) {
      score -= 15;
      notes.push(
        note(
          STATE_NOTES.TX?.gridTiedPauseNote ??
            "State grid-tied interconnection pause in effect.",
          ["interconnection"]
        )
      );
    }
    if (inputs.interconnect === "self-generated") {
      notes.push(
        note(
          "Self-generated facilities are exempt from the Aug 2026 grid-tied interconnection pause.",
          ["interconnection"]
        )
      );
    }
  }

  return { key: "power", label: "Power", pass: true, blocked: false, score, notes };
}

// ---- gate 2: Fiber (not wired to real data yet) ----
export function gateFiber(): GateResult {
  return {
    key: "fiber",
    label: "Fiber",
    pass: true,
    blocked: false,
    notes: [
      note(
        "Fiber/long-haul route data (FCC BDC, PeeringDB) is not wired in yet — this gate is a structural placeholder and doesn't affect the score."
      ),
    ],
  };
}

// ---- gate 3: Regulation (real, hand-curated per state — see README) ----
export function gateRegulatory(
  county: CountyFeature | null,
  statePostal: string | null
): GateResult & { countyName?: string } {
  if (!county) {
    return {
      key: "regulatory",
      label: "Regulation",
      pass: true,
      blocked: false,
      notes: [note("Outside a recognized county boundary.")],
    };
  }
  const name = county.properties.name;
  const rule = statePostal ? STATE_NOTES[statePostal] : undefined;
  const reg = rule?.counties?.[name];
  if (!reg) {
    return {
      key: "regulatory",
      label: "Regulation",
      pass: true,
      blocked: false,
      notes: [],
      countyName: name,
    };
  }
  if (reg.status === "blocked") {
    return {
      key: "regulatory",
      label: "Regulation",
      pass: false,
      blocked: true,
      reason: note(reg.reason),
      notes: [],
      countyName: name,
    };
  }
  if (reg.status === "paused") {
    return {
      key: "regulatory",
      label: "Regulation",
      pass: true,
      blocked: false,
      capScore: 55,
      notes: [note(`${reg.reason} Score capped pending local reopening.`)],
      countyName: name,
    };
  }
  // "notable" — informational context, not a constraint
  return {
    key: "regulatory",
    label: "Regulation",
    pass: true,
    blocked: false,
    notes: [note(reg.reason)],
    countyName: name,
  };
}

// ---- gate 4: Water (real published coefficients, no local supply-boundary data yet) ----
export function gateWater(inputs: ScenarioInputs): GateResult {
  const cooling = COOLING[inputs.cooling];
  const galPerDay = Math.round(
    inputs.loadMW * COEFFICIENTS.GAL_PER_DAY_PER_MW_AVG * cooling.waterMultiplier
  );
  const notes: Note[] = [
    note(
      `Estimated withdrawal at ${inputs.loadMW}MW with ${inputs.cooling} cooling: ~${galPerDay.toLocaleString()} gal/day (US-average WUE coefficient, 1.8 L/kWh, Shehabi/LBNL 2016).`,
      ["WUE"]
    ),
    note(
      "Local water-system capacity (EPA CWS service area boundaries) isn't wired in yet — this is a demand estimate only, not checked against real supply."
    ),
  ];
  if (inputs.cooling === "evaporative") {
    notes.push(
      note(
        `Evaporative cooling: ~${Math.round(COEFFICIENTS.EVAP_CONSUMED_FRACTION * 100)}% of withdrawal is consumed rather than returned to the source.`,
        ["evaporative cooling"]
      )
    );
  }
  return { key: "water", label: "Water", pass: true, blocked: false, notes, galPerDay };
}

// ---- gate 5: Land (real published coefficients, no parcel/zoning data yet) ----
export function gateLand(): GateResult {
  const estCost = COEFFICIENTS.LAND_COST_PER_ACRE * COEFFICIENTS.AVG_CAMPUS_ACRES;
  return {
    key: "land",
    label: "Land",
    pass: true,
    blocked: false,
    notes: [
      note(
        `Reference baseline: a ${COEFFICIENTS.AVG_CAMPUS_ACRES}-acre campus at $${COEFFICIENTS.LAND_COST_PER_ACRE.toLocaleString()}/acre (2024 avg) ≈ $${(estCost / 1e6).toFixed(0)}M land cost — not adjusted for this specific site; parcel/zoning data isn't wired in yet.`
      ),
    ],
  };
}

// ---- sequential gate-then-explain evaluation ----
export function evaluateSite(
  lat: number,
  lng: number,
  counties: CountyFeature[],
  plants: PowerPlantFeature[],
  inputs: ScenarioInputs
): SiteEvaluation {
  const county = findCounty(lat, lng, counties);
  const statePostal = county?.properties.statePostal ?? null;
  let name = county
    ? `${county.properties.name} County`
    : `Unnamed site (${lat.toFixed(2)}, ${lng.toFixed(2)})`;

  const gates: GateResult[] = [gatePower(lat, lng, plants, inputs, statePostal)];
  gates.push(gateFiber());
  const regResult = gateRegulatory(county, statePostal);
  gates.push(regResult);
  if (regResult.countyName) name = `${regResult.countyName} County`;

  for (const g of gates) {
    if (g.blocked) {
      return {
        lat,
        lng,
        countyFips: county?.properties.fips ?? null,
        statePostal,
        name,
        blocked: true,
        blockingGate: g.label,
        reason: g.reason,
        score: 0,
        tier: { label: "Blocked", cls: "bad" as Tier },
        gates,
      };
    }
  }

  gates.push(gateWater(inputs));
  gates.push(gateLand());

  let score = gates[0].score ?? 0;
  if (typeof regResult.capScore === "number") score = Math.min(score, regResult.capScore);
  const tier = tierFor(score);

  return {
    lat,
    lng,
    countyFips: county?.properties.fips ?? null,
    statePostal,
    name,
    blocked: false,
    score,
    tier,
    gates,
  };
}

/** Same power-gate proxy used for the county-fill color on the map, without
 * running the full click-evaluation pipeline (no lat/lng picked yet). */
export interface CountyFillState {
  cls: Tier;
  blocked: boolean;
  paused: boolean;
  score: number | null;
}

export function countyFillScore(
  county: CountyFeature,
  plants: PowerPlantFeature[],
  inputs: ScenarioInputs
): CountyFillState {
  const rule = county.properties.statePostal
    ? STATE_NOTES[county.properties.statePostal]
    : undefined;
  const reg = rule?.counties?.[county.properties.name];
  if (reg?.status === "blocked") return { cls: "bad", blocked: true, paused: false, score: null };
  const [lng, lat] = county.properties.centroid;
  const pw = gatePower(lat, lng, plants, inputs, county.properties.statePostal);
  if (!pw.pass) return { cls: "bad", blocked: true, paused: false, score: null };
  let score = pw.score ?? 0;
  if (reg?.status === "paused") {
    return { cls: "bad", blocked: false, paused: true, score: Math.min(score, 55) };
  }
  return { cls: tierFor(score).cls, blocked: false, paused: false, score };
}
