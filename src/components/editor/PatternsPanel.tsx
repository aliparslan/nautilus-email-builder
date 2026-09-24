"use client";

import { Drawer, Render } from "@puckeditor/core";
import { Check, Pencil, Save, Trash2, X } from "lucide-react";
import { memo, useCallback, useEffect, useMemo, useRef, useState } from "react";
import { toast } from "sonner";
import { emailConfig, type EmailData } from "@/email/config";
import { DEFAULT_ROOT_PROPS } from "@/email/root";
import { usePatterns, type SavedPattern } from "@/hooks/usePatterns";
import { IconButton } from "../ui/IconButton";
import type { BlockType, EmailNode } from "./editor-data";

const SYSTEM_PATTERNS: Array<{ type: BlockType; label: string }> = [
  { type: "MisterHeader", label: "Mister header" },
  { type: "MisterMembershipHero", label: "Unlimited hero" },
  { type: "MisterProductSpotlight", label: "Product spotlight" },
  { type: "MisterLocationCta", label: "Location callout" },
];

const SYSTEM_PATTERN_NODES = Object.fromEntries(
  SYSTEM_PATTERNS.map(({ type }) => [type, systemNode(type)]),
) as Record<BlockType, EmailNode>;

type Props = {
  selected: EmailNode | null;
  onInsert: (type: BlockType) => void;
  onInsertSaved: (pattern: SavedPattern) => void;
  onDragStart: (pattern: SavedPattern | null) => void;
};

