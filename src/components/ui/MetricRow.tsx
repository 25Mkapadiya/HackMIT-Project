import type { Metric } from "@/lib/types";
import ProvenanceTag from "./ProvenanceTag";

function formatValue(v: unknown, unit?: string): string {
  if (v === null || v === undefined) return "—";
  if (Array.isArray(v)) {
    if (v.length === 2 && typeof v[0] === "number" && typeof v[1] === "number") {
      if (unit === "USD") return `$${(v[0] / 1_000_000).toFixed(0)}M–$${(v[1] / 1_000_000).toFixed(0)}M`;
      return `${v[0]}–${v[1]}${unit ? ` ${unit}` : ""}`;
    }
    return v.join(", ");
  }
  if (typeof v === "number") {
    return `${v.toLocaleString()}${unit ? ` ${unit}` : ""}`;
  }
  return `${v}${unit && typeof v !== "string" ? ` ${unit}` : ""}`;
}

export default function MetricRow<T>({ metric }: { metric: Metric<T> }) {
  return (
    <div className="flex items-start justify-between gap-3 py-2 border-b border-base-800/70 last:border-0">
      <div className="flex items-center gap-1.5 text-[12px] text-ink-300 pt-0.5 shrink-0 max-w-[45%]">
        <span className="break-words">{metric.label}</span>
        <ProvenanceTag source={metric.source} caveats={metric.caveats} methodologyNote={metric.methodologyNote} />
      </div>
      <div className="text-right min-w-0 flex-1">
        <div className="text-[13px] font-semibold text-ink-100 font-mono break-words whitespace-normal">{formatValue(metric.value, metric.unit)}</div>
      </div>
    </div>
  );
}
