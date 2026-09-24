"use client";

import { useEffect } from "react";
import { observePreviewFrame } from "./preview-frame";

export type ShortcutId =
  | "review"
  | "recipients"
  | "templates"
  | "scheduled"
  | "shortcuts"
  | "save"
  | "undo"
  | "redo";

export type Shortcut = {
  id: ShortcutId;
  keys: string[];
  label: string;
};

const IS_MAC =
  typeof navigator !== "undefined" &&
  /Mac|iPhone|iPad/.test(navigator.platform);
export const MOD = IS_MAC ? "Cmd" : "Ctrl";

export const SHORTCUTS: Shortcut[] = [
  { id: "undo", keys: [MOD, "Z"], label: "Undo" },
  { id: "redo", keys: [MOD, "Shift", "Z"], label: "Redo" },
  { id: "review", keys: [MOD, "Enter"], label: "Send" },
  { id: "recipients", keys: [MOD, "Shift", "R"], label: "Recipients" },
  { id: "save", keys: [MOD, "S"], label: "Save" },
  { id: "templates", keys: [MOD, "Shift", "T"], label: "Templates" },
  { id: "scheduled", keys: [MOD, "Shift", "S"], label: "Scheduled" },
  { id: "shortcuts", keys: ["?"], label: "Show shortcuts" },
];

/** Shortcuts handled by Puck itself; listed in the help dialog for completeness. */
export const PUCK_SHORTCUTS: Array<{ keys: string[]; label: string }> = [
  { keys: ["Delete"], label: "Delete block" },
  {
    keys: [MOD, "I"],
    label: "Toggle preview",
  },
];

function isEditableTarget(target: EventTarget | null): boolean {
  const el = target as HTMLElement | null;
  if (!el) return false;
  return (
    el.tagName === "INPUT" ||
    el.tagName === "TEXTAREA" ||
    el.tagName === "SELECT" ||
    el.isContentEditable
  );
}

function matches(e: KeyboardEvent, shortcut: Shortcut): boolean {
  const wantsMod = shortcut.keys.includes(MOD);
  const wantsShift = shortcut.keys.includes("Shift");
  const key = shortcut.keys[shortcut.keys.length - 1];

  if (key === "?") return e.key === "?" && !e.metaKey && !e.ctrlKey;
  if (wantsMod !== (IS_MAC ? e.metaKey : e.ctrlKey)) return false;
  if (wantsShift !== e.shiftKey) return false;
  if (key === "Enter") return e.key === "Enter";
  return (
    e.key.toLowerCase() === key.toLowerCase() ||
    e.code === `Key${key.toUpperCase()}` ||
    e.code === `Bracket${key === "[" ? "Left" : "Right"}`
  );
}

export function useShortcuts(
  handlers: Partial<Record<ShortcutId, () => void>>,
  enabled = true,
) {
  useEffect(() => {
    if (!enabled) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.defaultPrevented) return;
      for (const shortcut of SHORTCUTS) {
        if (!matches(e, shortcut)) continue;
        // Bare keys would type into fields; modifier combos are safe anywhere.
        if (!shortcut.keys.includes(MOD) && isEditableTarget(e.target)) return;
        if (
          (shortcut.id === "undo" || shortcut.id === "redo") &&
          isEditableTarget(e.target)
        )
          return;
        const handler = handlers[shortcut.id];
        if (!handler) return;
        e.preventDefault();
        handler();
        return;
      }
    };
    // Capture phase prevents Puck from swallowing app-level combinations.
    // Events inside the canvas iframe never reach the parent document.
    document.addEventListener("keydown", onKeyDown, true);
    const stopObservingFrame = observePreviewFrame((previewDocument) => {
      previewDocument.addEventListener("keydown", onKeyDown, true);
      return () =>
        previewDocument.removeEventListener("keydown", onKeyDown, true);
    });

    return () => {
      document.removeEventListener("keydown", onKeyDown, true);
      stopObservingFrame();
    };
  }, [handlers, enabled]);
}
