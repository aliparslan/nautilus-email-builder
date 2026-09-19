"use client";

import { createUsePuck } from "@puckeditor/core";
import {
  CalendarClock,
  PanelLeft,
  PanelRight,
  Redo2,
  Send,
  Undo2,
} from "lucide-react";
import Image from "next/image";
import { useCallback, useEffect, useState } from "react";
import type { EmailConfig, EmailData } from "@/email/config";
import { api } from "@/lib/client-api";
import { cn } from "@/lib/cn";
import { formatRelative } from "@/lib/format";
import { Button } from "../ui/Button";
import { IconButton } from "../ui/IconButton";
import { ReviewSendDialog } from "./ReviewSendDialog";
import { ScheduledDialog } from "./ScheduledDialog";

const usePuck = createUsePuck<EmailConfig>();

type DialogId = "review" | "scheduled" | null;

type Props = {
  savedAt: string | null;
  onSaveNow: () => boolean;
};

/** Replaces Puck's header: subject line, history, and every app-level action live here. */
export function EditorHeader({ savedAt }: Props) {
  const data = usePuck((s) => s.appState.data as EmailData);
  const ui = usePuck((s) => s.appState.ui);
  const dispatch = usePuck((s) => s.dispatch);
  const history = usePuck((s) => s.history);

  const [dialog, setDialog] = useState<DialogId>(null);
  const [scheduledCount, setScheduledCount] = useState<number | null>(null);

  const subject =
    typeof data.root.props?.subject === "string" ? data.root.props.subject : "";

  const setSubject = useCallback(
    (subject: string) =>
      dispatch({
        type: "setData",
        data: (prev) => ({
          ...prev,
          root: { ...prev.root, props: { ...prev.root.props, subject } },
        }),
      }),
    [dispatch],
  );

  // Quiet badge count; failures (Temporal offline) simply hide the badge.
  useEffect(() => {
    const refresh = () =>
      api
        .listScheduled()
        .then(({ items }) =>
          setScheduledCount(
            items.filter((i) => i.status === "scheduled").length,
          ),
        )
        .catch(() => setScheduledCount(null));
    void refresh();
    const id = setInterval(refresh, 60_000);
    return () => clearInterval(id);
  }, []);

  const close = useCallback(() => setDialog(null), []);

  return (
    <>
      <header className="flex h-14 items-center gap-3 border-b border-divide bg-white px-3 dark:border-neutral-800 dark:bg-neutral-950">
        <div className="flex items-center gap-0.5">
          <IconButton
            label="Toggle blocks sidebar"
            active={ui.leftSideBarVisible}
            onClick={() =>
              dispatch({
                type: "setUi",
                ui: (p) => ({ leftSideBarVisible: !p.leftSideBarVisible }),
              })
            }
          >
            <PanelLeft className="size-4" />
          </IconButton>
          <IconButton
            label="Toggle properties sidebar"
            active={ui.rightSideBarVisible}
            onClick={() =>
              dispatch({
                type: "setUi",
                ui: (p) => ({ rightSideBarVisible: !p.rightSideBarVisible }),
              })
            }
          >
            <PanelRight className="size-4" />
          </IconButton>
        </div>

        <Image
          src="/nautilus-logo.png"
          alt="Nautilus"
          width={106}
          height={24}
          priority
          className="ml-1 h-6 w-auto shrink-0 dark:brightness-0 dark:invert"
        />

        <div className="mx-2 h-6 w-px bg-divide dark:bg-neutral-800" />

        <div className="flex min-w-0 flex-1 items-center gap-3">
          <label className="sr-only" htmlFor="email-subject">
            Subject
          </label>
          <input
            id="email-subject"
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            placeholder="Subject line"
            className={cn(
              "h-9 w-full max-w-xl rounded-lg border border-transparent bg-transparent px-2 text-[15px] font-medium text-charcoal-900 outline-none transition",
              "placeholder:font-normal placeholder:text-gray-500 hover:border-divide focus:border-divide focus:bg-gray-50",
              "dark:text-neutral-100 dark:hover:border-neutral-800 dark:focus:border-neutral-700 dark:focus:bg-neutral-900",
            )}
          />
          <SavedIndicator savedAt={savedAt} />
        </div>

        <div className="flex items-center gap-0.5">
          <IconButton
            label="Undo (⌘Z)"
            disabled={!history.hasPast}
            onClick={history.back}
            className="group"
          >
            <Undo2 className="size-4 transition-transform group-hover:-rotate-12 motion-reduce:transform-none" />
          </IconButton>
          <IconButton
            label="Redo (⇧⌘Z)"
            disabled={!history.hasFuture}
            onClick={history.forward}
            className="group"
          >
            <Redo2 className="size-4 transition-transform group-hover:rotate-12 motion-reduce:transform-none" />
          </IconButton>
        </div>

        <div className="mx-1 h-6 w-px bg-divide dark:bg-neutral-800" />

        <div className="flex items-center gap-0.5">
          <IconButton
            label="Scheduled emails (⇧⌘S)"
            onClick={() => setDialog("scheduled")}
            className="relative"
          >
            <CalendarClock className="size-4" />
            {scheduledCount ? (
              <span className="absolute -top-0.5 -right-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-brand px-1 font-mono text-[10px] font-semibold text-white">
                {scheduledCount}
              </span>
            ) : null}
          </IconButton>
        </div>

        <Button
          variant="primary"
          onClick={() => setDialog("review")}
          className="group ml-1"
          icon={
            <Send className="size-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5 motion-reduce:transform-none" />
          }
        >
          Review &amp; send
        </Button>
      </header>

      <ReviewSendDialog
        open={dialog === "review"}
        onClose={close}
        data={data}
        subject={subject}
        onSubjectChange={setSubject}
        onScheduled={() => setDialog("scheduled")}
      />
      <ScheduledDialog
        open={dialog === "scheduled"}
        onClose={close}
        onCountChange={setScheduledCount}
      />
    </>
  );
}

function SavedIndicator({ savedAt }: { savedAt: string | null }) {
  // Ticks every 30s so "2 minutes ago" stays honest.
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 30_000);
    return () => clearInterval(id);
  }, []);
  if (!savedAt) return null;
  return (
    <span
      className="hidden shrink-0 text-xs text-gray-500 md:inline"
      title={new Date(savedAt).toLocaleString()}
    >
      Saved{" "}
      {formatRelative(savedAt, Math.max(now, new Date(savedAt).getTime()))}
    </span>
  );
}
