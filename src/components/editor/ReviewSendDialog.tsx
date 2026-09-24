"use client";

import { CalendarClock, Send } from "lucide-react";
import { useId, useRef, useState } from "react";
import { toast } from "sonner";
import type { EmailData } from "@/email/config";
import type { EmailActivity } from "@/hooks/useEmailHistory";
import type { useRecipients } from "@/hooks/useRecipients";
import { useRenderedEmail } from "@/hooks/useRenderedEmail";
import { api, ApiClientError } from "@/lib/client-api";
import { cn } from "@/lib/cn";
import { defaultScheduleTime, formatDateTime, pluralize } from "@/lib/format";
import { MAX_RECIPIENTS } from "@/lib/recipients";
import { Button } from "../ui/Button";
import { Dialog, DialogBody, DialogFooter } from "../ui/Dialog";
import { EmailPreviewFrame } from "./EmailPreviewFrame";
import { RecipientsInput } from "./RecipientsInput";
import { SchedulePicker } from "./SchedulePicker";

type Mode = "now" | "later";
type Props = {
  open: boolean;
  onClose: () => void;
  initialMode: Mode;
  data: EmailData;
  subject: string;
  previewText: string;
  onSubjectChange: (subject: string) => void;
  onPreviewTextChange: (preview: string) => void;
  recipients: ReturnType<typeof useRecipients>;
  onScheduled: () => void;
  onActivity: (activity: EmailActivity) => void;
};

export function ReviewSendDialog({ open, onClose, subject, ...form }: Props) {
  return (
    <Dialog open={open} onClose={onClose} size="xl" title="Send email">
      {open && <ReviewSendForm onClose={onClose} subject={subject} {...form} />}
    </Dialog>
  );
}

