"use client";

import { Monitor, Smartphone } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/cn";

type Device = "desktop" | "mobile";
const WIDTH: Record<Device, number> = { desktop: 680, mobile: 390 };

type Props = {
  html: string | null;
  loading?: boolean;
  error?: string | null;
  from?: string;
  to?: string[];
  subject: string;
  previewText: string;
};

/** Inbox context and rendered body share one scroll area; the iframe never owns scrolling. */
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
  const [frameHeight, setFrameHeight] = useState(420);
  const observerRef = useRef<ResizeObserver | null>(null);
  const toLine = to?.join(", ") || "No recipients selected";

  useEffect(() => () => observerRef.current?.disconnect(), []);

  function sizeFrame(frame: HTMLIFrameElement) {
    observerRef.current?.disconnect();
    const doc = frame.contentDocument;
    if (!doc) return;
    doc.documentElement.style.overflow = "hidden";
    doc.body.style.overflow = "hidden";
    const measure = () => {
      setFrameHeight(
        Math.max(320, doc.documentElement.scrollHeight, doc.body.scrollHeight),
      );
    };
    measure();
    observerRef.current = new ResizeObserver(measure);
    observerRef.current.observe(doc.documentElement);
  }

  return (
    <div className="flex h-full min-h-0 flex-col bg-gray-100 dark:bg-neutral-950">
      <div className="flex h-12 shrink-0 items-center justify-between px-4">
        <span className="text-xs font-semibold text-gray-600 dark:text-neutral-400">
          Message preview
        </span>
        <div
          role="group"
          aria-label="Preview width"
          className="flex rounded-lg border border-divide bg-white p-0.5 dark:border-neutral-700 dark:bg-neutral-900"
        >
          {(["desktop", "mobile"] as const).map((option) => (
            <button
              key={option}
              type="button"
              aria-pressed={device === option}
              onClick={() => setDevice(option)}
              className={cn(
                "inline-flex h-7 items-center gap-1.5 rounded-md px-2.5 text-xs font-semibold transition-colors focus-visible:outline-2 focus-visible:outline-brand",
                device === option
                  ? "bg-brand text-white"
                  : "text-gray-600 hover:text-charcoal-900 dark:text-neutral-400 dark:hover:text-neutral-100",
              )}
            >
              {option === "desktop" ? (
                <Monitor className="size-3.5" strokeWidth={1.8} />
              ) : (
                <Smartphone className="size-3.5" strokeWidth={1.8} />
              )}
              {option === "desktop" ? "Desktop" : "Mobile"}
            </button>
          ))}
        </div>
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto px-4 pb-6">
        <div
          className="mx-auto overflow-hidden rounded-xl border border-divide bg-white shadow-card transition-[width] duration-200 dark:border-neutral-800"
          style={{ width: WIDTH[device], maxWidth: "100%" }}
        >
          <div className="space-y-3 border-b border-divide px-5 py-4 dark:border-neutral-800">
            <div>
              <p
                className="truncate text-[15px] font-semibold text-charcoal-900"
                title={subject || "Untitled email"}
              >
                {subject || "Untitled email"}
              </p>
              <p
                className="mt-0.5 truncate text-xs text-gray-600"
                title={previewText || undefined}
              >
                {previewText || "No preview text"}
              </p>
            </div>
            {(from || to) && (
              <dl className="grid grid-cols-[42px_minmax(0,1fr)] items-start gap-x-2 gap-y-2 text-xs">
                {from && (
                  <>
                    <dt className="text-gray-600">From</dt>
                    <dd
                      className="min-w-0 truncate text-charcoal-800"
                      title={from}
                    >
                      {from}
                    </dd>
                  </>
                )}
                {to && (
                  <>
                    <dt className="text-gray-600">To</dt>
                    <dd
                      className="min-w-0 truncate text-charcoal-800"
                      title={toLine}
                    >
                      {toLine}
                    </dd>
                  </>
                )}
              </dl>
            )}
          </div>

          <div className="relative min-h-80 bg-white">
            {html ? (
              <iframe
                title="Rendered email body"
                srcDoc={html}
                sandbox="allow-same-origin"
                onLoad={(event) => sizeFrame(event.currentTarget)}
                style={{ height: frameHeight }}
                className="block w-full border-0 bg-white"
              />
            ) : (
              <div className="flex min-h-80 items-center justify-center px-6 text-sm text-gray-600">
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
              <div
                className="absolute inset-0 bg-white/50"
                aria-hidden="true"
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
