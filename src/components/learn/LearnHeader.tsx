import Link from "next/link";

export default function LearnHeader() {
  return (
    <div className="sticky top-0 z-30 flex items-center justify-between gap-3 px-4 sm:px-6 h-14 glass-panel border-b border-base-700">
      <Link href="/" className="flex items-center gap-2 shrink-0">
        <div className="rounded-md bg-white px-1.5 py-1">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/logo-full.png" alt="GEO: Graphical Energy Outcomes" className="h-5 sm:h-6 w-auto block" />
        </div>
      </Link>
      <Link
        href="/"
        className="flex items-center gap-1.5 text-[11px] sm:text-[12px] font-medium text-ink-300 hover:text-ink-100 transition-colors px-2.5 py-1.5 rounded-md hover:bg-base-800"
      >
        <svg viewBox="0 0 24 24" aria-hidden="true" className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="M15 6 9 12l6 6" />
        </svg>
        Back to Map
      </Link>
    </div>
  );
}
