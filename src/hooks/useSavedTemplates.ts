"use client";

import { useEffect, useState } from "react";
import type { EmailData } from "@/email/config";
import type { EmailTemplate } from "@/email/templates";

const KEY = "nautilus-email:templates:v1";

type SavedTemplate = EmailTemplate & { updatedAt: string };

function readTemplates(): SavedTemplate[] {
  try {
    const value: unknown = JSON.parse(localStorage.getItem(KEY) ?? "[]");
    if (!Array.isArray(value)) return [];
    return value.filter((item): item is SavedTemplate =>
      Boolean(
        item &&
          typeof item === "object" &&
          typeof item.id === "string" &&
          typeof item.name === "string" &&
          item.data &&
          Array.isArray(item.data.content),
      ),
    );
  } catch {
    return [];
  }
}

export function useSavedTemplates() {
  const [items, setItems] = useState<SavedTemplate[]>(readTemplates);

  useEffect(() => {
    try {
      localStorage.setItem(KEY, JSON.stringify(items));
    } catch {
      // Large inline images can exhaust browser storage.
    }
  }, [items]);

  function add(name: string, data: EmailData) {
    const template: SavedTemplate = {
      id: crypto.randomUUID(),
      name: name.trim() || "Untitled template",
      description: "Saved in this browser",
      data: structuredClone(data),
      updatedAt: new Date().toISOString(),
    };
    setItems((current) => [template, ...current]);
    return template;
  }

  function remove(id: string) {
    setItems((current) => current.filter((item) => item.id !== id));
  }

  return { items, add, remove };
}
