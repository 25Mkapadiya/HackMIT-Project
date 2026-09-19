import type { Confidence } from "@/lib/types";

const CONFIG: Record<Confidence, { label: string; className: string }> = {
  fact: { label: "FACT", className: "bg-emerald-500/15 text-emerald-300 border-emerald-500/30" },
  estimated: { label: "ESTIMATE", className: "bg-amber-500/15 text-amber-300 border-amber-500/30" },
  proxy: { label: "PROXY", className: "bg-violet-500/15 text-violet-300 border-violet-500/30" },
  unknown: { label: "UNKNOWN", className: "bg-slate-500/15 text-slate-400 border-slate-500/30" },
};

export default function ConfidenceBadge({ confidence, className = "" }: { confidence: Confidence; className?: string }) {
  const cfg = CONFIG[confidence];
  return (
    <span
      className={`inline-flex items-center rounded-full border px-1.5 py-[1px] text-[9px] font-bold tracking-[0.06em] ${cfg.className} ${className}`}
    >
      {cfg.label}
    </span>
  );
}
