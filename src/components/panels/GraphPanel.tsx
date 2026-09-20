"use client";

import { useMemo, useState } from "react";
import { useAppStore } from "@/store/useAppStore";
import type { ScenarioConfig } from "@/lib/types";
import DraggablePanel from "@/components/ui/DraggablePanel";
import { BASE_PUE_BY_COOLING_TECH, COOLING_TECH_TO_WUE_KEY, GALLONS_PER_LITER, WUE_L_PER_KWH } from "@/lib/constants/assumptions";
import { EU_COUNTRIES, EU_VARIABLES, type EuVariable } from "@/lib/data/euDataCentres";

const W = 420;
const H = 300;
const M = { top: 14, right: 16, bottom: 44, left: 58 };

function niceTicks(min: number, max: number, count = 5): number[] {
  if (min === max) return [min];
  const raw = (max - min) / count;
  const mag = Math.pow(10, Math.floor(Math.log10(raw)));
  const step = [1, 2, 2.5, 5, 10].map((m) => m * mag).find((s) => s >= raw) ?? raw;
  const ticks: number[] = [];
  for (let v = Math.ceil(min / step) * step; v <= max + step * 1e-9; v += step) ticks.push(+v.toPrecision(12));
  return ticks;
}

function fmt(v: number): string {
  const a = Math.abs(v);
  if (a >= 1e6) return `${+(v / 1e6).toFixed(2)}M`;
  if (a >= 1e4) return `${+(v / 1e3).toFixed(1)}k`;
  if (a >= 100) return `${Math.round(v)}`;
  return `${+v.toFixed(3)}`;
}

const axisLabel = (v: EuVariable) => (v.unit ? `${v.label} (${v.unit})` : v.label);

function VarSelect({ label, value, onChange }: { label: string; value: string; onChange: (k: string) => void }) {
  return (
    <label className="flex flex-col gap-1 min-w-0 flex-1">
      <span className="text-[10px] uppercase tracking-wider text-ink-500">{label}</span>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full h-8 rounded-md border border-base-700 bg-base-900 px-2 text-[11px] text-ink-100 focus:outline-none focus:border-base-500"
      >
        {EU_VARIABLES.map((v) => (
          <option key={v.key} value={v.key}>
            {axisLabel(v)}
          </option>
        ))}
      </select>
    </label>
  );
}

/**
 * Values for a user-proposed site, derived from its scenario config with the same model
 * assumptions the analysis engine uses. ERF/REF aren't modelled, so they're omitted.
 */
function scenarioValues(
  s: ScenarioConfig,
  analysisPue: number | null,
  analysisConsumptionGalPerDay: number | null
): Record<string, number> {
  // Prefer the analysis's modeled PUE once it has run; otherwise the cooling technology's base PUE.
  const pue = analysisPue ?? BASE_PUE_BY_COOLING_TECH[s.coolingTechnology]?.value ?? 1.4;
  const wueKey = COOLING_TECH_TO_WUE_KEY[s.coolingTechnology] ?? "us_average";
  const wue = WUE_L_PER_KWH[wueKey]?.value ?? WUE_L_PER_KWH.us_average.value;
  const edcKwh = s.mwLoad * 1000 * pue * 8760;
  // Prefer the analysis's own water model once it has run — it already reflects the
  // site's actual climate (see water.ts's climateWaterAdjustment), cooling technology's
  // real consumption math (closed-loop makeup/refresh, evaporative WUE, or zero for dry
  // rejection), not just a flat per-technology WUE constant. Falls back to the static
  // WUE table (annualized) only before the analysis has resolved.
  const win =
    analysisConsumptionGalPerDay != null
      ? (analysisConsumptionGalPerDay * 365) / GALLONS_PER_LITER / 1000
      : (edcKwh * wue) / 1000;
  return {
    pdit: s.mwLoad,
    edc: edcKwh / 1e6,
    win,
    pue,
    wue,
  };
}

