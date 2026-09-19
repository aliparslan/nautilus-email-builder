"use client";

import type { ButtonHTMLAttributes } from "react";
import { cn } from "@/lib/cn";

export type IconButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  label: string;
  active?: boolean;
};

/** Square icon control; `label` doubles as the accessible name and the tooltip. */
export function IconButton({
  label,
  active,
  className,
  children,
  ...rest
}: IconButtonProps) {
  return (
    <button
      type="button"
      aria-label={label}
      title={label}
      aria-pressed={active}
      className={cn(
        "inline-flex size-8 items-center justify-center rounded-lg text-gray-600 transition duration-150 outline-none",
        "hover:bg-gray-200 hover:text-charcoal-900 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand active:scale-[0.96]",
        "disabled:pointer-events-none disabled:opacity-40",
        "dark:text-neutral-400 dark:hover:bg-neutral-800 dark:hover:text-neutral-100",
        active &&
          "bg-gray-200 text-charcoal-900 dark:bg-neutral-800 dark:text-neutral-100",
        className,
      )}
      {...rest}
    >
      {children}
    </button>
  );
}
