/**
 * Member State data from "Assessment of the energy performance and sustainability of data
 * centres in EU — First technical report" (European Commission, DG Energy, July 2025).
 * Sources: Table 13 (estimated vs. reporting data centres), Table 24 (PDIT / EDC / WIN),
 * Tables 25–28 (average PUE / WUE / ERF / REF per Member State).
 * null = "no data" in the report.
 */
export interface EuVariable {
  key: string;
  label: string;
  unit: string;
  source: string;
}

export const EU_VARIABLES: EuVariable[] = [
  { key: "pdit", label: "Installed IT power demand (PDIT)", unit: "MW", source: "Table 24" },
  { key: "edc", label: "Total energy consumption (EDC)", unit: "GWh", source: "Table 24" },
  { key: "win", label: "Water consumption per data centre (WIN)", unit: "m³/yr", source: "Table 24 (WIN ÷ reporting data centres)" },
  { key: "pue", label: "Average PUE", unit: "", source: "Table 25" },
  { key: "wue", label: "Average WUE", unit: "L/kWh", source: "Table 26" },
  { key: "erf", label: "Average ERF (energy reuse factor)", unit: "", source: "Table 27" },
  { key: "ref", label: "Average REF (renewable energy factor)", unit: "", source: "Table 28" },
];

export interface EuCountryRow {
  code: string;
  name: string;
  values: Record<string, number | null>;
}

// [code, name, estimated, reporting, PDIT, EDC, WIN, PUE, WUE, ERF, REF]
type Raw = [string, string, number, number, number, number, number | null, number, number | null, number | null, number];

const RAW: Raw[] = [
  ["AT", "Austria", 47, 11, 16.14, 111.1, 6288, 1.5, 0.14, 0.006, 0.58],
  ["BE", "Belgium", 48, 16, 236.13, 1070.95, 1240048, 1.15, 1.28, null, 0.96],
  ["BG", "Bulgaria", 30, 3, 4.11, 20.14, 4601, 1.46, 0.32, null, 1.0],
  ["DE", "Germany", 456, 335, 946.87, 4608.53, 1841262, 1.39, 0.65, 0.17, 0.89],
  ["DK", "Denmark", 58, 17, 193.74, 731.28, 330801, 1.21, 0.57, 0.236, 0.96],
  ["EL", "Greece", 20, 6, 1.78, 36.9, 4879, 1.63, 0.2, null, 1.0],
  ["ES", "Spain", 165, 42, 101.03, 603.63, 214501, 1.66, 0.7, 0.171, 0.94],
  ["FI", "Finland", 72, 25, 219.67, 1091.18, 8599, 1.17, 0.07, 0.457, 1.0],
  ["FR", "France", 264, 133, 1311.43, 2416.9, 399147, 1.55, 0.25, 0.1, 0.8],
  ["HR", "Croatia", 19, 1, 0.88, 7.71, 280, 1.38, 0.05, null, 0.0],
  // WIN is null (not 0) for HU/LT/MT: their WUE (Table 26) is also unreported (null)
  // on these same rows, and every other country with a real WIN also has a real WUE —
  // so a literal 0 here would misreport "no data" as "confirmed zero water use."
  ["HU", "Hungary", 19, 1, 0.53, 6.52, null, 2.0, null, 0.057, 0.0],
  ["IE", "Ireland", 123, 18, 315.92, 1411.76, 626594, 1.18, 0.64, null, 0.99],
  ["IT", "Italy", 178, 23, 92.02, 350.24, 78351, 1.46, 0.7, 0.217, 0.8],
  ["LT", "Lithuania", 18, 3, 2.3, 18.0, null, 1.28, null, null, 0.81],
  ["LU", "Luxembourg", 14, 2, 11.2, 53.22, 12279, 1.37, 0.32, 0.0, 0.25],
  ["LV", "Latvia", 25, 1, 0.7, 6.3, 60, 1.4, 0.01, 0.039, 0.84],
  ["MT", "Malta", 8, 1, 0.64, 7.95, null, 1.4, null, null, 0.0],
  ["NL", "Netherlands", 192, 85, 102.76, 574.87, 1356210, 1.39, 0.66, 0.068, 0.79],
  ["PL", "Poland", 87, 36, 59.05, 276.55, 20359, 1.55, 0.21, 0.0, 0.59],
  ["PT", "Portugal", 42, 4, 7.67, 48.75, 27919, 1.58, 0.98, 0.006, 0.36],
  ["SE", "Sweden", 103, 7, 114.3, 635.53, 51213, 1.17, 0.1, null, 0.5],
];

export const EU_COUNTRIES: EuCountryRow[] = RAW.map((r) => ({
  code: r[0],
  name: r[1],
  values: {
    estimatedDcs: r[2],
    reportingDcs: r[3],
    pdit: r[4],
    edc: r[5],
    // Table 24's WIN is a national total across every reporting data centre, so it's
    // not comparable to one proposed site's estimated annual water use (a single site
    // always reads as ~0 next to e.g. Belgium's 1.24M m³/yr total). Dividing by the
    // reporting-data-centre count puts it on the same per-facility basis GraphPanel
    // computes for a scenario (see scenarioValues's `win` in GraphPanel.tsx).
    win: r[6] != null && r[3] > 0 ? r[6] / r[3] : null,
    pue: r[7],
    wue: r[8],
    erf: r[9],
    ref: r[10],
  },
}));
