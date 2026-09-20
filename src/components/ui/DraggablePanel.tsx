"use client";

import { useRef, useState, type CSSProperties, type ReactNode } from "react";

interface DraggablePanelProps {
  title: string;
  icon?: ReactNode;
  /** Initial offset. Interpreted as `left`/`top` when anchor="left", or `right`/`top` when anchor="right". */
  defaultPosition: { x: number; y: number };
  anchor?: "left" | "right";
  width?: number;
  children: ReactNode;
  collapsed?: boolean;
  onToggleCollapse?: () => void;
  onClose?: () => void;
  headerAccent?: string;
  className?: string;
  /** Set false to pin the panel at defaultPosition and disable header drag entirely. */
  draggable?: boolean;
}

/**
 * A floating panel that can be dragged by its header. Starts CSS-anchored (left or right,
 * so it stays sensible at any viewport width without touching `window` during SSR), and
 * switches to absolute left/top pixel positioning the first time it's actually dragged.
 */
export default function DraggablePanel({
  title,
  icon,
  defaultPosition,
  anchor = "left",
  width = 300,
  children,
  collapsed,
  onToggleCollapse,
  onClose,
  headerAccent = "#8fa3bf",
  className = "",
  draggable = true,
}: DraggablePanelProps) {
  const [pos, setPos] = useState<{ x: number; y: number } | null>(null);
  const panelRef = useRef<HTMLDivElement | null>(null);
  const dragState = useRef<{ startX: number; startY: number; origX: number; origY: number } | null>(null);
  const [dragging, setDragging] = useState(false);

  function onPointerDown(e: React.PointerEvent) {
    if (!draggable) return;
    const rect = panelRef.current?.getBoundingClientRect();
    const origX = pos?.x ?? rect?.left ?? 0;
    const origY = pos?.y ?? rect?.top ?? 0;
    if (pos === null) setPos({ x: origX, y: origY });
    dragState.current = { startX: e.clientX, startY: e.clientY, origX, origY };
    setDragging(true);
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
  }
  function onPointerMove(e: React.PointerEvent) {
    if (!dragState.current) return;
    const dx = e.clientX - dragState.current.startX;
    const dy = e.clientY - dragState.current.startY;
    const maxX = window.innerWidth - 60;
    const maxY = window.innerHeight - 40;
    setPos({
      x: Math.min(Math.max(0, dragState.current.origX + dx), maxX),
      y: Math.min(Math.max(0, dragState.current.origY + dy), maxY),
    });
  }
  function onPointerUp() {
    dragState.current = null;
    setDragging(false);
  }

  const style: CSSProperties =
    draggable && pos !== null
      ? { left: pos.x, top: pos.y }
      : anchor === "right"
        ? { right: defaultPosition.x, top: defaultPosition.y }
        : { left: defaultPosition.x, top: defaultPosition.y };

  return (
    <div
      ref={panelRef}
      className={`absolute z-20 glass-panel rounded-xl border border-base-700 shadow-panel animate-slide-up ${className}`}
      style={{ ...style, width, userSelect: dragging ? "none" : undefined }}
    >
      <div
        className={`flex items-center justify-between gap-2 px-3.5 py-2.5 rounded-t-xl border-b border-base-700/80 ${
          draggable ? "cursor-grab active:cursor-grabbing" : ""
        }`}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
      >
        <div className="flex items-center gap-2 min-w-0">
          {icon && (
            <span className="shrink-0" style={{ color: headerAccent }}>
              {icon}
            </span>
          )}
          <span className="text-[11px] font-semibold tracking-[0.08em] uppercase text-ink-100 truncate">
            {title}
          </span>
        </div>
        {onClose && (
          <button
            onPointerDown={(e) => e.stopPropagation()}
            onClick={onClose}
            aria-label="Close"
            className="text-ink-500 hover:text-ink-100 transition-colors text-sm leading-none px-1.5 py-0.5 rounded hover:bg-base-800"
          >
            ✕
          </button>
        )}
        {!onClose && onToggleCollapse && (
          <button
            onClick={onToggleCollapse}
            aria-label={collapsed ? "Expand panel" : "Collapse panel"}
            aria-expanded={!collapsed}
            className="shrink-0 text-ink-300 hover:text-ink-100 transition-colors p-1 rounded hover:bg-base-800"
          >
            <svg
              viewBox="0 0 24 24"
              aria-hidden="true"
              className={`h-4 w-4 transition-transform ${collapsed ? "-rotate-90" : ""}`}
              fill="none"
              stroke="currentColor"
              strokeWidth="3"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="m6 9 6 6 6-6" />
            </svg>
          </button>
        )}
      </div>
      {!collapsed && <div className="max-h-[70vh] overflow-y-auto no-scrollbar">{children}</div>}
    </div>
  );
}
