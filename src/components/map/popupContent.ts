const NOISE_CLASSIFICATION_COLOR: Record<string, string> = {
  low: "#3bf2a0",
  moderate: "#f2b93b",
  significant: "#f2703b",
  high: "#ff5470",
  unknown: "#7d8ba0",
};

/** Compact hover summary for a proposed-site marker — score + classification only; full detail lives in the scenario panel. */
export function buildNoisePopupHtml(
  siteLabel: string,
  noise: { noiseImpactScore: number | null; classification: string } | null
): string {
  if (!noise || noise.noiseImpactScore == null) {
    return `
      <div style="padding:8px 11px;min-width:150px;font-family:var(--font-inter),system-ui,sans-serif;">
        <div style="font-size:11px;font-weight:600;color:#eef2f7;margin-bottom:2px;">${siteLabel}</div>
        <div style="font-size:11px;color:#7d8ba0;">Noise Impact: Limited Data</div>
      </div>`;
  }
  const color = NOISE_CLASSIFICATION_COLOR[noise.classification] ?? "#7d8ba0";
  return `
    <div style="padding:8px 11px;min-width:150px;font-family:var(--font-inter),system-ui,sans-serif;">
      <div style="font-size:11px;font-weight:600;color:#eef2f7;margin-bottom:3px;">${siteLabel}</div>
      <div style="font-size:12.5px;color:#eef2f7;">Noise Impact: <strong>${noise.noiseImpactScore}/100</strong></div>
      <div style="font-size:10.5px;font-weight:700;letter-spacing:.05em;text-transform:uppercase;color:${color};margin-top:1px;">${noise.classification}</div>
    </div>`;
}

/** Small per-layer HTML formatters for MapLibre popups. Kept deliberately simple/inline-styled since it's injected as raw HTML into a maplibre Popup. */
export function buildPopupHtml(layerId: string, props: Record<string, unknown>): string {
  const wrap = (title: string, rows: [string, string | number | null | undefined][]) => `
    <div style="padding:10px 12px;min-width:190px;font-family:var(--font-inter),system-ui,sans-serif;">
      <div style="font-size:11px;letter-spacing:.06em;text-transform:uppercase;color:#7d8ba0;margin-bottom:4px;">${title}</div>
      ${rows
        .filter(([, v]) => v !== undefined)
        .map(
          ([k, v]) =>
            `<div style="display:flex;justify-content:space-between;gap:14px;font-size:12.5px;padding:2px 0;"><span style="color:#b8c3d1;">${k}</span><span style="color:#eef2f7;font-weight:500;text-align:right;">${
              v ?? "—"
            }</span></div>`
        )
        .join("")}
    </div>`;

  switch (layerId) {
    case "transmission-lines":
      return wrap("Transmission Line", [
        ["Line", (props.OperatingLineNm as string) || (props.XRefCd as string) || "Unnamed"],
        ["Voltage", props.VoltageMeas ? `${props.VoltageMeas} kV` : "Unknown"],
        [
          "Local pop. density",
          props.PopulationDensityPerSqMi
            ? `${Math.round(props.PopulationDensityPerSqMi as number).toLocaleString()} / sq mi`
            : "Rural / unavailable",
        ],
      ]);
    case "utility-territories":
      return wrap("Utility Territory", [["Utility", (props.Name as string) || "Unknown"]]);
    case "electric-substations":
      return wrap("Electric Substation", [
        ["Name", (props.Name as string) || "Unnamed / unverified"],
        ["County", (props.County as string) || "Unknown"],
        ["Status", (props.Status as string) || "Unknown"],
        ["Max voltage", props.MaxVoltKv ? `${props.MaxVoltKv} kV` : "Unknown"],
        ["Lines", props.Lines != null ? String(props.Lines) : "Unknown"],
        ["Owner", (props.Owner as string) || "Unknown"],
      ]);
    case "hydrography-rivers":
    case "hydrography-waterbodies":
      return wrap("Hydrography", [["Name", (props.GNIS_Name as string) || "Unnamed"]]);
    case "usgs-gauges":
      return wrap("USGS Streamflow Gauge", [
        ["Site", props.siteName as string],
        ["Discharge", props.latestValue ? `${props.latestValue} ${props.unit ?? "cfs"}` : "N/A"],
        ["As of", props.latestDateTime as string],
      ]);
    case "water-diversions":
      return wrap("Water Right Diversion", Object.entries(props).slice(0, 5) as [string, string][]);
    case "drought-areas":
      return wrap("Drought Declaration Area", Object.entries(props).slice(0, 5) as [string, string][]);
    case "colocation-facilities":
      return wrap("Colocation / Interconnection Facility", [
        ["Name", props.name as string],
        ["City", props.city as string],
      ]);
    case "flood-zones":
      return wrap("FEMA Flood Zone", [
        ["Zone", (props.FLD_ZONE as string) || "Unclassified"],
        ["High-risk (SFHA)", props.SFHA_TF === "T" ? "Yes" : "No"],
      ]);
    case "state-highways":
      return wrap("State Highway", [
        ["Route", (props.StateRouteNumber as string) || "—"],
        ["Functional class", props.FederalFunctionalClassDesc as string],
      ]);
    case "population-tracts":
      return wrap("Census Tract", [["Tract", (props.NAME as string) || (props.GEOID as string)]]);
    case "population-density":
      return wrap("County Population Density", [
        ["County", (props.CountyName as string) || "Unknown"],
        ["State", props.State as string],
        ["Population", props.Population ? (props.Population as number).toLocaleString() : "Unavailable"],
        ["Land area", props.LandAreaSqMi ? `${(props.LandAreaSqMi as number).toLocaleString()} sq mi` : "Unavailable"],
        [
          "Density",
          props.PopulationDensityPerSqMi
            ? `${Math.round(props.PopulationDensityPerSqMi as number).toLocaleString()} / sq mi`
            : "Unavailable",
        ],
      ]);
    case "power-plants":
      return wrap("Power Generation Facility", [
        ["Plant", props.plantName as string],
        ["Fuel", props.fuel as string],
        ["Nameplate", props.nameplateMw ? `${props.nameplateMw} MW` : "Unknown"],
      ]);
    case "data-centers":
      return wrap("Data Center Campus", [
        ["Name", props.name as string],
        ["Operator", props.operator as string],
        ["City", props.city as string],
      ]);
    default:
      return wrap(layerId, Object.entries(props).slice(0, 6) as [string, string][]);
  }
}
