import type { ReactNode } from "react";
import { cn } from "@/lib/cn";

type Tone = "brand" | "success" | "warning" | "danger" | "neutral";

const TONE: Record<Tone, string> = {
  brand: "bg-brand/10 text-[#0189ab] dark:text-brand",
  success: "bg-success/10 text-[#007956] dark:text-success",
  warning: "bg-warning/10 text-[#b45f00] dark:text-warning",
  danger: "bg-danger/10 text-[#c8103f] dark:text-danger",
  neutral:
    "bg-gray-200 text-gray-600 dark:bg-neutral-800 dark:text-neutral-400",
};

export function Badge({
  tone = "neutral",
  children,
  className,
}: {
  tone?: Tone;
  children: ReactNode;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-md px-1.5 py-0.5 text-[11px] font-semibold tracking-wide uppercase",
        TONE[tone],
        className,
      )}
    >
      {children}
    </span>
  );
}
