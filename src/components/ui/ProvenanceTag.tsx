"use client";

import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import type { SourceMeta } from "@/lib/types";

interface ProvenanceTagProps {
  source: SourceMeta | SourceMeta[];
  caveats?: string[];
  methodologyNote?: string;
}

const POPOVER_WIDTH = 256;
const VIEWPORT_MARGIN = 8;

/**
 * Hover-triggered provenance popover: SOURCE / DATE / METHODOLOGY / LIMITATIONS.
 * Rendered through a portal at a viewport-clamped position instead of being
 * CSS-centered on the button, so it never gets clipped by a scrolling panel
 * or pushed off-screen near a panel edge.
 */
export default function ProvenanceTag({ source, caveats, methodologyNote }: ProvenanceTagProps) {
  const sources = Array.isArray(source) ? source : [source];
  const buttonRef = useRef<HTMLButtonElement | null>(null);
  const [open, setOpen] = useState(false);
  const [style, setStyle] = useState<{ left: number; top?: number; bottom?: number } | null>(null);

  useEffect(() => {
    if (!open) return;
    function reposition() {
      const rect = buttonRef.current?.getBoundingClientRect();
      if (!rect) return;
      const left = Math.min(
        Math.max(rect.left + rect.width / 2 - POPOVER_WIDTH / 2, VIEWPORT_MARGIN),
        window.innerWidth - POPOVER_WIDTH - VIEWPORT_MARGIN
      );
      if (rect.top > 220) {
        setStyle({ left, bottom: window.innerHeight - rect.top + 8 });
      } else {
        setStyle({ left, top: rect.bottom + 8 });
      }
    }
    reposition();
    window.addEventListener("scroll", reposition, true);
    window.addEventListener("resize", reposition);
    return () => {
      window.removeEventListener("scroll", reposition, true);
      window.removeEventListener("resize", reposition);
    };
  }, [open]);

  return (
    <span className="relative inline-flex">
      <button
        ref={buttonRef}
        type="button"
        aria-label="Show data source and methodology"
        onMouseEnter={() => setOpen(true)}
        onMouseLeave={() => setOpen(false)}
        onFocus={() => setOpen(true)}
        onBlur={() => setOpen(false)}
        className="flex h-3.5 w-3.5 items-center justify-center rounded-full border border-base-600 text-[9px] text-ink-500 hover:text-ink-100 hover:border-ink-500 transition-colors"
      >
        i
      </button>
      {open && style && typeof document !== "undefined"
        ? createPortal(
            <div
              className="fixed z-[100] w-64 rounded-lg border border-base-600 bg-base-850 glass-panel p-3 text-left shadow-panel pointer-events-none"
              style={style}
            >
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
            </div>,
            document.body
          )
        : null}
    </span>
  );
}
