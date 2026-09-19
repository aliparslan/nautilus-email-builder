"use client";

import { useEffect } from "react";

export type ShortcutId =
  | "review"
  | "templates"
  | "scheduled"
  | "shortcuts"
  | "save"
  | "toggleViewport"
  | "toggleTheme"
  | "toggleLeftSidebar"
  | "toggleRightSidebar";

export type Shortcut = {
  id: ShortcutId;
  keys: string[];
  label: string;
};

const IS_MAC =
  typeof navigator !== "undefined" &&
  /Mac|iPhone|iPad/.test(navigator.platform);
export const MOD = IS_MAC ? "⌘" : "Ctrl";

export const SHORTCUTS: Shortcut[] = [
  { id: "review", keys: [MOD, "⏎"], label: "Review & send" },
  { id: "save", keys: [MOD, "S"], label: "Save draft now" },
  { id: "templates", keys: [MOD, "⇧", "T"], label: "Templates" },
  { id: "scheduled", keys: [MOD, "⇧", "S"], label: "Scheduled emails" },
  {
    id: "toggleViewport",
    keys: [MOD, "⇧", "M"],
    label: "Toggle mobile / desktop canvas",
  },
  {
    id: "toggleTheme",
    keys: [MOD, "⇧", "L"],
    label: "Toggle light / dark mode",
  },
  {
    id: "toggleLeftSidebar",
    keys: [MOD, "⇧", "["],
    label: "Toggle blocks sidebar",
  },
  {
    id: "toggleRightSidebar",
    keys: [MOD, "⇧", "]"],
    label: "Toggle properties sidebar",
  },
  { id: "shortcuts", keys: ["?"], label: "Show shortcuts" },
];

/** Shortcuts handled by Puck itself; listed in the help dialog for completeness. */
export const PUCK_SHORTCUTS: Array<{ keys: string[]; label: string }> = [
  { keys: [MOD, "Z"], label: "Undo" },
  { keys: [MOD, "⇧", "Z"], label: "Redo" },
  { keys: ["⌫"], label: "Delete selected block" },
  {
    keys: [MOD, "I"],
    label: "Toggle interactive preview (hides editing overlays)",
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
  const wantsShift = shortcut.keys.includes("⇧");
  const key = shortcut.keys[shortcut.keys.length - 1];

  if (key === "?") return e.key === "?" && !e.metaKey && !e.ctrlKey;
  if (wantsMod !== (IS_MAC ? e.metaKey : e.ctrlKey)) return false;
  if (wantsShift !== e.shiftKey) return false;
  if (key === "⏎") return e.key === "Enter";
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
        const handler = handlers[shortcut.id];
        if (!handler) return;
        e.preventDefault();
        handler();
        return;
      }
    };
    // Capture phase so Puck's listeners can't swallow app-level combos. Keydowns inside the
    // canvas iframe never reach the parent document, so listen there as well.
    const targets = new Set<Document>([document]);
    let frame: HTMLIFrameElement | null = null;
    const attachFrame = () => {
      frame ??= document.getElementById(
        "preview-frame",
      ) as HTMLIFrameElement | null;
      const doc = frame?.contentDocument;
      if (doc && !targets.has(doc)) {
        targets.add(doc);
        doc.addEventListener("keydown", onKeyDown, true);
        frame?.addEventListener("load", attachFrame);
      }
      return !!doc;
    };
    document.addEventListener("keydown", onKeyDown, true);
    // The iframe mounts after the header; poll briefly until it exists.
    const poll = setInterval(() => attachFrame() && clearInterval(poll), 250);
    return () => {
      clearInterval(poll);
      targets.forEach((doc) =>
        doc.removeEventListener("keydown", onKeyDown, true),
      );
      frame?.removeEventListener("load", attachFrame);
    };
  }, [handlers, enabled]);
}
