"use client";

import { Plus, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { HexColorPicker } from "react-colorful";

const HEX = /^#([0-9a-f]{3}|[0-9a-f]{6})$/i;
const PALETTE_KEY = "nautilus-email:colors:v1";
const DEFAULT_PALETTE = [
  "#05b2df",
  "#033148",
  "#173654",
  "#f7d719",
  "#ffffff",
  "#202020",
];

function readPalette(): string[] {
  try {
    const saved: unknown = JSON.parse(
      localStorage.getItem(PALETTE_KEY) ?? "null",
    );
    return Array.isArray(saved)
      ? saved.filter(
          (color): color is string =>
            typeof color === "string" && HEX.test(color),
        )
      : DEFAULT_PALETTE;
  } catch {
    return DEFAULT_PALETTE;
  }
}

function savePalette(colors: string[]) {
  try {
    localStorage.setItem(PALETTE_KEY, JSON.stringify(colors));
  } catch {
    // Editing remains available when browser storage is full.
  }
}

export type ColorFieldProps = {
  label: string;
  value: string;
  onChange: (value: string) => void;
  readOnly?: boolean;
  id?: string;
};

type Position = { left: number; top: number; width: number };

export function ColorField({
  label,
  value,
  onChange,
  readOnly,
  id,
}: ColorFieldProps) {
  const external = HEX.test(value ?? "") ? value : "";
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState<string | null>(null);
  const [draft, setDraft] = useState<string | null>(null);
  const [palette, setPalette] = useState<string[]>(readPalette);
  const [position, setPosition] = useState<Position | null>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const paletteRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;

    const positionPalette = () => {
      const rect = triggerRef.current?.getBoundingClientRect();
      if (!rect) return;
      const width = Math.min(286, window.innerWidth - 24);
      const height = paletteRef.current?.offsetHeight ?? 258;
      setPosition({
        left: Math.max(12, Math.min(rect.left, window.innerWidth - width - 12)),
        top:
          rect.bottom + height + 8 <= window.innerHeight
            ? rect.bottom + 8
            : Math.max(12, rect.top - height - 8),
        width,
      });
    };

    const dismiss = (event: PointerEvent) => {
      const target = event.target as Node;
      if (
        !triggerRef.current?.contains(target) &&
        !paletteRef.current?.contains(target)
      ) {
        setOpen(false);
      }
    };
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setOpen(false);
        triggerRef.current?.focus();
      }
    };

    positionPalette();
    const frame = requestAnimationFrame(positionPalette);
    window.addEventListener("resize", positionPalette);
    window.addEventListener("scroll", positionPalette, true);
    document.addEventListener("pointerdown", dismiss, true);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("resize", positionPalette);
      window.removeEventListener("scroll", positionPalette, true);
      document.removeEventListener("pointerdown", dismiss, true);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [open]);

  function remember(color: string) {
    const normalized = color.toLowerCase();
    setPalette((current) => {
      if (
        current.length >= 16 ||
        current.some((item) => item.toLowerCase() === normalized)
      )
        return current;
      const next = [...current, normalized];
      savePalette(next);
      return next;
    });
  }

  function choose(color: string) {
    setDraft(null);
    setInput(null);
    onChange(color);
  }

  function commitInput() {
    if (input === null) return;
    const next = input.trim();
    if (!next) {
      onChange("");
    } else if (HEX.test(next)) {
      choose(next);
    }
    setInput(null);
  }

  return (
    <div className="puck-field puck-color-field">
      <label className="puck-field__label" htmlFor={id}>
        {label}
      </label>
      <div className="puck-field__row">
        <button
          ref={triggerRef}
          type="button"
          className="puck-field__swatch"
          style={{ background: external || undefined }}
          data-empty={external ? undefined : ""}
          aria-label={`Choose ${label.toLowerCase()}`}
          aria-expanded={open}
          aria-haspopup="dialog"
          disabled={readOnly}
          onClick={() => {
            setPalette(readPalette());
            setOpen((current) => !current);
          }}
        />
        <input
          type="text"
          id={id}
          className="puck-field__input puck-field__input--mono"
          value={input ?? external}
          placeholder="Transparent"
          disabled={readOnly}
          spellCheck={false}
          onChange={(event) => setInput(event.target.value)}
          onBlur={commitInput}
          onKeyDown={(event) => {
            if (event.key === "Enter") event.currentTarget.blur();
            if (event.key === "Escape") {
              setInput(null);
              event.currentTarget.blur();
            }
          }}
        />
      </div>
      {open &&
        position &&
        createPortal(
          <div
            ref={paletteRef}
            role="dialog"
            aria-label={`${label} colors`}
            className="puck-color-picker"
            style={position}
          >
            <HexColorPicker
              color={draft ?? (external || "#ffffff")}
              onChange={setDraft}
              onChangeEnd={choose}
              aria-label={`${label} color`}
            />
            <div
              className="puck-color-picker__presets"
              aria-label="Saved colors"
            >
              {palette.map((color) => (
                <span className="puck-color-picker__preset" key={color}>
                  <button
                    type="button"
                    aria-label={`Use ${color}`}
                    aria-pressed={
                      external.toLowerCase() === color.toLowerCase()
                    }
                    style={{ backgroundColor: color }}
                    onClick={() => choose(color)}
                  />
                  <button
                    type="button"
                    className="puck-color-picker__remove"
                    aria-label={`Remove ${color} from saved colors`}
                    onClick={() => {
                      const next = palette.filter((item) => item !== color);
                      setPalette(next);
                      savePalette(next);
                    }}
                  >
                    <X className="size-2.5" />
                  </button>
                </span>
              ))}
              <button
                type="button"
                aria-label="Save current color"
                title="Save current color"
                disabled={
                  !external ||
                  palette.length >= 16 ||
                  palette.some(
                    (color) => color.toLowerCase() === external.toLowerCase(),
                  )
                }
                onClick={() => remember(external)}
                className="puck-color-picker__add"
              >
                <Plus className="size-3.5" />
              </button>
            </div>
            <button
              type="button"
              className="puck-color-picker__clear"
              onClick={() => {
                setInput(null);
                onChange("");
              }}
            >
              Clear
            </button>
          </div>,
          document.body,
        )}
    </div>
  );
}