export default function GraphPanel() {
  const open = useAppStore((s) => s.graphOpen);
  const setOpen = useAppStore((s) => s.setGraphOpen);
  const [xKey, setXKey] = useState("pdit");
  const [yKey, setYKey] = useState("edc");
  const scenarios = useAppStore((s) => s.scenarios);
  const analysisByScenario = useAppStore((s) => s.analysisByScenario);
  const [collapsed, setCollapsed] = useState(false);
  const [hover, setHover] = useState<string | null>(null);

  const xVar = EU_VARIABLES.find((v) => v.key === xKey)!;
  const yVar = EU_VARIABLES.find((v) => v.key === yKey)!;

  const { points, mine, fit, missing, xTicks, yTicks, sx, sy } = useMemo(() => {
    const all = EU_COUNTRIES.map((c) => ({ c, x: c.values[xKey], y: c.values[yKey] }));
    const pts = all.filter((p): p is { c: typeof p.c; x: number; y: number } => p.x != null && p.y != null);
    const mine = scenarios.flatMap((sc) => {
      const a = analysisByScenario[sc.id];
      const ready = a?.status === "ready";
      const v = scenarioValues(
        sc,
        ready ? a.data.efficiency.estimatedPue.value : null,
        ready ? a.data.water.estimatedConsumptionGalPerDay.value : null
      );
      const x = v[xKey];
      const y = v[yKey];
      return x != null && y != null ? [{ id: sc.id, label: sc.label, x, y }] : [];
    });
    const xs = [...pts.map((p) => p.x), ...mine.map((p) => p.x)];
    const ys = [...pts.map((p) => p.y), ...mine.map((p) => p.y)];
    const pad = (lo: number, hi: number): [number, number] => (hi === lo ? [lo - 1, hi + 1] : [Math.min(0, lo), hi + (hi - lo) * 0.05]);
    const [x0, x1] = pad(Math.min(...xs), Math.max(...xs));
    const [y0, y1] = pad(Math.min(...ys), Math.max(...ys));
    // Least-squares line through the EU points only; proposed sites are never included.
    let fit: { m: number; b: number; r2: number; xMin: number; xMax: number } | null = null;
    const n = pts.length;
    if (n >= 2) {
      const px = pts.map((p) => p.x);
      const py = pts.map((p) => p.y);
      const mx = px.reduce((a, v) => a + v, 0) / n;
      const my = py.reduce((a, v) => a + v, 0) / n;
      const sxx = px.reduce((a, v) => a + (v - mx) ** 2, 0);
      const syy = py.reduce((a, v) => a + (v - my) ** 2, 0);
      const sxy = px.reduce((a, v, i) => a + (v - mx) * (py[i]! - my), 0);
      if (sxx > 0) {
        const m = sxy / sxx;
        fit = { m, b: my - m * mx, r2: syy > 0 ? (sxy * sxy) / (sxx * syy) : 1, xMin: Math.min(...px), xMax: Math.max(...px) };
      }
    }
    const xt = niceTicks(x0, x1);
    const yt = niceTicks(y0, y1);
    const xMax = Math.max(x1, xt[xt.length - 1] ?? x1);
    const yMax = Math.max(y1, yt[yt.length - 1] ?? y1);
    return {
      points: pts,
      mine,
      fit,
      missing: all.length - pts.length,
      xTicks: xt,
      yTicks: yt,
      sx: (v: number) => M.left + ((v - x0) / (xMax - x0 || 1)) * (W - M.left - M.right),
      sy: (v: number) => H - M.bottom - ((v - y0) / (yMax - y0 || 1)) * (H - M.top - M.bottom),
    };
  }, [xKey, yKey, scenarios, analysisByScenario]);

  if (!open) return null;

  const hovered = hover?.startsWith("mine:")
    ? mine.filter((p) => `mine:${p.id}` === hover).map((p) => ({ name: p.label, x: p.x, y: p.y }))[0]
    : points.filter((p) => p.c.code === hover).map((p) => ({ name: p.c.name, x: p.x, y: p.y }))[0];

  return (
    <DraggablePanel
      title="Graph EU Data Centre Data"
      defaultPosition={{ x: 340, y: 76 }}
      width={460}
      headerAccent="#f2b93b"
      collapsed={collapsed}
      onToggleCollapse={() => setCollapsed((c) => !c)}
      onClose={() => setOpen(false)}
      className="!z-40"
    >
      <div className="p-3.5 flex flex-col gap-3">
        <div className="flex gap-2.5">
          <VarSelect label="X axis" value={xKey} onChange={setXKey} />
          <VarSelect label="Y axis" value={yKey} onChange={setYKey} />
        </div>

        <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-auto select-none" role="img" aria-label={`${yVar.label} versus ${xVar.label}`}>
          {yTicks.map((t) => (
            <g key={`y${t}`}>
              <line x1={M.left} x2={W - M.right} y1={sy(t)} y2={sy(t)} stroke="currentColor" className="text-base-700" strokeWidth={0.5} />
              <text x={M.left - 6} y={sy(t) + 3} textAnchor="end" fontSize={9} className="fill-ink-500">
                {fmt(t)}
              </text>
            </g>
          ))}
          {xTicks.map((t) => (
            <g key={`x${t}`}>
              <line x1={sx(t)} x2={sx(t)} y1={M.top} y2={H - M.bottom} stroke="currentColor" className="text-base-700" strokeWidth={0.5} />
              <text x={sx(t)} y={H - M.bottom + 13} textAnchor="middle" fontSize={9} className="fill-ink-500">
                {fmt(t)}
              </text>
            </g>
          ))}
          <line x1={M.left} x2={W - M.right} y1={H - M.bottom} y2={H - M.bottom} stroke="currentColor" className="text-base-500" />
          <line x1={M.left} x2={M.left} y1={M.top} y2={H - M.bottom} stroke="currentColor" className="text-base-500" />
          <text x={(M.left + W - M.right) / 2} y={H - 6} textAnchor="middle" fontSize={10} className="fill-ink-300">
            {axisLabel(xVar)}
          </text>
          <text
            transform={`translate(12 ${(M.top + H - M.bottom) / 2}) rotate(-90)`}
            textAnchor="middle"
            fontSize={10}
            className="fill-ink-300"
          >
            {axisLabel(yVar)}
          </text>

          <clipPath id="plot-area">
            <rect x={M.left} y={M.top} width={W - M.left - M.right} height={H - M.top - M.bottom} />
          </clipPath>
          {fit && (
            <line
              x1={sx(fit.xMin)}
              y1={sy(fit.m * fit.xMin + fit.b)}
              x2={sx(fit.xMax)}
              y2={sy(fit.m * fit.xMax + fit.b)}
              stroke="#3b82f6"
              strokeWidth={1.5}
              strokeDasharray="5 3"
              strokeOpacity={0.8}
              clipPath="url(#plot-area)"
            />
          )}
          {points.map((p) => {
            const active = hover === p.c.code;
            return (
              <g
                key={p.c.code}
                onMouseEnter={() => setHover(p.c.code)}
                onMouseLeave={() => setHover(null)}
                className="cursor-pointer"
              >
                <circle cx={sx(p.x)} cy={sy(p.y)} r={active ? 6 : 4.5} fill="#3b82f6" fillOpacity={active ? 1 : 0.8} stroke="#0b1220" strokeWidth={1} />
              </g>
            );
          })}
          {mine.map((p) => {
            const active = hover === `mine:${p.id}`;
            return (
              <circle
                key={p.id}
                cx={sx(p.x)}
                cy={sy(p.y)}
                r={active ? 6.5 : 5}
                fill="#ef4444"
                stroke="#0b1220"
                strokeWidth={1}
                className="cursor-pointer"
                onMouseEnter={() => setHover(`mine:${p.id}`)}
                onMouseLeave={() => setHover(null)}
              />
            );
          })}
        </svg>

        <div className="min-h-[32px] text-[11px] text-ink-300 leading-snug">
          {hovered ? (
            <>
              <span className="font-semibold text-ink-100">{hovered.name}</span> — {xVar.label}: {fmt(hovered.x)} {xVar.unit}; {yVar.label}:{" "}
              {fmt(hovered.y)} {yVar.unit}
            </>
          ) : (
            <span className="text-ink-500">Hover a point for details.</span>
          )}
        </div>

        <div className="text-[10px] text-ink-500 leading-snug border-t border-base-700/80 pt-2">
          {points.length} of {EU_COUNTRIES.length} Member States plotted
          {missing > 0 ? ` (${missing} lack data for one of the variables)` : ""}.
          {fit && ` Dashed line: best fit through the EU points (R² = ${fit.r2.toFixed(2)}); proposed sites are excluded from the fit.`}
          {mine.length > 0 && " Red points are your proposed sites (modelled estimates)."} Source: European Commission, “Assessment of the energy
          performance and sustainability of data centres in EU”, First technical report, July 2025 ({xVar.source}
          {xVar.source !== yVar.source ? `, ${yVar.source}` : ""}).
        </div>
      </div>
    </DraggablePanel>
  );
}
