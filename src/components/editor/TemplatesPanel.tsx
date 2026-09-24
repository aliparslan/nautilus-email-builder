"use client";

import { Save, Trash2 } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import type { EmailData } from "@/email/config";
import { templates, type EmailTemplate } from "@/email/templates";
import { useSavedTemplates } from "@/hooks/useSavedTemplates";
import { api } from "@/lib/client-api";
import { EmailSnapshotDialog } from "./EmailSnapshotDialog";

const cache = new Map<string, string>();

export function TemplatesPanel({
  data,
  onSelect,
}: {
  data: EmailData;
  onSelect: (template: EmailTemplate) => void;
}) {
  const saved = useSavedTemplates();
  const [preview, setPreview] = useState<EmailTemplate | null>(null);
  const [saving, setSaving] = useState(false);
  const [name, setName] = useState("");
  const [thumbnails, setThumbnails] = useState<Record<string, string>>(() =>
    Object.fromEntries(cache),
  );
  const allTemplates = useMemo(
    () => [...saved.items, ...templates],
    [saved.items],
  );

  useEffect(() => {
    for (const template of allTemplates) {
      if (cache.has(template.id)) continue;
      api
        .render(template.data)
        .then(({ html }) => {
          cache.set(template.id, html);
          setThumbnails((current) => ({ ...current, [template.id]: html }));
        })
        .catch(() => {});
    }
  }, [allTemplates]);

  function save() {
    const next = saved.add(name, data);
    setSaving(false);
    setName("");
    toast.success(`${next.name} saved as a template`);
  }

  return (
    <>
      <div className="space-y-3 p-3">
        {saving ? (
          <div className="flex gap-1.5">
            <input
              autoFocus
              aria-label="Template name"
              value={name}
              maxLength={60}
              onChange={(event) => setName(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === "Enter") save();
                if (event.key === "Escape") setSaving(false);
              }}
              className="h-9 min-w-0 flex-1 rounded-lg border border-divide bg-white px-2 text-xs outline-none focus-visible:border-brand dark:border-neutral-700 dark:bg-neutral-900"
            />
            <button
              type="button"
              onClick={save}
              className="rounded-lg bg-brand px-2 text-xs font-semibold text-white"
            >
              Save
            </button>
          </div>
        ) : (
          <button
            type="button"
            onClick={() => {
              setName(data.root.props?.projectTitle || "Untitled template");
              setSaving(true);
            }}
            className="flex h-9 w-full items-center justify-center gap-2 rounded-lg bg-brand text-xs font-semibold text-white hover:bg-brand/90"
          >
            <Save className="size-3.5" />
            Save current email
          </button>
        )}
        {allTemplates.map((template) => (
          <div
            key={template.id}
            className="overflow-hidden rounded-lg border border-divide bg-white hover:border-brand/60 dark:border-neutral-800 dark:bg-neutral-900"
          >
            <button
              type="button"
              onClick={() => setPreview(template)}
              className="group block w-full text-left focus-visible:outline-2 focus-visible:outline-brand"
            >
              <span className="relative block aspect-[16/9] overflow-hidden bg-gray-200 dark:bg-neutral-800">
                {thumbnails[template.id] ? (
                  <iframe
                    title={`${template.name} thumbnail`}
                    srcDoc={thumbnails[template.id]}
                    sandbox=""
                    tabIndex={-1}
                    aria-hidden="true"
                    className="pointer-events-none absolute left-0 top-0 h-[1600px] w-[640px] origin-top-left scale-[0.4]"
                  />
                ) : (
                  <span className="absolute inset-4 rounded bg-white/60 dark:bg-neutral-700" />
                )}
              </span>
              <span className="block truncate border-t border-divide px-2 py-2 text-xs font-semibold dark:border-neutral-800">
                {template.name}
              </span>
            </button>
            {saved.items.some((item) => item.id === template.id) && (
              <button
                type="button"
                onClick={() => {
                  saved.remove(template.id);
                  cache.delete(template.id);
                  toast.success(`${template.name} deleted`);
                }}
                className="flex w-full items-center justify-center gap-1 border-t border-divide py-1.5 text-[11px] text-danger hover:bg-danger/5 dark:border-neutral-800"
              >
                <Trash2 className="size-3" /> Delete template
              </button>
            )}
          </div>
        ))}
      </div>
      {preview && (
        <EmailSnapshotDialog
          title={preview.name}
          data={preview.data}
          action="Use template"
          onAction={() => {
            onSelect(preview);
            setPreview(null);
          }}
          onClose={() => setPreview(null)}
        />
      )}
    </>
  );
}
