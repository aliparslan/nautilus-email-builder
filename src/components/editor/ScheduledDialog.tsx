"use client";

import { CalendarClock, RefreshCw, TerminalSquare } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";
import { api, ApiClientError } from "@/lib/client-api";
import { formatDateTime, formatRelative, pluralize } from "@/lib/format";
import type { ScheduledEmail, ScheduledEmailStatus } from "@/lib/scheduler";
import { Badge } from "../ui/Badge";
import { Button } from "../ui/Button";
import { Dialog, DialogBody, DialogFooter } from "../ui/Dialog";

const POLL_MS = 8_000;

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

type Props = {
  open: boolean;
  onClose: () => void;
  onCountChange?: (n: number) => void;
};

export function ScheduledDialog({ open, onClose, onCountChange }: Props) {
  return (
    <Dialog
      open={open}
      onClose={onClose}
      size="lg"
      eyebrow="Scheduling"
      title="Scheduled emails"
      description="Backed by Temporal workflows — each row is a durable timer you can cancel until it fires."
    >
      {open && <ScheduledList onCountChange={onCountChange} />}
    </Dialog>
  );
}

type ListState =
  | { items: ScheduledEmail[]; error: null }
  | { items: null; error: ApiClientError }
  | null;

function ScheduledList({ onCountChange }: Pick<Props, "onCountChange">) {
  const [state, setState] = useState<ListState>(null);
  const [now, setNow] = useState(() => Date.now());
  const [refreshing, setRefreshing] = useState(false);
  const [cancelling, setCancelling] = useState<string | null>(null);

  const load = useCallback(
    () =>
      api
        .listScheduled()
        .then(({ items }) => {
          setState({ items, error: null });
          setNow(Date.now());
          onCountChange?.(items.filter((i) => i.status === "scheduled").length);
        })
        .catch((e: unknown) => {
          setState({
            items: null,
            error:
              e instanceof ApiClientError
                ? e
                : new ApiClientError("Couldn't load scheduled emails", 500),
          });
        }),
    [onCountChange],
  );

  useEffect(() => {
    void load();
    const id = setInterval(load, POLL_MS);
    return () => clearInterval(id);
  }, [load]);

  async function refresh() {
    setRefreshing(true);
    await load();
    setRefreshing(false);
  }

  async function cancel(item: ScheduledEmail) {
    setCancelling(item.id);
    try {
      await api.cancelScheduled(item.id);
      toast.success("Scheduled email cancelled", { description: item.subject });
      await load();
    } catch (e) {
      toast.error("Couldn't cancel", {
        description: e instanceof Error ? e.message : undefined,
      });
    } finally {
      setCancelling(null);
    }
  }

  const items = state?.items ?? [];
  const upcoming = items.filter(
    (i) => i.status === "scheduled" || i.status === "sending",
  );
  const past = items.filter(
    (i) => i.status !== "scheduled" && i.status !== "sending",
  );

  return (
    <>
      <DialogBody className="p-6">
        {state?.error ? (
          <Unavailable error={state.error} />
        ) : state === null ? (
          <p className="py-10 text-center text-sm text-gray-500">Loading…</p>
        ) : items.length === 0 ? (
          <div className="flex flex-col items-center py-12 text-center">
            <CalendarClock className="mb-3 size-8 text-brand" />
            <p className="font-medium text-charcoal-900 dark:text-neutral-100">
              Nothing scheduled
            </p>
            <p className="mt-1 max-w-xs text-sm text-gray-500">
              Pick “Schedule” in Review &amp; send to queue an email for later.
            </p>
          </div>
        ) : (
          <>
            <Section
              title={`Upcoming · ${upcoming.length}`}
              items={upcoming}
              now={now}
              cancelling={cancelling}
              onCancel={cancel}
            />
            <Section
              title={`History · ${past.length}`}
              items={past}
              now={now}
              cancelling={cancelling}
              onCancel={cancel}
            />
          </>
        )}
      </DialogBody>
      <DialogFooter>
        <Button
          variant="ghost"
          size="sm"
          icon={
            <RefreshCw
              className={refreshing ? "size-4 animate-spin" : "size-4"}
            />
          }
          onClick={refresh}
          disabled={refreshing}
        >
          Refresh
        </Button>
      </DialogFooter>
    </>
  );
}

function Section({
  title,
  items,
  now,
  cancelling,
  onCancel,
}: {
  title: string;
  items: ScheduledEmail[];
  now: number;
  cancelling: string | null;
  onCancel: (i: ScheduledEmail) => void;
}) {
  if (!items.length) return null;
  return (
    <section className="mb-6 last:mb-0">
      <h3 className="mb-2 font-mono text-[11px] font-medium tracking-wider text-gray-600 uppercase dark:text-neutral-500">
        {title}
      </h3>
      <ul className="divide-y divide-divide overflow-hidden rounded-xl border border-divide dark:divide-neutral-800 dark:border-neutral-800">
        {items.map((item) => (
          <li
            key={item.id}
            className="flex items-center gap-4 bg-white px-4 py-3 dark:bg-neutral-900"
          >
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2">
                <Badge tone={STATUS_TONE[item.status]}>{item.status}</Badge>
                <p className="truncate text-sm font-medium text-charcoal-900 dark:text-neutral-100">
                  {item.subject}
                </p>
              </div>
              <p className="mt-1 truncate text-xs text-gray-500">
                {pluralize(item.to.length, "recipient")} ·{" "}
                {item.to.slice(0, 3).join(", ")}
                {item.to.length > 3 && ` +${item.to.length - 3}`}
              </p>
            </div>
            <div className="shrink-0 text-right">
              <p className="text-sm text-charcoal-800 tabular-nums dark:text-neutral-200">
                {formatDateTime(item.sendAt)}
              </p>
              <p className="text-xs text-gray-500">
                {item.status === "scheduled"
                  ? formatRelative(item.sendAt, now)
                  : item.status}
              </p>
            </div>
            {item.status === "scheduled" && (
              <Button
                variant="danger"
                size="sm"
                loading={cancelling === item.id}
                onClick={() => onCancel(item)}
              >
                Cancel
              </Button>
            )}
          </li>
        ))}
      </ul>
    </section>
  );
}

function Unavailable({ error }: { error: ApiClientError }) {
  const offline = error.code === "scheduler_unavailable";
  return (
    <div className="rounded-xl border border-divide bg-gray-50 p-5 dark:border-neutral-800 dark:bg-neutral-900">
      <div className="flex items-start gap-3">
        <TerminalSquare className="mt-0.5 size-5 shrink-0 text-brand" />
        <div className="min-w-0">
          <p className="font-medium text-charcoal-900 dark:text-neutral-100">
            {offline
              ? "Temporal isn't reachable"
              : "Couldn't load scheduled emails"}
          </p>
          <p className="mt-1 text-sm text-gray-600 dark:text-neutral-400">
            {offline
              ? "Scheduling runs on a Temporal dev server and a worker process. Start both, then refresh:"
              : error.message}
          </p>
          {offline && (
            <pre className="mt-3 overflow-auto rounded-lg bg-charcoal-900 px-3 py-2 font-mono text-xs leading-relaxed text-neutral-100 dark:bg-black">
              {"temporal server start-dev\nbun run worker"}
            </pre>
          )}
        </div>
      </div>
    </div>
  );
}
