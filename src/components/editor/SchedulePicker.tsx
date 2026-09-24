"use client";

import {
  CalendarDays,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  ChevronUp,
  Clock3,
  Globe2,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { IconButton } from "../ui/IconButton";

const ZONES = [
  "America/Los_Angeles",
  "America/Denver",
  "America/Chicago",
  "America/New_York",
  "America/Phoenix",
  "Pacific/Honolulu",
  "Europe/London",
  "Europe/Paris",
  "Asia/Tokyo",
  "Australia/Sydney",
];

function dateKey(date: Date) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
}

/** Convert wall time in an IANA zone to an instant, including changes in daylight saving offset. */
export function zonedDateTime(date: string, time: string, zone: string): Date {
  const [year, month, day] = date.split("-").map(Number);
  const [hour, minute] = time.split(":").map(Number);
  const target = Date.UTC(year, month - 1, day, hour, minute);
  let guess = target;
  for (let attempt = 0; attempt < 3; attempt++) {
    const parts = new Intl.DateTimeFormat("en-US", {
      timeZone: zone,
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      hourCycle: "h23",
    }).formatToParts(new Date(guess));
    const part = (type: string) =>
      Number(parts.find((entry) => entry.type === type)?.value);
    const shown = Date.UTC(
      part("year"),
      part("month") - 1,
      part("day"),
      part("hour"),
      part("minute"),
    );
    guess += target - shown;
  }
  return new Date(guess);
}

function zoneLabel(zone: string) {
  return zone.split("/").at(-1)?.replaceAll("_", " ") ?? zone;
}

function displayTime(time: string) {
  const [hour, minute] = time.split(":").map(Number);
  return `${hour % 12 || 12}:${String(minute).padStart(2, "0")} ${hour < 12 ? "AM" : "PM"}`;
}

function parseTime(input: string): string | null {
  const match = /^(\d{1,2})(?::(\d{2}))?\s*(am|pm)?$/i.exec(input.trim());
  if (!match) return null;
  let hour = Number(match[1]);
  const minute = Number(match[2] ?? 0);
  const period = match[3]?.toLowerCase();
  if (minute > 59 || hour > (period ? 12 : 23) || hour < (period ? 1 : 0))
    return null;
  if (period) hour = (hour % 12) + (period === "pm" ? 12 : 0);
  return `${String(hour).padStart(2, "0")}:${String(minute).padStart(2, "0")}`;
}

