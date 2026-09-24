"use client";

import { useEffect, useState, type FocusEvent, type MouseEvent } from "react";
import { createPortal } from "react-dom";

/** A viewport-positioned tooltip; portals keep it clear of clipped editor panels. */
export function useTooltip(label: string, side: "top" | "right" = "top") {
  const [position, setPosition] = useState<{ x: number; y: number; side: "top" | "right" | "bottom" } | null>(null);

  useEffect(() => {
    if (!position) return;
    const hide = () => setPosition(null);
    document.addEventListener("pointerdown", hide, true);
    window.addEventListener("scroll", hide, true);
    return () => {
      document.removeEventListener("pointerdown", hide, true);
      window.removeEventListener("scroll", hide, true);
    };
  }, [position]);

  function show(element: HTMLElement) {
    const rect = element.getBoundingClientRect();
    const placeRight = side === "right" && rect.right + 180 < window.innerWidth;
    const x = Math.min(Math.max(rect.left + rect.width / 2, 104), window.innerWidth - 104);
    setPosition(placeRight
      ? { x: rect.right + 8, y: rect.top + rect.height / 2, side: "right" }
      : rect.top < 38
        ? { x, y: rect.bottom + 8, side: "bottom" }
        : { x, y: rect.top - 8, side: "top" });
  }

  const trigger = {
    onMouseEnter: (event: MouseEvent<HTMLElement>) => show(event.currentTarget),
    onMouseLeave: () => setPosition(null),
    onFocus: (event: FocusEvent<HTMLElement>) => show(event.currentTarget),
    onBlur: () => setPosition(null),
    onPointerDown: () => setPosition(null),
  };

  const tooltip = position && createPortal(
    <span
      role="tooltip"
      className="pointer-events-none fixed z-[60] max-w-48 rounded-md bg-charcoal-900 px-2 py-1 text-[11px] font-medium text-white shadow-float dark:bg-neutral-100 dark:text-neutral-900"
      style={{
        left: position.x,
        top: position.y,
        transform: position.side === "right" ? "translateY(-50%)" : position.side === "bottom" ? "translateX(-50%)" : "translate(-50%, -100%)",
      }}
    >
      {label}
    </span>,
    document.body,
  );

  return { trigger, tooltip };
}
