import type { SourceMeta } from "@/lib/types";

interface ProvenanceTagProps {
  source: SourceMeta | SourceMeta[];
  caveats?: string[];
  methodologyNote?: string;
}

/** Hover-triggered provenance popover: SOURCE / DATE / METHODOLOGY / LIMITATIONS. */
export default function ProvenanceTag({ source, caveats, methodologyNote }: ProvenanceTagProps) {
  const sources = Array.isArray(source) ? source : [source];

  return (
    <span className="relative inline-flex group/prov">
      <button
        type="button"
        aria-label="Show data source and methodology"
        className="flex h-3.5 w-3.5 items-center justify-center rounded-full border border-base-600 text-[9px] text-ink-500 hover:text-ink-100 hover:border-ink-500 transition-colors"
      >
        i
      </button>
      <div className="invisible group-hover/prov:visible opacity-0 group-hover/prov:opacity-100 transition-opacity duration-150 absolute left-1/2 -translate-x-1/2 bottom-full mb-2 z-50 w-64 rounded-lg border border-base-600 bg-base-850 glass-panel p-3 text-left shadow-panel pointer-events-none">
        {sources.map((s) => (
          <div key={s.id} className="mb-2 last:mb-0">
            <div className="text-[9px] uppercase tracking-[0.08em] text-ink-500 mb-0.5">Source</div>
            <div className="text-[11.5px] text-ink-100 font-medium leading-snug">{s.name}</div>
            {s.refreshFrequency && (
              <div className="text-[10.5px] text-ink-500 mt-0.5">Refresh: {s.refreshFrequency}</div>
            )}
          </div>
        ))}
        {(methodologyNote || sources.some((s) => s.methodology)) && (
          <div className="mt-2 pt-2 border-t border-base-700">
            <div className="text-[9px] uppercase tracking-[0.08em] text-ink-500 mb-0.5">Methodology</div>
            <div className="text-[11px] text-ink-300 leading-snug">
              {methodologyNote ?? sources.map((s) => s.methodology).filter(Boolean).join(" ")}
            </div>
          </div>
        )}
        {caveats && caveats.length > 0 && (
          <div className="mt-2 pt-2 border-t border-base-700">
            <div className="text-[9px] uppercase tracking-[0.08em] text-ink-500 mb-0.5">Limitations</div>
            <ul className="text-[11px] text-ink-300 leading-snug list-disc list-inside space-y-0.5">
              {caveats.map((c, i) => (
                <li key={i}>{c}</li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </span>
  );
}