export function SchedulePicker({
  value,
  onChange,
  onValidityChange,
}: {
  value: Date;
  onChange: (value: Date) => void;
  onValidityChange?: (valid: boolean) => void;
}) {
  const [initial] = useState(() => value);
  const [date, setDate] = useState(dateKey(initial));
  const [time, setTime] = useState(
    `${String(initial.getHours()).padStart(2, "0")}:00`,
  );
  const [timeText, setTimeText] = useState(() =>
    displayTime(`${String(initial.getHours()).padStart(2, "0")}:00`),
  );
  const [timeError, setTimeError] = useState(false);
  const [zone, setZone] = useState(
    () => Intl.DateTimeFormat().resolvedOptions().timeZone || "America/Chicago",
  );
  const [openPicker, setOpenPicker] = useState<"date" | "time" | null>(null);
  const [pickerPosition, setPickerPosition] = useState<{
    left: number;
    top: number;
  } | null>(null);
  const dateTriggerRef = useRef<HTMLButtonElement>(null);
  const timeTriggerRef = useRef<HTMLButtonElement>(null);
  const pickerRef = useRef<HTMLDivElement>(null);
  const cancelTimeBlurRef = useRef(false);
  const [month, setMonth] = useState(
    () => new Date(initial.getFullYear(), initial.getMonth(), 1),
  );
  const today = dateKey(new Date());
  const firstDay = new Date(month.getFullYear(), month.getMonth(), 1).getDay();
  const days = new Date(month.getFullYear(), month.getMonth() + 1, 0).getDate();
  const slots = Array.from(
    { length: Math.ceil((days + firstDay) / 7) * 7 },
    (_, index) => index - firstDay + 1,
  );
  const zoneOptions = [zone, ...ZONES].filter(
    (item, index, items) => items.indexOf(item) === index,
  );

  useEffect(() => {
    if (!openPicker) return;
    const trigger = openPicker === "date" ? dateTriggerRef : timeTriggerRef;
    const positionPicker = () => {
      const rect = trigger.current?.getBoundingClientRect();
      if (!rect) return;
      const width = openPicker === "date" ? 260 : 220;
      const height =
        pickerRef.current?.offsetHeight ?? (openPicker === "date" ? 322 : 190);
      const below = rect.bottom + 8;
      setPickerPosition({
        left: Math.max(12, Math.min(rect.left, window.innerWidth - width - 12)),
        top:
          below + height <= window.innerHeight - 12
            ? below
            : Math.max(12, rect.top - height - 8),
      });
    };
    const dismiss = (event: PointerEvent) => {
      const target = event.target as Node;
      if (
        !pickerRef.current?.contains(target) &&
        !trigger.current?.contains(target)
      )
        setOpenPicker(null);
    };
    const escape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.stopImmediatePropagation();
        setOpenPicker(null);
        trigger.current?.focus();
      }
    };
    positionPicker();
    const frame = requestAnimationFrame(positionPicker);
    window.addEventListener("resize", positionPicker);
    window.addEventListener("scroll", positionPicker, true);
    document.addEventListener("pointerdown", dismiss, true);
    document.addEventListener("keydown", escape, true);
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("resize", positionPicker);
      window.removeEventListener("scroll", positionPicker, true);
      document.removeEventListener("pointerdown", dismiss, true);
      document.removeEventListener("keydown", escape, true);
    };
  }, [openPicker]);

  function update(nextDate: string, nextTime: string, nextZone: string) {
    setDate(nextDate);
    setTime(nextTime);
    setZone(nextZone);
    onChange(zonedDateTime(nextDate, nextTime, nextZone));
  }

  function setPickedTime(nextHour: number, nextMinute: number) {
    const next = `${String(nextHour).padStart(2, "0")}:${String(nextMinute).padStart(2, "0")}`;
    update(date, next, zone);
    setTimeText(displayTime(next));
    setTimeError(false);
    onValidityChange?.(true);
  }

  const [hour24, minute] = time.split(":").map(Number);
  const hour12 = hour24 % 12 || 12;
  const period = hour24 < 12 ? "AM" : "PM";

  return (
    <div className="space-y-2">
      <div className="grid grid-cols-2 gap-2">
        <div className="relative min-w-0">
          <button
            ref={dateTriggerRef}
            type="button"
            aria-expanded={openPicker === "date"}
            onClick={() => {
              setPickerPosition(null);
              setOpenPicker((current) => (current === "date" ? null : "date"));
            }}
            className="flex h-10 w-full items-center gap-2 truncate rounded-lg border border-divide bg-white px-2.5 text-left text-xs hover:border-brand focus-visible:outline-2 focus-visible:outline-brand dark:border-neutral-700 dark:bg-neutral-950"
          >
            <CalendarDays className="size-4 text-brand" />
            {new Date(`${date}T12:00:00`).toLocaleDateString(undefined, {
              weekday: "short",
              month: "short",
              day: "numeric",
            })}
          </button>
          {openPicker === "date" &&
            pickerPosition &&
            createPortal(
              <div
                ref={pickerRef}
                role="dialog"
                aria-label="Choose send date"
                style={pickerPosition}
                className="fixed z-[60] w-[260px] max-h-[calc(100dvh-24px)] overflow-y-auto rounded-xl border border-divide bg-white p-3 shadow-float dark:border-neutral-700 dark:bg-neutral-900"
              >
                <div className="mb-3 flex items-center justify-between">
                  <IconButton
                    label="Previous month"
                    onClick={() =>
                      setMonth(
                        new Date(month.getFullYear(), month.getMonth() - 1, 1),
                      )
                    }
                  >
                    <ChevronLeft className="size-4" />
                  </IconButton>
                  <strong className="text-sm">
                    {month.toLocaleDateString(undefined, {
                      month: "long",
                      year: "numeric",
                    })}
                  </strong>
                  <IconButton
                    label="Next month"
                    onClick={() =>
                      setMonth(
                        new Date(month.getFullYear(), month.getMonth() + 1, 1),
                      )
                    }
                  >
                    <ChevronRight className="size-4" />
                  </IconButton>
                </div>
                <div className="grid grid-cols-7 text-center text-xs text-gray-600 dark:text-neutral-400">
                  {["S", "M", "T", "W", "T", "F", "S"].map((label, index) => (
                    <span key={index} className="py-1">
                      {label}
                    </span>
                  ))}
                </div>
                <div className="grid grid-cols-7 gap-0.5">
                  {slots.map((day, index) => {
                    const key = dateKey(
                      new Date(month.getFullYear(), month.getMonth(), day),
                    );
                    return day < 1 || day > days ? (
                      <span key={index} />
                    ) : (
                      <button
                        key={key}
                        type="button"
                        disabled={key < today}
                        aria-label={new Date(`${key}T12:00:00`).toDateString()}
                        aria-pressed={date === key}
                        onClick={() => {
                          update(key, time, zone);
                          setOpenPicker(null);
                        }}
                        className={`size-8 rounded-md text-xs focus-visible:outline-2 focus-visible:outline-brand disabled:opacity-30 ${date === key ? "bg-brand text-white" : "hover:bg-brand/10"}`}
                      >
                        {day}
                      </button>
                    );
                  })}
                </div>
              </div>,
              document.body,
            )}
        </div>
        <div className="flex min-w-0 items-center rounded-lg border border-divide bg-white pl-2.5 pr-1 focus-within:border-brand focus-within:ring-1 focus-within:ring-brand dark:border-neutral-700 dark:bg-neutral-950">
          <input
            type="text"
            inputMode="text"
            aria-label="Send time"
            aria-invalid={timeError}
            value={timeText}
            onChange={(event) => {
              setTimeText(event.target.value);
              setTimeError(false);
            }}
            onBlur={() => {
              if (cancelTimeBlurRef.current) {
                cancelTimeBlurRef.current = false;
                return;
              }
              const parsed = parseTime(timeText);
              if (parsed) {
                update(date, parsed, zone);
                setTimeText(displayTime(parsed));
                setTimeError(false);
                onValidityChange?.(true);
              } else {
                setTimeError(true);
                onValidityChange?.(false);
              }
            }}
            onKeyDown={(event) => {
              if (event.key === "Enter") event.currentTarget.blur();
              if (event.key === "Escape") {
                event.stopPropagation();
                cancelTimeBlurRef.current = true;
                setTimeText(displayTime(time));
                setTimeError(false);
                onValidityChange?.(true);
                event.currentTarget.blur();
              }
            }}
            className="h-10 w-full min-w-0 bg-transparent text-xs outline-none"
          />
          <button
            ref={timeTriggerRef}
            type="button"
            aria-label="Choose send time"
            aria-expanded={openPicker === "time"}
            onClick={() => {
              setPickerPosition(null);
              setOpenPicker((current) => (current === "time" ? null : "time"));
            }}
            className="flex size-8 shrink-0 items-center justify-center rounded-md text-brand hover:bg-brand/10 focus-visible:outline-2 focus-visible:outline-brand"
          >
            <Clock3 className="size-4" />
          </button>
        </div>
      </div>
      {openPicker === "time" &&
        pickerPosition &&
        createPortal(
          <div
            ref={pickerRef}
            role="dialog"
            aria-label="Choose send time"
            style={pickerPosition}
            className="fixed z-[60] w-[220px] rounded-xl border border-divide bg-white p-3 shadow-float dark:border-neutral-700 dark:bg-neutral-900"
          >
            <div className="grid grid-cols-[1fr_1fr_auto] gap-2 text-center">
              <TimeStep
                label="Hour"
                value={String(hour12)}
                onUp={() => setPickedTime((hour24 + 1) % 24, minute)}
                onDown={() => setPickedTime((hour24 + 23) % 24, minute)}
              />
              <TimeStep
                label="Minute"
                value={String(minute).padStart(2, "0")}
                onUp={() => setPickedTime(hour24, (minute + 5) % 60)}
                onDown={() => setPickedTime(hour24, (minute + 55) % 60)}
              />
              <div className="flex flex-col justify-end gap-1 pb-1">
                {(["AM", "PM"] as const).map((choice) => (
                  <button
                    key={choice}
                    type="button"
                    aria-pressed={period === choice}
                    onClick={() =>
                      setPickedTime(
                        (hour24 % 12) + (choice === "PM" ? 12 : 0),
                        minute,
                      )
                    }
                    className={`h-7 rounded-md px-2 text-xs font-semibold focus-visible:outline-2 focus-visible:outline-brand ${period === choice ? "bg-brand text-white" : "bg-gray-100 text-gray-600 hover:bg-brand/10 dark:bg-neutral-800 dark:text-neutral-300"}`}
                  >
                    {choice}
                  </button>
                ))}
              </div>
            </div>
          </div>,
          document.body,
        )}
      {timeError && (
        <p role="alert" className="text-xs text-danger">
          Enter a time such as 9:30 AM.
        </p>
      )}
      <label className="flex items-center gap-2 px-1 text-xs text-gray-600 dark:text-neutral-400">
        <Globe2 className="size-3.5 text-brand" />
        <span className="sr-only">Time zone</span>
        <select
          aria-label="Time zone"
          value={zone}
          onChange={(event) => update(date, time, event.target.value)}
          className="min-w-0 flex-1 bg-transparent py-1 text-xs outline-none"
        >
          {zoneOptions.map((item) => (
            <option key={item} value={item}>
              {zoneLabel(item)}
            </option>
          ))}
        </select>
      </label>
    </div>
  );
}

function TimeStep({
  label,
  value,
  onUp,
  onDown,
}: {
  label: string;
  value: string;
  onUp: () => void;
  onDown: () => void;
}) {
  return (
    <div className="flex flex-col items-center gap-1">
      <span className="text-[11px] font-medium text-gray-600 dark:text-neutral-400">
        {label}
      </span>
      <button
        type="button"
        aria-label={`Increase ${label.toLowerCase()}`}
        onClick={onUp}
        className="flex h-6 w-full items-center justify-center rounded-md hover:bg-brand/10 focus-visible:outline-2 focus-visible:outline-brand"
      >
        <ChevronUp className="size-4" />
      </button>
      <span className="flex h-7 w-full items-center justify-center rounded-md bg-gray-100 text-sm font-semibold tabular-nums dark:bg-neutral-800">
        {value}
      </span>
      <button
        type="button"
        aria-label={`Decrease ${label.toLowerCase()}`}
        onClick={onDown}
        className="flex h-6 w-full items-center justify-center rounded-md hover:bg-brand/10 focus-visible:outline-2 focus-visible:outline-brand"
      >
        <ChevronDown className="size-4" />
      </button>
    </div>
  );
}
