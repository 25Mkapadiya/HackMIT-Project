import type { ReactNode } from "react";
import Reveal from "./Reveal";

export function Section({
  id,
  className = "",
  children,
}: {
  id?: string;
  className?: string;
  children: ReactNode;
}) {
  return (
    <section id={id} className={`mx-auto w-full max-w-5xl px-4 sm:px-6 py-14 sm:py-20 ${className}`}>
      {children}
    </section>
  );
}

export function SectionHeading({
  eyebrow,
  title,
  subtitle,
  center = true,
}: {
  eyebrow?: string;
  title: string;
  subtitle?: string;
  center?: boolean;
}) {
  return (
    <Reveal className={`mb-10 sm:mb-12 ${center ? "text-center" : ""}`}>
      {eyebrow && (
        <div className="text-[11px] font-bold uppercase tracking-[0.14em] text-accent-power mb-2.5">{eyebrow}</div>
      )}
      <h2 className="text-[24px] sm:text-[32px] font-bold text-ink-100 tracking-tight leading-tight">{title}</h2>
      {subtitle && (
        <p className={`mt-3 text-[13.5px] sm:text-[15px] text-ink-500 leading-relaxed ${center ? "mx-auto max-w-2xl" : "max-w-2xl"}`}>
          {subtitle}
        </p>
      )}
    </Reveal>
  );
}

export function IconCircle({
  icon,
  color = "#8fa3bf",
  size = "md",
}: {
  icon: ReactNode;
  color?: string;
  size?: "sm" | "md";
}) {
  const dim = size === "sm" ? "h-8 w-8" : "h-11 w-11";
  const iconDim = size === "sm" ? "h-4 w-4" : "h-5 w-5";
  return (
    <div
      className={`shrink-0 ${dim} rounded-full flex items-center justify-center`}
      style={{ background: `${color}1a`, color }}
    >
      <span className={iconDim}>{icon}</span>
    </div>
  );
}

export function InfoCard({
  icon,
  color = "#8fa3bf",
  title,
  children,
  delay = 0,
}: {
  icon?: ReactNode;
  color?: string;
  title: string;
  children: ReactNode;
  delay?: number;
}) {
  return (
    <Reveal
      delay={delay}
      className="group h-full rounded-xl border border-base-700 bg-base-900/60 glass-panel p-4 sm:p-5 transition-all duration-200 hover:border-base-600 hover:-translate-y-0.5 hover:shadow-panel"
    >
      {icon && <IconCircle icon={icon} color={color} />}
      <h3 className="mt-3 text-[13.5px] sm:text-[14.5px] font-semibold text-ink-100">{title}</h3>
      <div className="mt-1.5 text-[12px] sm:text-[12.5px] text-ink-500 leading-relaxed">{children}</div>
    </Reveal>
  );
}

export function Callout({ children, color = "#f2b93b" }: { children: ReactNode; color?: string }) {
  return (
    <div
      className="rounded-lg border px-3.5 py-3 text-[12px] sm:text-[12.5px] leading-relaxed"
      style={{ borderColor: `${color}40`, background: `${color}0d`, color: "#eef2f7" }}
    >
      <span className="font-semibold" style={{ color }}>
        Note —{" "}
      </span>
      {children}
    </div>
  );
}

export function StatCallout({ value, label, color = "#f2b93b" }: { value: string; label: string; color?: string }) {
  return (
    <Reveal className="rounded-xl border border-base-700 bg-base-900/60 glass-panel px-5 py-4 text-center">
      <div className="text-[26px] sm:text-[32px] font-bold font-mono" style={{ color }}>
        {value}
      </div>
      <div className="mt-1 text-[11px] sm:text-[12px] text-ink-500 leading-snug">{label}</div>
    </Reveal>
  );
}

export function FlowStep({ label, sub }: { label: string; sub?: string }) {
  return (
    <div className="rounded-lg border border-base-700 bg-base-900/70 px-4 py-2.5 text-center">
      <div className="text-[12.5px] sm:text-[13px] font-semibold text-ink-100">{label}</div>
      {sub && <div className="text-[10.5px] text-ink-500 mt-0.5">{sub}</div>}
    </div>
  );
}

export function FlowArrow({ direction = "right" }: { direction?: "right" | "down" }) {
  return (
    <div className={`flex items-center justify-center text-ink-700 shrink-0 ${direction === "right" ? "w-6" : "h-6"}`}>
      <svg
        viewBox="0 0 24 24"
        className={direction === "right" ? "h-4 w-4" : "h-4 w-4 rotate-90"}
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M5 12h14M13 6l6 6-6 6" />
      </svg>
    </div>
  );
}
