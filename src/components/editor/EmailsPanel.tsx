"use client";

import {
  CalendarClock,
  ChevronDown,
  Copy,
  MailCheck,
  Pencil,
  Eye,
  RefreshCw,
  Users,
} from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import type { EmailData } from "@/email/config";
import type { useEmailHistory } from "@/hooks/useEmailHistory";
import { api, ApiClientError } from "@/lib/client-api";
import { formatDateTime, formatRelative, pluralize } from "@/lib/format";
import type { ScheduledEmail, ScheduledEmailStatus } from "@/lib/scheduler";
import { Badge } from "../ui/Badge";
import { IconButton } from "../ui/IconButton";
import { EmailSnapshotDialog } from "./EmailSnapshotDialog";

const STATUS_TONE: Record<
  ScheduledEmailStatus,
  "brand" | "warning" | "success" | "neutral" | "danger"
> = {
  scheduled: "brand",
  sending: "warning",
  sent: "success",
  cancelled: "neutral",
  failed: "danger",
};

type History = ReturnType<typeof useEmailHistory>;

type Props = {
  title: string;
  savedAt: string | null;
  history: History;
  onSaveNow: () => void;
  onLoad: (data: EmailData, to: string[], duplicate: boolean) => void;
};

type ViewItem = {
  id: string;
  subject: string;
  to: string[];
  createdAt: string;
  sendAt?: string;
  status: ScheduledEmailStatus;
  data?: EmailData;
};

