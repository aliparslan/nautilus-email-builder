"use client";

import { useEffect, useState } from "react";
import { emailConfig } from "@/email/config";
import type { EmailNode } from "@/components/editor/editor-data";

const KEY = "nautilus-email:patterns:v1";

export type SavedPattern = {
  id: string;
  name: string;
  node: EmailNode;
  createdAt: string;
  updatedAt: string;
};

function readPatterns(): SavedPattern[] {
  try {
    const value: unknown = JSON.parse(localStorage.getItem(KEY) ?? "[]");
    if (!Array.isArray(value)) return [];
    return value.filter((item): item is SavedPattern => {
      if (!item || typeof item !== "object") return false;
      const pattern = item as Partial<SavedPattern>;
      return Boolean(
        typeof pattern.id === "string" &&
          typeof pattern.name === "string" &&
          typeof pattern.createdAt === "string" &&
          typeof pattern.updatedAt === "string" &&
          pattern.node &&
          typeof pattern.node.type === "string" &&
          pattern.node.type in emailConfig.components &&
          pattern.node.props &&
          typeof pattern.node.props === "object",
      );
    });
  } catch {
    return [];
  }
}

export function usePatterns() {
  const [patterns, setPatterns] = useState<SavedPattern[]>(readPatterns);

  useEffect(() => {
    try {
      localStorage.setItem(KEY, JSON.stringify(patterns));
    } catch {
      // Large inline images can exhaust local storage; editing stays available.
    }
  }, [patterns]);

  function add(node: EmailNode, name: string) {
    const now = new Date().toISOString();
    const pattern: SavedPattern = {
      id: crypto.randomUUID(),
      name: name.trim() || "Untitled pattern",
      node: structuredClone(node),
      createdAt: now,
      updatedAt: now,
    };
    setPatterns((current) => [pattern, ...current]);
    return pattern;
  }

  function rename(id: string, name: string) {
    const trimmed = name.trim();
    if (!trimmed) return;
    setPatterns((current) =>
      current.map((pattern) =>
        pattern.id === id
          ? { ...pattern, name: trimmed, updatedAt: new Date().toISOString() }
          : pattern,
      ),
    );
  }

  function update(id: string, node: EmailNode) {
    setPatterns((current) =>
      current.map((pattern) =>
        pattern.id === id
          ? {
              ...pattern,
              node: structuredClone(node),
              updatedAt: new Date().toISOString(),
            }
          : pattern,
      ),
    );
  }

  function remove(id: string) {
    setPatterns((current) =>
      current.filter((pattern) => pattern.id !== id),
    );
  }

  return { patterns, add, rename, update, remove };
}
