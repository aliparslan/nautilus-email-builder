"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { EmailData } from "@/email/config";
import { DEFAULT_ROOT_PROPS } from "@/email/root";

const KEY = "nautilus-email:draft:v1";
const DEBOUNCE_MS = 400;

type Draft = { data: EmailData; savedAt: string };

export function loadDraft(): Draft | null {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return null;
    const draft = JSON.parse(raw) as Draft;
    // Older drafts predate the separate internal project name.
    draft.data.root.props = {
      ...DEFAULT_ROOT_PROPS,
      ...draft.data.root.props,
      projectTitle:
        draft.data.root.props?.projectTitle ||
        draft.data.root.props?.subject ||
        "Untitled email",
    };
    return draft;
  } catch {
    return null;
  }
}

/** Debounced localStorage autosave. `save` queues; `flush` writes immediately (⌘S). */
export function useDraftAutosave() {
  const [savedAt, setSavedAt] = useState<string | null>(
    () => loadDraft()?.savedAt ?? null,
  );
  const pending = useRef<EmailData | null>(null);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const write = useCallback((data: EmailData) => {
    const draft: Draft = { data, savedAt: new Date().toISOString() };
    try {
      localStorage.setItem(KEY, JSON.stringify(draft));
      setSavedAt(draft.savedAt);
    } catch {
      // Quota exceeded (very large inline images). Editing continues; the draft just isn't persisted.
    }
  }, []);

  const flush = useCallback(() => {
    if (timer.current) clearTimeout(timer.current);
    timer.current = null;
    if (pending.current) {
      write(pending.current);
      pending.current = null;
      return true;
    }
    return false;
  }, [write]);

  const save = useCallback(
    (data: EmailData) => {
      pending.current = data;
      if (timer.current) clearTimeout(timer.current);
      timer.current = setTimeout(flush, DEBOUNCE_MS);
    },
    [flush],
  );

  useEffect(() => () => void flush(), [flush]);

  return { save, flush, savedAt };
}
