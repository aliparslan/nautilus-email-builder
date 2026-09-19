"use client";

import { Monitor, Smartphone } from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/cn";

export type Device = "desktop" | "mobile";

const WIDTH: Record<Device, number> = { desktop: 640, mobile: 375 };

type Props = {
  html: string | null;
  loading?: boolean;
  error?: string | null;
  from: string;
  to: string[];
  subject: string;
  previewText?: string;
};

/**
 * Shows the exact HTML that will be sent, inside a sandboxed iframe, dressed as an inbox
 * message so the subject and preview text can be judged in context.
 */
export function EmailPreviewFrame({
  html,
  loading,
  error,
  from,
  to,
  subject,
  previewText,
}: Props) {
  const [device, setDevice] = useState<Device>("desktop");

  return (
    <div className="flex h-full min-h-0 flex-col bg-gray-200/70 dark:bg-neutral-950">
      <div className="flex items-center justify-between gap-3 px-4 py-2.5">
        <p className="font-mono text-[11px] font-medium tracking-wider text-gray-600 uppercase dark:text-neutral-500">
          Rendered output · what recipients get
        </p>
        <div
          role="radiogroup"
          aria-label="Preview width"
          className="flex rounded-lg border border-divide bg-white p-0.5 dark:border-neutral-700 dark:bg-neutral-900"
        >
          {(["desktop", "mobile"] as const).map((d) => (
            <button
              key={d}
              type="button"
              role="radio"
              aria-checked={device === d}
              onClick={() => setDevice(d)}
              className={cn(
                "inline-flex h-7 items-center gap-1.5 rounded-md px-2.5 text-xs font-medium transition",
                device === d
                  ? "bg-navy text-white dark:bg-brand dark:text-navy"
                  : "text-gray-600 hover:text-charcoal-900 dark:text-neutral-400 dark:hover:text-neutral-100",
              )}
            >
              {d === "desktop" ? (
                <Monitor className="size-3.5" />
              ) : (
                <Smartphone className="size-3.5" />
              )}
              {d === "desktop" ? "Desktop" : "Mobile"}
            </button>
          ))}
        </div>
      </div>

      <div className="flex min-h-0 flex-1 justify-center overflow-auto px-4 pb-4">
        <div
          className="flex h-full flex-col overflow-hidden rounded-xl border border-divide bg-white shadow-card transition-[width] duration-200 dark:border-neutral-800"
          style={{ width: WIDTH[device], maxWidth: "100%" }}
        >
          <div className="border-b border-divide px-4 py-3 text-[13px] dark:border-neutral-800">
            <div className="flex items-baseline gap-2">
              <span className="w-12 shrink-0 text-gray-500">From</span>
              <span className="truncate font-medium text-charcoal-900 dark:text-neutral-100">
                {from}
              </span>
            </div>
            <div className="mt-1 flex items-baseline gap-2">
              <span className="w-12 shrink-0 text-gray-500">To</span>
              <span className="truncate text-charcoal-800 dark:text-neutral-300">
                {to.length ? (
                  to.join(", ")
                ) : (
                  <em className="text-gray-500">no recipients yet</em>
                )}
              </span>
            </div>
            <div className="mt-2 truncate text-[15px] font-semibold text-charcoal-900 dark:text-neutral-50">
              {subject || (
                <span className="font-normal text-gray-500 italic">
                  No subject
                </span>
              )}
            </div>
            {previewText && (
              <div className="mt-0.5 truncate text-gray-600 dark:text-neutral-400">
                {previewText}
              </div>
            )}
          </div>

          <div className="relative min-h-0 flex-1 bg-white">
            {html ? (
              <iframe
                title="Email preview"
                srcDoc={html}
                sandbox=""
                className="h-full w-full"
              />
            ) : (
              <div className="flex h-full items-center justify-center text-sm text-gray-500">
                {error ? (
                  <span className="text-danger">{error}</span>
                ) : loading ? (
                  "Rendering…"
                ) : (
                  "Nothing to preview"
                )}
              </div>
            )}
            {loading && html && (
              <div className="absolute inset-0 bg-white/50" aria-hidden />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
