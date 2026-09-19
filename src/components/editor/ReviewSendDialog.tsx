"use client";

import { CalendarClock, Send } from "lucide-react";
import { useRef, useState } from "react";
import { toast } from "sonner";
import type { EmailData } from "@/email/config";
import { useRenderedEmail } from "@/hooks/useRenderedEmail";
import { api, ApiClientError } from "@/lib/client-api";
import { cn } from "@/lib/cn";
import {
  defaultScheduleTime,
  formatDateTime,
  fromDatetimeLocal,
  pluralize,
  toDatetimeLocal,
} from "@/lib/format";
import { Button } from "../ui/Button";
import { Dialog, DialogBody, DialogFooter } from "../ui/Dialog";
import { EmailPreviewFrame } from "./EmailPreviewFrame";
import { RecipientsInput } from "./RecipientsInput";

const LAST_RECIPIENTS_KEY = "nautilus-email:last-recipients";

type Props = {
  open: boolean;
  onClose: () => void;
  data: EmailData;
  subject: string;
  onSubjectChange: (subject: string) => void;
  onScheduled: () => void;
};

export function ReviewSendDialog({ open, onClose, subject, ...form }: Props) {
  return (
    <Dialog
      open={open}
      onClose={onClose}
      size="xl"
      eyebrow="Review & send"
      title={subject.trim() || "Untitled email"}
      description="This is the rendered email exactly as Resend will deliver it."
    >
      {/* Mounted per open so recipients, mode and the data snapshot initialise fresh each time. */}
      {open && <ReviewSendForm onClose={onClose} subject={subject} {...form} />}
    </Dialog>
  );
}

type Mode = "now" | "later";

