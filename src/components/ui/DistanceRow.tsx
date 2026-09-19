import type { DistanceResult } from "@/lib/types";
import ConfidenceBadge from "./ConfidenceBadge";
import ProvenanceTag from "./ProvenanceTag";

export default function DistanceRow({
  label,
  result,
  extra,
}: {
  label: string;
  result: DistanceResult;
  extra?: string;
}) {
  return (
    <div className="flex items-start justify-between gap-3 py-2 border-b border-base-800/70 last:border-0">
      <div className="flex items-center gap-1.5 text-[12px] text-ink-300 pt-0.5">
        <span>{label}</span>
        <ProvenanceTag source={result.source} />
      </div>
      <div className="text-right shrink-0">
        <div className="text-[13px] font-semibold text-ink-100 font-mono">
          {result.distanceMiles != null ? `${result.distanceMiles} mi` : "—"}
        </div>
        {(result.nearestFeatureLabel || extra) && (
          <div className="text-[10px] text-ink-500 truncate max-w-[140px]">{extra ?? result.nearestFeatureLabel}</div>
        )}
        <div className="mt-0.5">
          <ConfidenceBadge confidence={result.confidence} />
        </div>
      </div>
    </div>
  );
}