export function EmailsPanel({
  title,
  savedAt,
  history,
  onSaveNow,
  onLoad,
}: Props) {
  const [scheduled, setScheduled] = useState<ScheduledEmail[] | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [busy, setBusy] = useState<string | null>(null);
  const [preview, setPreview] = useState<ViewItem | null>(null);

  const load = useCallback(async () => {
    try {
      const response = await api.listScheduled();
      setScheduled(response.items);
      setLoadError(null);
    } catch (error) {
      setScheduled([]);
      setLoadError(
        error instanceof ApiClientError &&
          error.code === "scheduler_unavailable"
          ? "Scheduler offline"
          : "Couldn’t refresh schedules",
      );
    }
  }, []);

  useEffect(() => {
    const id = window.setTimeout(() => void load(), 0);
    return () => window.clearTimeout(id);
  }, [load]);

  const items = useMemo<ViewItem[]>(() => {
    const local = new Map<string, ViewItem>(
      history.items.map((item) => [
        item.id,
        {
          id: item.id,
          subject: item.subject,
          to: item.to,
          createdAt: item.createdAt,
          sendAt: item.sendAt,
          status: item.status,
          data: item.data,
        } satisfies ViewItem,
      ]),
    );
    for (const item of scheduled ?? []) {
      const match = local.get(item.id);
      local.set(item.id, { ...item, data: match?.data });
    }
    return [...local.values()].sort((a, b) =>
      b.createdAt.localeCompare(a.createdAt),
    );
  }, [history.items, scheduled]);

  async function refresh() {
    setRefreshing(true);
    await load();
    setRefreshing(false);
  }

  async function cancel(item: ViewItem, edit = false) {
    setBusy(item.id);
    try {
      await api.cancelScheduled(item.id);
      history.setStatus(item.id, "cancelled");
      if (edit && item.data) {
        onLoad(item.data, item.to, false);
        toast.success("Scheduled email moved to the editor");
      } else {
        toast.success("Scheduled email cancelled", {
          description: item.subject,
        });
      }
      await load();
    } catch (error) {
      toast.error(edit ? "Couldn’t open for editing" : "Couldn’t cancel", {
        description: error instanceof Error ? error.message : undefined,
      });
    } finally {
      setBusy(null);
    }
  }

  return (
    <>
    <div className="space-y-5 p-3">
      <section className="rounded-xl border border-divide bg-white p-3 dark:border-neutral-700 dark:bg-neutral-900">
        <p className="text-[11px] font-semibold tracking-[0.06em] text-gray-600 uppercase dark:text-neutral-400">
          Current draft
        </p>
        <p className="mt-1 truncate text-sm font-semibold">{title}</p>
        <p className="mt-0.5 text-xs text-gray-600 dark:text-neutral-400">
          {savedAt ? `Saved ${formatRelative(savedAt)}` : "Saving locally"}
        </p>
        <div className="mt-3 flex items-center gap-2">
          <button
            type="button"
            onClick={onSaveNow}
            className="h-8 rounded-md bg-brand px-3 text-xs font-semibold text-white transition-[background-color,transform] hover:bg-brand/90 active:scale-[0.96]"
          >
            Save now
          </button>
        </div>
      </section>

      <section>
        <div className="mb-2 flex items-center justify-between">
          <h3 className="text-[11px] font-semibold tracking-[0.06em] text-gray-600 uppercase dark:text-neutral-400">
            Activity
          </h3>
          <IconButton
            label="Refresh email activity"
            onClick={refresh}
            disabled={refreshing}
          >
            <RefreshCw
              className={refreshing ? "size-3.5 animate-spin" : "size-3.5"}
            />
          </IconButton>
        </div>

        {loadError && (
          <p className="mb-2 rounded-lg bg-warning/10 px-2.5 py-2 text-xs text-charcoal-800 dark:text-neutral-200">
            {loadError}. Sent history is still available.
          </p>
        )}

        {scheduled === null ? (
          <p className="py-8 text-center text-xs text-gray-600 dark:text-neutral-400">
            Loading…
          </p>
        ) : items.length === 0 ? (
          <div className="rounded-xl border border-dashed border-divide px-4 py-8 text-center dark:border-neutral-700">
            <MailCheck className="mx-auto size-6 text-brand" />
            <p className="mt-2 text-sm font-medium">No email activity yet</p>
            <p className="mt-1 text-xs text-gray-600 dark:text-neutral-400">
              Sent and scheduled emails appear here.
            </p>
          </div>
        ) : (
          <ul className="space-y-2">
            {items.map((item) => {
              const canEdit = item.status === "scheduled" && item.data;
              return (
                <li
                  key={item.id}
                  className="rounded-xl border border-divide bg-white p-3 dark:border-neutral-700 dark:bg-neutral-900"
                >
                  <div className="flex items-center gap-2">
                    <Badge tone={STATUS_TONE[item.status]}>{item.status}</Badge>
                    <p className="min-w-0 flex-1 truncate text-xs font-semibold">
                      {item.subject || "(no subject)"}
                    </p>
                  </div>
                  <p className="mt-2 truncate text-[11px] text-gray-600 dark:text-neutral-400">
                    {item.sendAt
                      ? formatDateTime(item.sendAt)
                      : formatRelative(item.createdAt)}
                  </p>
                  <RecipientDetails addresses={item.to} />
                  {item.data && (
                    <div className="mt-2 flex items-center gap-1">
                      {canEdit && (
                        <button
                          type="button"
                          disabled={busy === item.id}
                          onClick={() => void cancel(item, true)}
                          className="flex h-7 items-center gap-1 rounded-md px-2 text-[11px] font-medium text-brand-dark hover:bg-brand/10 disabled:opacity-50 dark:text-brand"
                        >
                          <Pencil className="size-3" />
                          Edit
                        </button>
                      )}
                      <button
                        type="button"
                        onClick={() => setPreview(item)}
                        className="flex h-7 items-center gap-1 rounded-md px-2 text-[11px] font-medium text-brand-dark hover:bg-brand/10 dark:text-brand"
                      >
                        <Eye className="size-3" />
                        Preview
                      </button>
                      <button
                        type="button"
                        onClick={() => onLoad(item.data!, item.to, true)}
                        className="flex h-7 items-center gap-1 rounded-md px-2 text-[11px] font-medium text-brand-dark hover:bg-brand/10 dark:text-brand"
                      >
                        <Copy className="size-3" />
                        Duplicate
                      </button>
                      {item.status === "scheduled" && (
                        <button
                          type="button"
                          disabled={busy === item.id}
                          onClick={() => void cancel(item)}
                          className="ml-auto flex h-7 items-center gap-1 rounded-md px-2 text-[11px] font-medium text-danger hover:bg-danger/10 disabled:opacity-50"
                        >
                          <CalendarClock className="size-3" />
                          Cancel
                        </button>
                      )}
                    </div>
                  )}
                </li>
              );
            })}
          </ul>
        )}
      </section>
    </div>
    {preview?.data && (
      <EmailSnapshotDialog
        title={preview.subject || "Email preview"}
        data={preview.data}
        to={preview.to}
        action="Duplicate"
        onAction={() => {
          onLoad(preview.data!, preview.to, true);
          setPreview(null);
        }}
        onClose={() => setPreview(null)}
      />
    )}
    </>
  );
}

function RecipientDetails({ addresses }: { addresses: string[] }) {
  if (addresses.length === 1) {
    return (
      <div className="mt-2 flex min-w-0 items-center gap-1.5 text-[11px] text-gray-600 dark:text-neutral-400">
        <Users className="size-3.5 shrink-0 text-brand" aria-hidden="true" />
        <span className="truncate" title={addresses[0]}>
          {addresses[0]}
        </span>
      </div>
    );
  }

  return (
    <details className="group mt-2 text-[11px]">
      <summary className="flex cursor-pointer list-none items-center gap-1.5 rounded-md text-gray-600 hover:text-charcoal-800 focus-visible:outline-2 focus-visible:outline-brand dark:text-neutral-400 dark:hover:text-neutral-200">
        <Users className="size-3.5 shrink-0 text-brand" aria-hidden="true" />
        <span>{pluralize(addresses.length, "recipient")}</span>
        <ChevronDown
          className="size-3 shrink-0 transition-transform group-open:rotate-180"
          aria-hidden="true"
        />
      </summary>
      <ul className="mt-2 max-h-28 space-y-1 overflow-y-auto rounded-lg bg-gray-100 p-2 text-gray-600 dark:bg-neutral-800 dark:text-neutral-300">
        {addresses.map((address) => (
          <li key={address} className="break-all">
            {address}
          </li>
        ))}
      </ul>
    </details>
  );
}
