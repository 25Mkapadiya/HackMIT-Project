"use client";

import { useState, type ReactNode } from "react";
import Reveal from "./Reveal";

interface ConcernItem {
  icon: ReactNode;
  color: string;
  title: string;
  text: string;
  considerations?: string[];
  extra?: ReactNode;
}

export default function ConcernsAccordion({ items }: { items: ConcernItem[] }) {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  return (
    <div className="space-y-2.5">
      {items.map((item, i) => {
        const open = openIndex === i;
        return (
          <Reveal key={item.title} delay={i * 40} className="rounded-xl border border-base-700 bg-base-900/60 glass-panel overflow-hidden">
            <button
              type="button"
              onClick={() => setOpenIndex(open ? null : i)}
              aria-expanded={open}
              className="w-full flex items-center gap-3 px-4 py-3.5 text-left hover:bg-base-800/40 transition-colors"
            >
              <span
                className="shrink-0 h-8 w-8 rounded-full flex items-center justify-center"
                style={{ background: `${item.color}1a`, color: item.color }}
              >
                <span className="h-4 w-4">{item.icon}</span>
              </span>
              <span className="flex-1 text-[13px] sm:text-[13.5px] font-semibold text-ink-100">{item.title}</span>
              <svg
                viewBox="0 0 24 24"
                aria-hidden="true"
                className={`h-4 w-4 shrink-0 text-ink-500 transition-transform ${open ? "" : "-rotate-90"}`}
                fill="none"
                stroke="currentColor"
                strokeWidth="3"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="m6 9 6 6 6-6" />
              </svg>
            </button>
            {open && (
              <div className="px-4 pb-4 pl-[3.75rem] -mt-1 animate-fade-in">
                <p className="text-[12px] sm:text-[12.5px] text-ink-500 leading-relaxed">{item.text}</p>
                {item.considerations && (
                  <div className="mt-2.5 flex flex-wrap gap-1.5">
                    {item.considerations.map((c) => (
                      <span
                        key={c}
                        className="text-[10.5px] font-medium px-2 py-1 rounded-md border border-base-700 text-ink-300"
                      >
                        {c}
                      </span>
                    ))}
                  </div>
                )}
                {item.extra}
              </div>
            )}
          </Reveal>
        );
      })}
    </div>
  );
}
