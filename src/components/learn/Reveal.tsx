"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";

/**
 * Fades/slides content in once it scrolls into view, reusing the app's
 * existing `animate-fade-in`/`animate-slide-up` keyframes (tailwind.config.ts)
 * instead of introducing new animation primitives. Renders visible-by-default
 * so content isn't hidden if JS hasn't hydrated yet or IntersectionObserver
 * is unavailable.
 */
export default function Reveal({
  children,
  className = "",
  delay = 0,
}: {
  children: ReactNode;
  className?: string;
  delay?: number;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [shown, setShown] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el || typeof IntersectionObserver === "undefined") {
      setShown(true);
      return;
    }
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry?.isIntersecting) {
          setShown(true);
          observer.disconnect();
        }
      },
      { threshold: 0.15, rootMargin: "0px 0px -40px 0px" }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <div
      ref={ref}
      className={`${shown ? "animate-slide-up" : "opacity-0"} ${className}`}
      style={{ animationDelay: shown ? `${delay}ms` : undefined, animationFillMode: "backwards" }}
    >
      {children}
    </div>
  );
}