function ReviewSendForm({
  onClose,
  data: liveData,
  subject,
  onSubjectChange,
  onScheduled,
}: Omit<Props, "open">) {
  // Snapshot so edits behind the dialog don't re-render the preview mid-review.
  const [data] = useState(liveData);
  const [to, setTo] = useState<string[]>(loadLastRecipients);
  const [mode, setMode] = useState<Mode>("now");
  const [minLocal] = useState(() =>
    toDatetimeLocal(new Date(Date.now() + 60_000)),
  );
  const [sendAt, setSendAt] = useState(() =>
    toDatetimeLocal(defaultScheduleTime()),
  );
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const subjectRef = useRef<HTMLInputElement>(null);

  const { rendered, loading, error: renderError } = useRenderedEmail(data);

  const previewText =
    typeof data.root.props?.previewText === "string"
      ? data.root.props.previewText
      : "";
  // datetime-local strings sort lexicographically, so this stays pure.
  const scheduleTooSoon = mode === "later" && sendAt < minLocal;
  const scheduledDate = mode === "later" ? fromDatetimeLocal(sendAt) : null;

  async function submit() {
    if (!to.length) return setError("Add at least one recipient.");
    if (!subject.trim()) {
      subjectRef.current?.focus();
      return setError("Give the email a subject.");
    }
    if (mode === "later" && (!scheduledDate || isTooSoon(scheduledDate))) {
      return setError("Pick a send time at least a minute from now.");
    }

    setSubmitting(true);
    setError(null);
    localStorage.setItem(LAST_RECIPIENTS_KEY, JSON.stringify(to));

    try {
      if (mode === "now") {
        await api.send({ data, to, subject: subject.trim() });
        toast.success(`Sent to ${pluralize(to.length, "recipient")}`, {
          description: subject.trim(),
        });
      } else {
        const iso = scheduledDate!.toISOString();
        await api.schedule({ data, to, subject: subject.trim(), sendAt: iso });
        toast.success(`Scheduled for ${formatDateTime(iso)}`, {
          description: `${pluralize(to.length, "recipient")} · ${subject.trim()}`,
          action: { label: "View scheduled", onClick: onScheduled },
        });
      }
      onClose();
    } catch (e) {
      const message =
        e instanceof ApiClientError && e.code === "scheduler_unavailable"
          ? "Scheduling needs the Temporal dev server and worker running — see the README. You can still send now."
          : e instanceof Error
            ? e.message
            : "Something went wrong";
      setError(message);
      toast.error(mode === "now" ? "Couldn't send" : "Couldn't schedule", {
        description: message,
      });
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <>
      <DialogBody className="flex h-[70vh] min-h-[480px]">
        <div className="min-w-0 flex-1">
          <EmailPreviewFrame
            html={rendered?.html ?? null}
            loading={loading}
            error={renderError}
            from={rendered?.from ?? "…"}
            to={to}
            subject={subject}
            previewText={previewText}
          />
        </div>

        <aside className="flex w-[360px] shrink-0 flex-col gap-5 overflow-auto border-l border-divide p-5 dark:border-neutral-800">
          <Field label="To">
            <RecipientsInput
              value={to}
              onChange={setTo}
              disabled={submitting}
              autoFocus={!to.length}
            />
          </Field>

          <Field
            label="Subject"
            hint="Also editable in the header. Saved with the email."
          >
            <input
              ref={subjectRef}
              value={subject}
              onChange={(e) => onSubjectChange(e.target.value)}
              disabled={submitting}
              placeholder="Subject line"
              className="h-10 w-full rounded-xl border border-divide bg-white px-3 text-sm outline-none transition placeholder:text-gray-500 focus:outline-2 focus:outline-offset-1 focus:outline-brand dark:border-neutral-700 dark:bg-neutral-900"
            />
          </Field>

          <Field label="Delivery">
            <div
              role="radiogroup"
              className="grid grid-cols-2 gap-1 rounded-xl border border-divide p-1 dark:border-neutral-700"
            >
              {(["now", "later"] as const).map((m) => (
                <button
                  key={m}
                  type="button"
                  role="radio"
                  aria-checked={mode === m}
                  disabled={submitting}
                  onClick={() => setMode(m)}
                  className={cn(
                    "h-8 rounded-lg text-sm font-medium transition",
                    mode === m
                      ? "bg-navy text-white dark:bg-brand dark:text-navy"
                      : "text-gray-600 hover:bg-gray-200 dark:text-neutral-400 dark:hover:bg-neutral-800",
                  )}
                >
                  {m === "now" ? "Send now" : "Schedule"}
                </button>
              ))}
            </div>
            {mode === "later" && (
              <div className="mt-3">
                <input
                  type="datetime-local"
                  value={sendAt}
                  min={minLocal}
                  onChange={(e) => setSendAt(e.target.value)}
                  disabled={submitting}
                  className={cn(
                    "h-10 w-full rounded-xl border bg-white px-3 text-sm outline-none transition focus:outline-2 focus:outline-offset-1 focus:outline-brand dark:bg-neutral-900",
                    scheduleTooSoon
                      ? "border-danger"
                      : "border-divide dark:border-neutral-700",
                  )}
                />
                <p className="mt-1.5 text-xs text-gray-500">
                  {scheduledDate && !scheduleTooSoon
                    ? `Delivers ${formatDateTime(scheduledDate.toISOString())}, your local time. Durable — survives restarts; cancel anytime before it fires.`
                    : "Choose a time at least a minute from now."}
                </p>
              </div>
            )}
          </Field>

          {error && (
            <p
              role="alert"
              className="rounded-xl border border-danger/30 bg-danger/5 px-3 py-2 text-sm text-danger"
            >
              {error}
            </p>
          )}
        </aside>
      </DialogBody>

      <DialogFooter>
        <Button variant="ghost" onClick={onClose} disabled={submitting}>
          Cancel
        </Button>
        <Button
          variant="primary"
          loading={submitting}
          onClick={submit}
          icon={
            mode === "now" ? (
              <Send className="size-4" />
            ) : (
              <CalendarClock className="size-4" />
            )
          }
        >
          {mode === "now" ? "Send now" : "Schedule"}
        </Button>
      </DialogFooter>
    </>
  );
}

function isTooSoon(date: Date): boolean {
  return date.getTime() < Date.now() + 60_000;
}

function loadLastRecipients(): string[] {
  try {
    const last = JSON.parse(localStorage.getItem(LAST_RECIPIENTS_KEY) ?? "[]");
    return Array.isArray(last)
      ? last.filter((x): x is string => typeof x === "string")
      : [];
  } catch {
    return [];
  }
}

function Field({
  label,
  hint,
  children,
}: {
  label: string;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <div className="mb-1.5 text-xs font-semibold text-gray-600 dark:text-neutral-400">
        {label}
      </div>
      {children}
      {hint && <p className="mt-1.5 text-xs text-gray-500">{hint}</p>}
    </div>
  );
}
