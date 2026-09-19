"use client";

import { X } from "lucide-react";
import { type KeyboardEvent, useId, useState } from "react";
import { cn } from "@/lib/cn";

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const SPLIT = /[\s,;]+/;

type Props = {
  value: string[];
  onChange: (next: string[]) => void;
  disabled?: boolean;
  autoFocus?: boolean;
};

/** Chip input for addresses. Enter, comma, space, blur, or pasting a list all commit. */
export function RecipientsInput({
  value,
  onChange,
  disabled,
  autoFocus,
}: Props) {
  const [draft, setDraft] = useState("");
  const [invalid, setInvalid] = useState<string | null>(null);
  const id = useId();

  function commit(raw: string) {
    const parts = raw
      .split(SPLIT)
      .map((s) => s.trim().toLowerCase())
      .filter(Boolean);
    if (!parts.length) return;
    const bad = parts.find((p) => !EMAIL.test(p));
    if (bad) {
      setInvalid(bad);
      setDraft(bad);
      return;
    }
    setInvalid(null);
    setDraft("");
    onChange(Array.from(new Set([...value, ...parts])));
  }

  function onKeyDown(e: KeyboardEvent<HTMLInputElement>) {
    if (
      e.key === "Enter" ||
      e.key === "," ||
      e.key === " " ||
      e.key === "Tab"
    ) {
      if (draft.trim()) {
        e.preventDefault();
        commit(draft);
      }
    } else if (e.key === "Backspace" && !draft && value.length) {
      onChange(value.slice(0, -1));
    }
  }

  return (
    <div>
      <label
        htmlFor={id}
        className={cn(
          "flex min-h-10 flex-wrap items-center gap-1.5 rounded-xl border bg-white px-2 py-1.5 transition dark:bg-neutral-900",
          "focus-within:outline-2 focus-within:outline-offset-1 focus-within:outline-brand",
          invalid ? "border-danger" : "border-divide dark:border-neutral-700",
          disabled && "opacity-60",
        )}
      >
        {value.map((email) => (
          <span
            key={email}
            className="inline-flex h-7 items-center gap-1 rounded-lg bg-gray-200 pr-1 pl-2.5 text-[13px] text-charcoal-900 dark:bg-neutral-800 dark:text-neutral-100"
          >
            {email}
            <button
              type="button"
              aria-label={`Remove ${email}`}
              disabled={disabled}
              onClick={() => onChange(value.filter((v) => v !== email))}
              className="inline-flex size-5 items-center justify-center rounded-md text-gray-600 hover:bg-gray-400/60 hover:text-charcoal-900 dark:hover:bg-neutral-700"
            >
              <X className="size-3" />
            </button>
          </span>
        ))}
        <input
          id={id}
          type="email"
          multiple
          autoFocus={autoFocus}
          disabled={disabled}
          value={draft}
          placeholder={
            value.length ? "" : "name@example.com, another@example.com"
          }
          onChange={(e) => {
            setDraft(e.target.value);
            if (invalid) setInvalid(null);
          }}
          onKeyDown={onKeyDown}
          onBlur={() => draft.trim() && commit(draft)}
          onPaste={(e) => {
            const text = e.clipboardData.getData("text");
            if (SPLIT.test(text.trim())) {
              e.preventDefault();
              commit(text);
            }
          }}
          className="h-7 min-w-32 flex-1 bg-transparent px-1 text-sm outline-none placeholder:text-gray-500"
          autoComplete="off"
          spellCheck={false}
        />
      </label>
      <p
        className={cn(
          "mt-1.5 text-xs",
          invalid ? "text-danger" : "text-gray-500",
        )}
      >
        {invalid
          ? `“${invalid}” isn't a valid email address`
          : "Press Enter or comma to add. Paste a list to add many."}
      </p>
    </div>
  );
}
