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
      ]);
    case "utility-territories":
      return wrap("Utility Territory", [["Utility", (props.Name as string) || "Unknown"]]);
    case "substations":
      return wrap("Substation", [
        ["Name", props.name as string],
        ["Max voltage", props.maxVoltageKv ? `${props.maxVoltageKv} kV` : "Unknown"],
        ["Status", (props.status as string) || "Unknown"],
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
    case "broadband-coverage":
      return wrap("Fiber Broadband Coverage (proxy)", [["Technology", (props.TechType as string) || "Fiber"]]);
    case "protected-land":
      return wrap("Conservation Easement", [
        ["Type", (props.ease_type as string) || "Unknown"],
        ["Acres", props.ease_acres ? Number(props.ease_acres).toFixed(1) : "Unknown"],
        ["Status", (props.exp_status as string) || "Unknown"],
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