function ReviewSendForm({
  onClose,
  data,
  subject,
  previewText,
  onSubjectChange,
  onPreviewTextChange,
  initialMode,
  recipients,
  onScheduled,
  onActivity,
}: Omit<Props, "open">) {
  const [mode, setMode] = useState<Mode>(initialMode);
  const [sendAt, setSendAt] = useState<Date>(defaultScheduleTime);
  const [scheduleValid, setScheduleValid] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [senderOverride, setSenderOverride] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const subjectRef = useRef<HTMLInputElement>(null);
  const subjectId = useId();
  const previewId = useId();
  const { rendered, loading, error: renderError } = useRenderedEmail(data);
  const senderLocalPart =
    senderOverride ?? rendered?.fromEmail?.split("@")[0] ?? "";
  const senderDomain = rendered?.fromEmail?.split("@").at(-1) ?? "…";
  const { selection, groups, addresses, setSelection } = recipients;

  async function submit() {
    const to = [...addresses]; // Expand groups at confirmation; scheduling stores this snapshot.
    if (!to.length) return setError("Add at least one recipient.");
    if (to.length > MAX_RECIPIENTS)
      return setError(
        `You can send to up to ${MAX_RECIPIENTS} unique addresses.`,
      );
    if (!subject.trim()) {
      subjectRef.current?.focus();
      return setError("Give the email a subject.");
    }
    if (!/^[a-zA-Z0-9][a-zA-Z0-9._+-]{0,63}$/.test(senderLocalPart.trim()))
      return setError("Enter a valid From address before @.");
    if (mode === "later" && sendAt.getTime() < Date.now() + 60_000)
      return setError("Pick a send time at least a minute from now.");
    if (mode === "later" && !scheduleValid)
      return setError("Enter a valid send time.");
    setSubmitting(true);
    setError(null);
    try {
      if (mode === "now") {
        const result = await api.send({
          data,
          to,
          subject: subject.trim(),
          senderLocalPart: senderLocalPart.trim(),
        });
        onActivity({
          id: result.id,
          kind: "sent",
          status: "sent",
          subject: subject.trim(),
          to,
          senderLocalPart: senderLocalPart.trim(),
          createdAt: new Date().toISOString(),
          data,
        });
        toast.success(`Sent to ${pluralize(to.length, "recipient")}`, {
          description: subject.trim(),
        });
      } else {
        const iso = sendAt.toISOString();
        const { item } = await api.schedule({
          data,
          to,
          subject: subject.trim(),
          senderLocalPart: senderLocalPart.trim(),
          sendAt: iso,
        });
        onActivity({
          id: item.id,
          kind: "scheduled",
          status: item.status,
          subject: item.subject,
          to: item.to,
          senderLocalPart: senderLocalPart.trim(),
          sendAt: item.sendAt,
          createdAt: item.createdAt,
          data,
        });
        toast.success(`Scheduled for ${formatDateTime(iso)}`, {
          description: `${pluralize(to.length, "recipient")} · ${subject.trim()}`,
          action: { label: "View scheduled", onClick: onScheduled },
        });
      }
      onClose();
    } catch (cause) {
      const message =
        cause instanceof ApiClientError &&
        cause.code === "scheduler_unavailable"
          ? "Scheduling can't reach Temporal. Check the service and worker, or send now."
          : cause instanceof Error
            ? cause.message
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
      <DialogBody className="flex h-[min(78dvh,850px)] min-h-[480px] overflow-hidden">
        <div className="min-w-0 flex-1">
          <EmailPreviewFrame
            html={rendered?.html ?? null}
            loading={loading}
            error={renderError}
            subject={subject}
            previewText={previewText}
          />
        </div>
        <aside className="flex w-[350px] shrink-0 flex-col gap-4 overflow-auto border-l border-divide p-5 dark:border-neutral-800">
          <Field label="From">
            <div className="flex h-10 min-w-0 items-center rounded-lg border border-divide bg-white px-3 text-sm focus-within:border-brand focus-within:ring-1 focus-within:ring-brand dark:border-neutral-700 dark:bg-neutral-950">
              <input
                aria-label="Sender address before @"
                value={senderLocalPart}
                onChange={(event) => setSenderOverride(event.target.value)}
                disabled={submitting}
                className="min-w-0 flex-1 bg-transparent outline-none"
              />
              <span className="shrink-0 text-gray-600 dark:text-neutral-400">
                @{senderDomain}
              </span>
            </div>
          </Field>
          <Field label="To">
            <RecipientsInput
              value={selection.direct}
              onChange={(direct) =>
                setSelection((current) => ({ ...current, direct }))
              }
              disabled={submitting}
              autoFocus={!addresses.length}
              showHelp={false}
            />
            {groups.length > 0 && (
              <div className="mt-1.5 flex flex-wrap gap-1.5">
                {groups.map((group) => (
                  <label
                    key={group.id}
                    className={cn(
                      "flex cursor-pointer items-center gap-1 rounded-md border px-2 py-1 text-[11px]",
                      selection.groupIds.includes(group.id)
                        ? "border-brand bg-brand/10 text-brand-dark"
                        : "border-divide",
                    )}
                  >
                    <input
                      type="checkbox"
                      checked={selection.groupIds.includes(group.id)}
                      disabled={submitting}
                      onChange={() =>
                        setSelection((current) => ({
                          ...current,
                          groupIds: current.groupIds.includes(group.id)
                            ? current.groupIds.filter((id) => id !== group.id)
                            : [...current.groupIds, group.id],
                        }))
                      }
                      className="accent-brand"
                    />
                    {group.name}
                  </label>
                ))}
              </div>
            )}
            <p
              role="status"
              className={cn(
                "mt-1.5 text-[11px] tabular-nums",
                addresses.length > MAX_RECIPIENTS
                  ? "text-danger"
                  : "text-gray-600 dark:text-neutral-400",
              )}
            >
              {addresses.length} / {MAX_RECIPIENTS} unique recipients
            </p>
          </Field>
          <Field label="Email subject" htmlFor={subjectId}>
            <input
              id={subjectId}
              ref={subjectRef}
              value={subject}
              onChange={(event) => onSubjectChange(event.target.value)}
              disabled={submitting}
              placeholder="Subject line"
              className="h-10 w-full rounded-lg border border-divide bg-white px-3 text-sm outline-none focus-visible:outline-2 focus-visible:outline-brand dark:border-neutral-700 dark:bg-neutral-950"
            />
          </Field>
          <Field label="Email preview text" htmlFor={previewId}>
            <input
              id={previewId}
              value={previewText}
              onChange={(event) => onPreviewTextChange(event.target.value)}
              disabled={submitting}
              placeholder="Text shown in the inbox"
              className="h-10 w-full rounded-lg border border-divide bg-white px-3 text-sm outline-none focus-visible:outline-2 focus-visible:outline-brand dark:border-neutral-700 dark:bg-neutral-950"
            />
          </Field>
          <Field label="Delivery">
            <div className="grid grid-cols-2 gap-1 rounded-lg bg-gray-200 p-1 dark:bg-neutral-800">
              {(["now", "later"] as const).map((choice) => (
                <button
                  key={choice}
                  type="button"
                  aria-pressed={mode === choice}
                  disabled={submitting}
                  onClick={() => setMode(choice)}
                  className={cn(
                    "h-8 rounded-md text-xs font-semibold",
                    mode === choice
                      ? "bg-white text-brand-dark shadow-sm dark:bg-neutral-700 dark:text-brand"
                      : "text-gray-600 dark:text-neutral-400",
                  )}
                >
                  {choice === "now" ? "Send now" : "Schedule"}
                </button>
              ))}
            </div>
          </Field>
          {mode === "later" && (
            <SchedulePicker
              value={sendAt}
              onChange={setSendAt}
              onValidityChange={setScheduleValid}
            />
          )}
          {error && (
            <p
              role="alert"
              className="rounded-lg border border-danger/30 bg-danger/5 px-3 py-2 text-sm text-danger"
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

function Field({
  label,
  htmlFor,
  children,
}: {
  label: string;
  htmlFor?: string;
  children: React.ReactNode;
}) {
  const className =
    "mb-1.5 text-xs font-semibold text-gray-600 dark:text-neutral-400";
  return (
    <div>
      {htmlFor ? (
        <label htmlFor={htmlFor} className={`block ${className}`}>
          {label}
        </label>
      ) : (
        <div className={className}>{label}</div>
      )}
      {children}
    </div>
  );
}
