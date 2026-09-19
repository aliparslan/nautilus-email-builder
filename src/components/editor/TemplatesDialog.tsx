"use client";

import { useEffect, useState } from "react";
import { templates, type EmailTemplate } from "@/email/templates";
import { api } from "@/lib/client-api";
import { cn } from "@/lib/cn";
import { Dialog, DialogBody } from "../ui/Dialog";

type Props = {
  open: boolean;
  onClose: () => void;
  onSelect: (template: EmailTemplate) => void;
};

// Rendered once per session; templates are static.
const thumbnailCache = new Map<string, string>();

export function TemplatesDialog({ open, onClose, onSelect }: Props) {
  const [thumbs, setThumbs] = useState<Record<string, string>>(() =>
    Object.fromEntries(thumbnailCache),
  );

  useEffect(() => {
    if (!open) return;
    for (const t of templates) {
      if (thumbnailCache.has(t.id)) continue;
      api
        .render(t.data)
        .then(({ html }) => {
          thumbnailCache.set(t.id, html);
          setThumbs((prev) => ({ ...prev, [t.id]: html }));
        })
        .catch(() => {});
    }
  }, [open]);

  return (
    <Dialog
      open={open}
      onClose={onClose}
      size="lg"
      eyebrow="Templates"
      title="Start from a template"
      description="Replaces the current email. Undo (⌘Z) brings it back."
    >
      <DialogBody>
        <ul className="grid grid-cols-2 gap-4 p-6 sm:grid-cols-4">
          {templates.map((t) => (
            <li key={t.id}>
              <button
                type="button"
                onClick={() => onSelect(t)}
                className={cn(
                  "group flex w-full flex-col overflow-hidden rounded-xl border border-divide bg-white text-left transition outline-none",
                  "hover:border-brand/50 hover:shadow-card focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand active:scale-[0.99]",
                  "dark:border-neutral-800 dark:bg-neutral-900",
                )}
              >
                <div className="relative aspect-[3/4] w-full overflow-hidden bg-gray-200 dark:bg-neutral-800">
                  {thumbs[t.id] ? (
                    <Thumbnail html={thumbs[t.id]} />
                  ) : (
                    <div className="absolute inset-0 animate-pulse bg-gray-300 dark:bg-neutral-800" />
                  )}
                </div>
                <div className="border-t border-divide p-3 dark:border-neutral-800">
                  <p className="text-sm font-semibold text-charcoal-900 dark:text-neutral-100">
                    {t.name}
                  </p>
                  <p className="mt-0.5 text-xs leading-snug text-gray-600 dark:text-neutral-400">
                    {t.description}
                  </p>
                </div>
              </button>
            </li>
          ))}
        </ul>
      </DialogBody>
    </Dialog>
  );
}

/** A 640px-wide render squeezed into the card; pointer-events off so the card stays a single button. */
function Thumbnail({ html }: { html: string }) {
  return (
    <iframe
      title="Template preview"
      srcDoc={html}
      sandbox=""
      tabIndex={-1}
      aria-hidden
      className="pointer-events-none absolute top-0 left-0 origin-top-left"
      style={{
        width: 640,
        height: 1600,
        transform: "scale(var(--thumb-scale, 0.3))",
      }}
      ref={(el) => {
        if (!el?.parentElement) return;
        el.style.setProperty(
          "--thumb-scale",
          String(el.parentElement.clientWidth / 640),
        );
      }}
    />
  );
}
