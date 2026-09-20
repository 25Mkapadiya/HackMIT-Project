import type { ScenarioAnalysis } from "@/lib/types";
import MetricRow from "@/components/ui/MetricRow";
import DistanceRow from "@/components/ui/DistanceRow";

function Section({
  title,
  color,
  children,
}: {
  title: string;
  color: string;
  children: React.ReactNode;
}) {
  return (
    <div className="mb-4">
      <div className="flex items-center gap-2 mb-1">
        <span className="h-1.5 w-1.5 rounded-full" style={{ background: color }} />
        <h4 className="text-[11px] font-bold tracking-[0.09em] uppercase" style={{ color }}>
          {title}
        </h4>
      </div>
      <div>{children}</div>
    </div>
  );
}

const SEVERITY_STYLE: Record<string, string> = {
  likely_required: "border-l-2 border-rose-500 bg-rose-500/5",
  watch: "border-l-2 border-amber-500 bg-amber-500/5",
  info: "border-l-2 border-slate-500 bg-slate-500/5",
};

export default function ImpactResults({ analysis }: { analysis: ScenarioAnalysis }) {
  const { power, fiber, regulation, efficiency, water, land, development, gaps } = analysis;

  return (
    <div className="px-3.5 py-3">
      <Section title="Power" color="#f2b93b">
        <MetricRow metric={{ label: "Facility requirement", value: power.facilityRequirementMw, unit: "MW", confidence: "fact", source: { id: "scenario-input", name: "User-configured scenario", url: "" } }} />
        <DistanceRow label="Nearest transmission (any)" result={power.nearestTransmission} extra={power.nearestTransmission.voltageKv ? `${power.nearestTransmission.voltageKv} kV — ${power.nearestTransmission.nearestFeatureLabel ?? ""}` : undefined} />
        <DistanceRow label="Nearest ≥115 kV" result={power.nearest115kv} extra={power.nearest115kv.voltageKv ? `${power.nearest115kv.voltageKv} kV` : undefined} />
        <DistanceRow label="Nearest ≥230 kV" result={power.nearest230kv} extra={power.nearest230kv.voltageKv ? `${power.nearest230kv.voltageKv} kV` : undefined} />
        <DistanceRow label="Nearest 500 kV" result={power.nearest500kv} extra={power.nearest500kv.voltageKv ? `${power.nearest500kv.voltageKv} kV` : undefined} />
        <MetricRow metric={power.utilityTerritory} />
        <MetricRow
          metric={{
            ...power.nearbyGeneration,
            value: power.nearbyGeneration.value
              ? `${Math.round(power.nearbyGeneration.value.totalMw).toLocaleString()} MW (${power.nearbyGeneration.value.count} facilities)`
              : null,
          }}
        />
        <MetricRow metric={power.gridCapacity} />
        <MetricRow
          metric={{
            ...power.gridDemandPressure,
            value: power.gridDemandPressure.value
              ? `${power.gridDemandPressure.demandPressureLabel} (${power.gridDemandPressure.value.countyName ?? "county"}, ~${Math.round(power.gridDemandPressure.value.densityPerSqMi ?? 0).toLocaleString()}/sq mi)`
              : null,
          }}
        />
        <MetricRow metric={power.likelyAction} />
      </Section>

      <Section title="Efficiency" color="#e0a84a">
        <MetricRow
          metric={{
            ...efficiency.estimatedPue,
            value: `${efficiency.estimatedPue.value.toFixed(2)} PUE`,
          }}
        />
        <div className="mt-1 mb-2 space-y-1 pl-0.5">
          {efficiency.estimatedPue.factors.map((f, i) => (
            <div key={i} className="flex items-start justify-between gap-3 text-[11px] leading-snug">
              <span className="text-ink-500">{f.label}</span>
              <span className="font-mono text-ink-300 shrink-0">
                {i === 0 ? "" : f.deltaPue >= 0 ? "+" : ""}
                {f.deltaPue.toFixed(2)}
              </span>
            </div>
          ))}
        </div>
      </Section>

      <Section title="Water" color="#3ba9f2">
        <MetricRow metric={water.estimatedConsumptionGalPerDay} />
        <MetricRow metric={water.estimatedWithdrawalGalPerDay} />
        <DistanceRow label="Nearest water body" result={water.nearestWaterBody} />
        <MetricRow metric={water.nearbyWaterRightsCount} />
        <MetricRow metric={water.droughtStatus} />
        <MetricRow metric={water.waterStressLabel} />
        <MetricRow metric={water.wueAssumption} />
      </Section>

      <Section title="Fiber / Connectivity" color="#9b6ef2">
        <MetricRow metric={fiber.broadbandContext} />
        <DistanceRow label="Nearest colo / IX facility" result={fiber.nearestIxp} />
        <MetricRow metric={fiber.longHaulFiberAvailability} />
      </Section>

      <Section title="Regulation" color="#f2703b">
        <MetricRow metric={regulation.county} />
        <MetricRow metric={regulation.permittingNote} />
      </Section>

      <Section title="Environment / Land" color="#3bf2a0">
        <MetricRow metric={land.femaFloodZone} />
        <MetricRow metric={land.elevationFt} />
        <MetricRow metric={land.nearestMajorRoadMiles} />
        <MetricRow metric={land.populationWithin5mi} />
        <MetricRow metric={{ ...land.environmentalConstraints, value: land.environmentalConstraints.value.join(" ") }} />
      </Section>

      <Section title="Development" color="#c9d3e0">
        <MetricRow metric={development.acreage} />
        <MetricRow metric={development.constructionCostUsd} />
        <MetricRow metric={development.timelineYears} />
      </Section>

      <div className="mb-1">
        <div className="flex items-center gap-2 mb-2">
          <span className="h-1.5 w-1.5 rounded-full bg-rose-400" />
          <h4 className="text-[11px] font-bold tracking-[0.09em] uppercase text-rose-300">Infrastructure Gaps</h4>
        </div>
        <div className="space-y-1.5">
          {gaps.map((g, i) => (
            <div key={i} className={`rounded-md px-2.5 py-2 ${SEVERITY_STYLE[g.severity]}`}>
              <div className="text-[12px] font-medium text-ink-100">{g.summary}</div>
              <div className="text-[11px] text-ink-500 mt-0.5 leading-snug">{g.detail}</div>
            </div>
          ))}
          {gaps.length === 0 && <div className="text-[11px] text-ink-500">No significant gaps flagged by the current heuristics.</div>}
        </div>
      </div>

      <div className="text-[9.5px] text-ink-700 mt-4 pt-2 border-t border-base-800">
        Generated {new Date(analysis.generatedAt).toLocaleString()} · Hover any <span className="inline-flex h-3 w-3 items-center justify-center rounded-full border border-base-600 text-[8px] mx-0.5">i</span> for source &amp; methodology.
      </div>
    </div>
  );
}
