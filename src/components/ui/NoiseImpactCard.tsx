import type { NoiseAnalysis } from "@/lib/types";

const CLASSIFICATION_STYLE: Record<NoiseAnalysis["classification"], { label: string; color: string; bg: string }> = {
  low: { label: "LOW", color: "#3bf2a0", bg: "bg-[#3bf2a0]/10" },
  moderate: { label: "MODERATE", color: "#f2b93b", bg: "bg-[#f2b93b]/10" },
  significant: { label: "SIGNIFICANT", color: "#f2703b", bg: "bg-[#f2703b]/10" },
  high: { label: "HIGH", color: "#ff5470", bg: "bg-[#ff5470]/10" },
  unknown: { label: "LIMITED DATA", color: "#7d8ba0", bg: "bg-base-700/40" },
};

function Bar({ value, max, color }: { value: number; max: number; color: string }) {
  const pct = Math.max(0, Math.min(100, (value / max) * 100));
  return (
    <div className="h-1.5 w-full rounded-full bg-base-800 overflow-hidden">
      <div className="h-full rounded-full transition-all" style={{ width: `${pct}%`, background: color }} />
    </div>
  );
}

export default function NoiseImpactCard({ noise }: { noise: NoiseAnalysis }) {
  const style = CLASSIFICATION_STYLE[noise.classification];
  const score = noise.noiseImpactScore.value;

  return (
    <div className="rounded-lg border border-base-700 bg-base-900/50 p-3.5">
      <div className="flex items-center gap-2 mb-2.5">
        <span className="h-1.5 w-1.5 rounded-full bg-[#f2703b]" />
        <h4 className="text-[11px] font-bold tracking-[0.09em] uppercase text-[#f2703b]">Noise Impact</h4>
      </div>

      {!noise.available || score == null ? (
        <div className="text-[13px] font-semibold text-ink-300">Limited Data</div>
      ) : (
        <div className="flex items-baseline gap-2 mb-1">
          <span className="text-[22px] font-bold font-mono text-ink-100">{score}</span>
          <span className="text-[11px] text-ink-500">/ 100</span>
          <span
            className={`ml-auto text-[10px] font-bold tracking-[0.08em] px-2 py-0.5 rounded-full ${style.bg}`}
            style={{ color: style.color }}
          >
            {style.label}
          </span>
        </div>
      )}

      {noise.available && score != null && (
        <div className="space-y-2.5 mt-3">
          <div>
            <div className="flex items-center justify-between text-[10.5px] text-ink-500 mb-1">
              <span>Cooling System — {noise.coolingNoisePotential.value}/10</span>
            </div>
            <Bar value={noise.coolingNoisePotential.value} max={10} color="#8fa3bf" />
          </div>
          <div>
            <div className="flex items-center justify-between text-[10.5px] text-ink-500 mb-1">
              <span>Residential Exposure — {noise.residentialExposure.value?.toFixed(1) ?? "—"}/10</span>
            </div>
            <Bar value={noise.residentialExposure.value ?? 0} max={10} color={style.color} />
          </div>

          <div className="text-[11px] text-ink-300 space-y-0.5 pt-0.5">
            <div className="flex justify-between">
              <span className="text-ink-500">Nearby residential density</span>
              <span>{noise.residentialDensityScore.densityLabel}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-ink-500">Residential proximity</span>
              <span>
                {noise.residentialProximityScore.distanceMiles != null
                  ? `${noise.residentialProximityScore.distanceMiles} mi`
                  : "Estimated from density"}
              </span>
            </div>
          </div>
        </div>
      )}

      <div className="mt-3 pt-2.5 border-t border-base-800">
        <div className="text-[10px] font-semibold uppercase tracking-wide text-ink-500 mb-1">Why?</div>
        <p className="text-[11.5px] text-ink-300 leading-snug">{noise.explanation}</p>
      </div>

      <p className="text-[9.5px] text-ink-700 leading-snug mt-2.5 pt-2 border-t border-base-800/70">
        Screening-level estimate based on cooling technology and surrounding residential exposure, not a
        prediction of measured decibel levels — actual sound depends on equipment specs, facility design,
        barriers, operating conditions, and local noise regulations.
      </p>
    </div>
  );
}
