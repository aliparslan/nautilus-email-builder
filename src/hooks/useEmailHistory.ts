"use client";

import { useEffect, useState } from "react";
import type { EmailData } from "@/email/config";
import type { ScheduledEmailStatus } from "@/lib/scheduler";

const KEY = "nautilus-email:activity:v1";
const MAX_ITEMS = 30;

export type EmailActivity = {
  id: string;
  kind: "sent" | "scheduled";
  status: ScheduledEmailStatus;
  subject: string;
  to: string[];
  createdAt: string;
  sendAt?: string;
  senderLocalPart?: string;
  /** Browser-local snapshot used by Edit and Duplicate. */
  data: EmailData;
};

function readHistory(): EmailActivity[] {
  try {
    const value: unknown = JSON.parse(localStorage.getItem(KEY) ?? "[]");
    if (!Array.isArray(value)) return [];
    return value.filter((item): item is EmailActivity => {
      if (!item || typeof item !== "object") return false;
      const entry = item as Partial<EmailActivity>;
      return Boolean(
        typeof entry.id === "string" &&
          (entry.kind === "sent" || entry.kind === "scheduled") &&
          typeof entry.subject === "string" &&
          Array.isArray(entry.to) &&
          entry.to.every((address) => typeof address === "string") &&
          typeof entry.createdAt === "string" &&
          entry.data &&
          typeof entry.data === "object",
      );
    });
  } catch {
    return [];
  }
}

export function useEmailHistory() {
  const [items, setItems] = useState<EmailActivity[]>(readHistory);

  useEffect(() => {
    try {
      localStorage.setItem(KEY, JSON.stringify(items));
    } catch {
      // A delivery record is helpful, but it must never block editing or sending.
    }
  }, [items]);

  function record(entry: EmailActivity) {
    setItems((current) => [
      { ...entry, data: structuredClone(entry.data) },
      ...current.filter((item) => item.id !== entry.id),
    ].slice(0, MAX_ITEMS));
  }

  function setStatus(id: string, status: ScheduledEmailStatus) {
    setItems((current) =>
      current.map((item) => (item.id === id ? { ...item, status } : item)),
    );
  }

  return { items, record, setStatus };
}