export function PatternsPanel({
  selected,
  onInsert,
  onInsertSaved,
  onDragStart,
}: Props) {
  const patterns = usePatterns();
  const [renaming, setRenaming] = useState<string | null>(null);
  const [name, setName] = useState("");
  const [deleting, setDeleting] = useState<string | null>(null);

  function saveSelected() {
    if (!selected) return;
    const label = emailConfig.components[selected.type].label ?? selected.type;
    const saved = patterns.add(selected, `${label} pattern`);
    toast.success(`${saved.name} saved`);
  }

  return (
    <div className="p-3">
      <button
        type="button"
        disabled={!selected}
        onClick={saveSelected}
        className="mb-4 flex h-9 w-full items-center justify-center gap-2 rounded-lg bg-brand px-3 text-xs font-semibold text-white shadow-[0_1px_2px_rgba(3,49,72,.12)] transition-[background-color,transform] hover:bg-brand/90 active:scale-[0.96] disabled:cursor-not-allowed disabled:opacity-45"
      >
        <Save className="size-3.5" />
        Save selected
      </button>

      {patterns.patterns.length > 0 && (
        <section className="mb-5">
          <h3 className="mb-2 text-[11px] font-semibold tracking-[0.06em] text-gray-600 uppercase dark:text-neutral-400">
            Saved
          </h3>
          <Drawer>
            <div className="space-y-3">
              {patterns.patterns.map((pattern) => (
                <div
                  key={`${pattern.id}-${pattern.updatedAt}`}
                  className="overflow-hidden rounded-xl border border-divide bg-white shadow-[0_1px_2px_rgba(3,49,72,.04)] dark:border-neutral-700 dark:bg-neutral-900"
                >
                  <PatternDrawerItem
                    id={`saved-${pattern.id}`}
                    type={pattern.node.type}
                    label={pattern.name}
                    node={pattern.node}
                    onPointerDown={() => onDragStart(pattern)}
                    onDragEnd={() => onDragStart(null)}
                    onActivate={() => {
                      onDragStart(null);
                      onInsertSaved(pattern);
                    }}
                    className="cursor-grab p-2.5 transition-colors hover:bg-brand/[0.035] focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-brand active:cursor-grabbing"
                  />
                  <div className="flex min-h-10 items-center gap-1 border-t border-divide px-2.5 dark:border-neutral-700">
                    {renaming === pattern.id ? (
                      <>
                        <input
                          autoFocus
                          aria-label="Pattern name"
                          value={name}
                          maxLength={60}
                          onChange={(event) => setName(event.target.value)}
                          onKeyDown={(event) => {
                            if (event.key === "Enter") {
                              patterns.rename(pattern.id, name);
                              setRenaming(null);
                            }
                            if (event.key === "Escape") setRenaming(null);
                          }}
                          className="h-7 min-w-0 flex-1 rounded-md border border-brand bg-white px-2 text-xs outline-none dark:bg-neutral-950"
                        />
                        <IconButton
                          label="Save name"
                          onClick={() => {
                            patterns.rename(pattern.id, name);
                            setRenaming(null);
                          }}
                        >
                          <Check className="size-3.5" />
                        </IconButton>
                        <IconButton
                          label="Cancel rename"
                          onClick={() => setRenaming(null)}
                        >
                          <X className="size-3.5" />
                        </IconButton>
                      </>
                    ) : deleting === pattern.id ? (
                      <>
                        <span className="min-w-0 flex-1 text-xs font-medium text-danger">
                          Delete pattern?
                        </span>
                        <button
                          type="button"
                          onClick={() => setDeleting(null)}
                          className="h-7 rounded-md px-2 text-xs hover:bg-gray-200 dark:hover:bg-neutral-800"
                        >
                          Cancel
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            patterns.remove(pattern.id);
                            setDeleting(null);
                            toast.success("Pattern deleted");
                          }}
                          className="h-7 rounded-md px-2 text-xs font-semibold text-danger hover:bg-danger/10"
                        >
                          Delete
                        </button>
                      </>
                    ) : (
                      <>
                        <p className="min-w-0 flex-1 truncate text-xs font-semibold text-charcoal-800 dark:text-neutral-100">
                          {pattern.name}
                        </p>
                        <IconButton
                          label={`Rename ${pattern.name}`}
                          onClick={() => {
                            setName(pattern.name);
                            setRenaming(pattern.id);
                          }}
                        >
                          <Pencil className="size-3.5" />
                        </IconButton>
                        <IconButton
                          label="Update pattern"
                          disabled={!selected}
                          onClick={() => {
                            if (!selected) return;
                            patterns.update(pattern.id, selected);
                            toast.success(`${pattern.name} updated`);
                          }}
                        >
                          <Save className="size-3.5" />
                        </IconButton>
                        <IconButton
                          label={`Delete ${pattern.name}`}
                          onClick={() => setDeleting(pattern.id)}
                        >
                          <Trash2 className="size-3.5" />
                        </IconButton>
                      </>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </Drawer>
        </section>
      )}

      <section>
        <h3 className="mb-2 text-[11px] font-semibold tracking-[0.06em] text-gray-600 uppercase dark:text-neutral-400">
          Mister Car Wash
        </h3>
        <Drawer>
          <div className="space-y-3">
            {SYSTEM_PATTERNS.map(({ type, label }) => {
              const node = SYSTEM_PATTERN_NODES[type];
              return (
                <PatternDrawerItem
                  key={type}
                  id={`system-${type}`}
                  type={type}
                  label={label}
                  node={node}
                  onActivate={() => onInsert(type)}
                  showLabel
                  className="cursor-grab rounded-xl border border-divide bg-white p-2.5 shadow-[0_1px_2px_rgba(3,49,72,.04)] transition-colors hover:border-brand/55 focus-visible:outline-2 focus-visible:outline-brand active:cursor-grabbing dark:border-neutral-700 dark:bg-neutral-900"
                />
              );
            })}
          </div>
        </Drawer>
      </section>
    </div>
  );
}

/**
 * Puck treats Drawer.Item's render callback as a component type. An inline
 * callback changes identity whenever the editor document updates, which
 * remounts every preview and makes this panel flash. Keep one stable
 * callback while reading the latest pattern and handlers through a ref.
 */
function PatternDrawerItem({
  id,
  type,
  label,
  node,
  onActivate,
  onPointerDown,
  onDragEnd,
  showLabel = false,
  className,
}: {
  id: string;
  type: BlockType;
  label: string;
  node: EmailNode;
  onActivate: () => void;
  onPointerDown?: () => void;
  onDragEnd?: () => void;
  showLabel?: boolean;
  className: string;
}) {
  const latest = useRef({ label, node, onActivate, onPointerDown, onDragEnd });
  useEffect(() => {
    latest.current = { label, node, onActivate, onPointerDown, onDragEnd };
  }, [label, node, onActivate, onPointerDown, onDragEnd]);
  const renderTile = useCallback(() => {
    const current = latest.current;
    return (
      <div
        role="button"
        tabIndex={0}
        aria-label={`Add ${current.label}; drag to place`}
        onPointerDown={() => current.onPointerDown?.()}
        onDragEnd={() => current.onDragEnd?.()}
        onPointerCancel={() => current.onDragEnd?.()}
        onClick={current.onActivate}
        onKeyDown={(event) => {
          if (event.key === "Enter" || event.key === " ") {
            event.preventDefault();
            current.onActivate();
          }
        }}
        className={className}
      >
        <PatternPreview node={current.node} />
        {showLabel && (
          <p className="mt-2 text-xs font-semibold text-charcoal-800 dark:text-neutral-100">
            {current.label}
          </p>
        )}
      </div>
    );
  }, [className, showLabel]);

  return (
    <Drawer.Item id={id} name={type} label={label}>
      {renderTile}
    </Drawer.Item>
  );
}

function systemNode(type: BlockType): EmailNode {
  return {
    type,
    props: {
      ...(emailConfig.components[type].defaultProps ?? {}),
      id: `pattern-preview-${type}`,
    },
  } as EmailNode;
}

const PatternPreview = memo(function PatternPreview({
  node,
}: {
  node: EmailNode;
}) {
  const data = useMemo<EmailData>(
    () => ({
      root: {
        props: {
          ...DEFAULT_ROOT_PROPS,
          projectTitle: "Pattern preview",
          subject: "Pattern preview",
          backgroundColor: "#edf5f8",
          contentWidth: 600,
        },
      },
      content: [structuredClone(node)],
    }),
    [node],
  );
  return (
    <div className="relative h-28 overflow-hidden rounded-lg bg-[#edf5f8] outline outline-black/10 dark:outline-white/10">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute left-0 top-0 h-[312px] w-[600px] origin-top-left bg-white"
        style={{ transform: "scale(0.39)" }}
      >
        <div className="h-full overflow-hidden">
          <Render config={emailConfig} data={data} />
        </div>
      </div>
    </div>
  );
});
