"use client";

import { Puck } from "@puckeditor/core";
import { Pencil } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import type { EmailData } from "@/email/config";
import type { EmailNode } from "./editor-data";

type RowPosition = {
  top: number;
  left: number;
  width: number;
  pencilLeft: number;
};

function layerNames(data: EmailData) {
  const names = new Map<string, string>();
  const visit = (nodes: EmailData["content"]) => {
    for (const node of nodes) {
      const props = node.props as Record<string, unknown>;
      const name = props.editorLabel;
      if (typeof name === "string" && name.trim())
        names.set(String(props.id), name);
      for (const value of Object.values(props)) {
        if (
          Array.isArray(value) &&
          value.every(
            (item) =>
              item &&
              typeof item === "object" &&
              "type" in item &&
              "props" in item,
          )
        ) {
          visit(value as EmailData["content"]);
        }
      }
    }
  };
  visit(data.content);
  return names;
}

export function LayersPanel({
  data,
  selected,
  onRename,
}: {
  data: EmailData;
  selected: EmailNode | null;
  onRename: (id: string, name: string) => void;
}) {
  const rootRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const cancelRef = useRef(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [draft, setDraft] = useState("");
  const [position, setPosition] = useState<RowPosition | null>(null);
  const names = useMemo(() => layerNames(data), [data]);
  const selectedId = selected ? String(selected.props.id) : null;
  const activeId = editingId ?? selectedId;

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;

    const sync = () => {
      let activeRow: HTMLElement | null = null;
      for (const row of root.querySelectorAll<HTMLElement>(
        "[data-puck-layer-tree-id]",
      )) {
        const id = row.dataset.puckLayerTreeId ?? "";
        const name = names.get(id);
        if (name) {
          const text = row.querySelector<HTMLElement>(
            '[class*="_Layer-name_"]',
          );
          if (text && text.textContent !== name) text.textContent = name;
          const button = row.querySelector<HTMLButtonElement>(
            '[class*="_Layer-clickable_"]',
          );
          if (button && button.getAttribute("aria-label") !== name)
            button.setAttribute("aria-label", name);
        }
        if (id === activeId) activeRow = row;
      }

      const label = activeRow?.querySelector<HTMLElement>(
        '[class*="_Layer-name_"]',
      );
      if (!activeRow || !label) {
        setPosition(null);
        return;
      }
      const rowInner = activeRow.querySelector<HTMLElement>(
        '[class*="_Layer-inner_"]',
      );
      if (!rowInner) return;
      const rootRect = root.getBoundingClientRect();
      const rowRect = rowInner.getBoundingClientRect();
      const labelRect = label.getBoundingClientRect();
      const left = labelRect.left - rootRect.left;
      const right = rowRect.right - rootRect.left;
      const next = {
        top: rowRect.top - rootRect.top + (rowRect.height - 28) / 2,
        left,
        width: Math.max(80, right - left - 8),
        pencilLeft: Math.min(labelRect.right - rootRect.left + 5, right - 28),
      };
      setPosition((current) =>
        current &&
        Object.keys(next).every(
          (key) =>
            current[key as keyof RowPosition] ===
            next[key as keyof RowPosition],
        )
          ? current
          : next,
      );
    };

    const observer = new MutationObserver(sync);
    observer.observe(root, {
      childList: true,
      subtree: true,
      characterData: true,
    });
    const resizeObserver = new ResizeObserver(sync);
    resizeObserver.observe(root);
    const scrollParent = root.parentElement;
    scrollParent?.addEventListener("scroll", sync, { passive: true });
    window.addEventListener("resize", sync);
    sync();
    return () => {
      observer.disconnect();
      resizeObserver.disconnect();
      scrollParent?.removeEventListener("scroll", sync);
      window.removeEventListener("resize", sync);
    };
  }, [activeId, names]);

  useEffect(() => {
    if (editingId) {
      inputRef.current?.focus();
      inputRef.current?.select();
    }
  }, [editingId]);

  function beginEdit(id: string) {
    const root = rootRef.current;
    const row = [
      ...(root?.querySelectorAll<HTMLElement>("[data-puck-layer-tree-id]") ??
        []),
    ].find((item) => item.dataset.puckLayerTreeId === id);
    const label = row?.querySelector<HTMLElement>('[class*="_Layer-name_"]');
    setDraft(names.get(id) ?? label?.textContent ?? "Layer");
    cancelRef.current = false;
    setEditingId(id);
  }

  function finishEdit() {
    if (editingId && !cancelRef.current && draft.trim())
      onRename(editingId, draft.trim());
    cancelRef.current = false;
    setEditingId(null);
  }

  return (
    <div
      ref={rootRef}
      className="layers-panel relative"
      onDoubleClick={(event) => {
        const target = event.target as HTMLElement;
        if (!target.closest('[class*="_Layer-name_"]')) return;
        const row = target.closest<HTMLElement>("[data-puck-layer-tree-id]");
        if (row?.dataset.puckLayerTreeId)
          beginEdit(row.dataset.puckLayerTreeId);
      }}
    >
      <Puck.Outline />
      {position &&
        activeId &&
        (editingId ? (
          <input
            ref={inputRef}
            aria-label="Rename layer"
            value={draft}
            maxLength={60}
            onChange={(event) => setDraft(event.target.value)}
            onBlur={finishEdit}
            onKeyDown={(event) => {
              if (event.key === "Enter") event.currentTarget.blur();
              if (event.key === "Escape") {
                cancelRef.current = true;
                event.currentTarget.blur();
              }
            }}
            style={{
              top: position.top,
              left: position.left,
              width: position.width,
            }}
            className="absolute z-20 h-7 rounded-md border border-brand bg-white px-2 text-xs font-medium text-charcoal-900 outline-none focus-visible:ring-2 focus-visible:ring-brand/25 dark:bg-neutral-900 dark:text-neutral-100"
          />
        ) : (
          <button
            type="button"
            aria-label="Rename selected layer"
            title="Rename layer"
            onClick={() => beginEdit(activeId)}
            style={{ top: position.top, left: position.pencilLeft }}
            className="layers-panel__rename absolute z-10 flex size-7 items-center justify-center rounded-md text-brand-dark/75 hover:bg-brand/10 hover:text-brand-dark focus-visible:outline-2 focus-visible:outline-brand dark:text-brand-light dark:hover:bg-brand/15"
          >
            <Pencil className="size-4" strokeWidth={2} />
          </button>
        ))}
    </div>
  );
}
