"use client";

import { useEffect, useMemo, useState } from "react";
import {
  EMPTY_SELECTION,
  expandRecipients,
  type RecipientGroup,
  type RecipientSelection,
} from "@/lib/recipients";

const GROUPS_KEY = "nautilus-email:groups:v1";
const SELECTION_KEY = "nautilus-email:recipient-selection:v1";
const LEGACY_KEY = "nautilus-email:last-recipients";

function readGroups(): RecipientGroup[] {
  try {
    const value: unknown = JSON.parse(localStorage.getItem(GROUPS_KEY) ?? "[]");
    return Array.isArray(value)
      ? value.filter(
          (group): group is RecipientGroup =>
            typeof group?.id === "string" &&
            typeof group?.name === "string" &&
            Array.isArray(group?.emails) &&
            group.emails.every((email: unknown) => typeof email === "string"),
        )
      : [];
  } catch {
    return [];
  }
}

function readSelection(): RecipientSelection {
  try {
    const stored = localStorage.getItem(SELECTION_KEY);
    if (stored) {
      const value: unknown = JSON.parse(stored);
      if (
        value && typeof value === "object" &&
        "direct" in value && Array.isArray(value.direct) &&
        "groupIds" in value && Array.isArray(value.groupIds)
      ) {
        return {
          direct: value.direct.filter((email: unknown) => typeof email === "string"),
          groupIds: value.groupIds.filter((id: unknown) => typeof id === "string"),
        };
      }
    }
    const legacy: unknown = JSON.parse(localStorage.getItem(LEGACY_KEY) ?? "[]");
    return Array.isArray(legacy)
      ? { direct: legacy.filter((email): email is string => typeof email === "string"), groupIds: [] }
      : EMPTY_SELECTION;
  } catch {
    return EMPTY_SELECTION;
  }
}

export function useRecipients() {
  const [groups, setGroups] = useState<RecipientGroup[]>(readGroups);
  const [selection, setSelection] = useState<RecipientSelection>(readSelection);
  const addresses = useMemo(() => expandRecipients(selection, groups), [selection, groups]);

  useEffect(() => {
    try { localStorage.setItem(GROUPS_KEY, JSON.stringify(groups)); } catch { /* Browser storage full. */ }
  }, [groups]);
  useEffect(() => {
    try { localStorage.setItem(SELECTION_KEY, JSON.stringify(selection)); } catch { /* Browser storage full. */ }
  }, [selection]);

  function saveGroup(group: RecipientGroup) {
    setGroups((current) => {
      const index = current.findIndex((item) => item.id === group.id);
      return index < 0
        ? [...current, group]
        : current.map((item) => item.id === group.id ? group : item);
    });
  }

  function deleteGroup(id: string) {
    setGroups((current) => current.filter((group) => group.id !== id));
    setSelection((current) => ({
      ...current,
      groupIds: current.groupIds.filter((groupId) => groupId !== id),
    }));
  }

  function clearSelection() {
    setSelection({ direct: [], groupIds: [] });
  }

  return { groups, selection, addresses, setSelection, saveGroup, deleteGroup, clearSelection };
}
