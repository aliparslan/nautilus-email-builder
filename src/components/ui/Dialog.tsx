"use client";

import { X } from "lucide-react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { type ReactNode, useEffect, useId, useRef } from "react";
import { createPortal } from "react-dom";
import { cn } from "@/lib/cn";
import { IconButton } from "./IconButton";

export type DialogProps = {
  open: boolean;
  onClose: () => void;
  title: string;
  description?: string;
  /** Uppercase eyebrow above the title, Nautilus-style. */
  eyebrow?: string;
  size?: "md" | "lg" | "xl";
  children: ReactNode;
};

const SIZE = { md: "max-w-lg", lg: "max-w-3xl", xl: "max-w-6xl" };

export function Dialog({
  open,
  onClose,
  title,
  description,
  eyebrow,
  size = "md",
  children,
}: DialogProps) {
  const reduceMotion = useReducedMotion();
  const titleId = useId();
  const panelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const previouslyFocused = document.activeElement as HTMLElement | null;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.stopPropagation();
        onClose();
      }
    };
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    panelRef.current?.focus();
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
      previouslyFocused?.focus?.();
    };
  }, [open, onClose]);

  return createPortal(
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center bg-brand-dark/40 p-4 backdrop-blur-[2px] sm:p-8"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: reduceMotion ? 0 : 0.15 }}
          onMouseDown={(e) => e.target === e.currentTarget && onClose()}
        >
          <motion.div
            ref={panelRef}
            role="dialog"
            aria-modal="true"
            aria-labelledby={titleId}
            tabIndex={-1}
            className={cn(
              "flex max-h-full w-full flex-col overflow-hidden rounded-2xl bg-white shadow-modal outline-none dark:bg-neutral-900 dark:shadow-none dark:ring-1 dark:ring-neutral-800",
              SIZE[size],
            )}
            initial={reduceMotion ? false : { opacity: 0, y: 12, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={
              reduceMotion ? { opacity: 0 } : { opacity: 0, y: 8, scale: 0.98 }
            }
            transition={{ type: "spring", duration: 0.35, bounce: 0.1 }}
          >
            <header className="flex items-start gap-4 border-b border-divide px-6 py-5 dark:border-neutral-800">
              <div className="min-w-0 flex-1">
                {eyebrow && (
                  <p className="mb-1 font-mono text-[11px] font-medium tracking-wider text-brand uppercase">
                    {eyebrow}
                  </p>
                )}
                <h2
                  id={titleId}
                  className="font-heading text-xl tracking-tight text-charcoal-900 dark:text-neutral-50"
                >
                  {title}
                </h2>
                {description && (
                  <p className="mt-1 text-sm text-gray-600 dark:text-neutral-400">
                    {description}
                  </p>
                )}
              </div>
              <IconButton label="Close" onClick={onClose}>
                <X className="size-4" />
              </IconButton>
            </header>
            {children}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>,
    document.body,
  );
}

/** Scrollable body; pair with DialogFooter inside a Dialog. */
export function DialogBody({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("min-h-0 flex-1 overflow-auto", className)}>
      {children}
    </div>
  );
}

export function DialogFooter({ children }: { children: ReactNode }) {
  return (
    <footer className="flex items-center justify-end gap-2 border-t border-divide px-6 py-4 dark:border-neutral-800">
      {children}
    </footer>
  );
}
