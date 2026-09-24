import type { CustomField, NumberField } from "@puckeditor/core";
import { AlignCenter, AlignLeft, AlignRight } from "lucide-react";

export type Align = "left" | "center" | "right";

export type Padding = {
  top: number;
  right: number;
  bottom: number;
  left: number;
};

export const alignField: CustomField<Align> = {
  type: "custom",
  label: "Align",
  render: ({ value, onChange, readOnly }) => (
    <div>
      <div
        role="group"
        aria-label="Alignment"
        className="flex gap-1 rounded-lg border border-divide bg-gray-50 p-1 dark:border-neutral-700 dark:bg-neutral-900"
      >
        {(
          [
            ["left", AlignLeft],
            ["center", AlignCenter],
            ["right", AlignRight],
          ] as const
        ).map(([align, Icon]) => (
          <button
            key={align}
            type="button"
            aria-label={`Align ${align}`}
            aria-pressed={value === align}
            disabled={readOnly}
            onClick={() => onChange(align)}
            className={`flex h-8 flex-1 items-center justify-center rounded-md focus-visible:outline-2 focus-visible:outline-brand ${value === align ? "bg-white text-brand shadow-sm dark:bg-neutral-700" : "text-charcoal-800 hover:bg-white dark:text-neutral-300 dark:hover:bg-neutral-800"}`}
          >
            <Icon className="size-4" strokeWidth={1.8} />
          </button>
        ))}
      </div>
    </div>
  ),
};

export function pxField(
  label: string,
  opts: Partial<NumberField> = {},
): CustomField<number> {
  return numberField(label, { min: 0, step: 1, ...opts }, "px");
}

/**
 * Puck's controlled number field publishes every keystroke. That makes a value
 * such as 600 difficult to replace because the document rerenders after the
 * first digit. Keep the in-progress string local, then publish once on blur or
 * Enter so the entire value can be selected and replaced normally.
 */
export function numberField(
  label: string,
  opts: Partial<NumberField> = {},
  suffix?: string,
): CustomField<number> {
  const { min, max, step = 1 } = opts;
  return {
    type: "custom",
    label,
    render: (props) => (
      <NumericField
        key={String(props.value ?? "")}
        {...props}
        label={label}
        min={min}
        max={max}
        step={step}
        suffix={suffix}
      />
    ),
  };
}

type NumericFieldProps = {
  label: string;
  value: number;
  onChange: (value: number) => void;
  readOnly?: boolean;
  id?: string;
  min?: number;
  max?: number;
  step: number;
  suffix?: string;
};

function NumericField({
  label,
  value,
  onChange,
  readOnly,
  id,
  min,
  max,
  step,
  suffix,
}: NumericFieldProps) {
  const external = Number.isFinite(value) ? value : (min ?? 0);

  function commit(input: HTMLInputElement) {
    const parsed = Number(input.value);
    if (!Number.isFinite(parsed)) {
      input.value = String(external);
      return;
    }
    const bounded = Math.min(max ?? Infinity, Math.max(min ?? -Infinity, parsed));
    const precision = String(step).split(".")[1]?.length ?? 0;
    const normalized = Number(bounded.toFixed(precision));
    input.value = String(normalized);
    if (normalized !== external) onChange(normalized);
  }

  return (
    <div className="puck-field">
      <label className="puck-field__label" htmlFor={id}>
        {label}
      </label>
      <div className="puck-number-field">
        <input
          id={id}
          type="text"
          inputMode={step < 1 ? "decimal" : "numeric"}
          className="puck-field__input puck-field__input--mono"
          defaultValue={external}
          disabled={readOnly}
          onFocus={(event) => event.currentTarget.select()}
          onBlur={(event) => commit(event.currentTarget)}
          onKeyDown={(event) => {
            if (event.key === "Enter") event.currentTarget.blur();
            if (event.key === "Escape") {
              event.currentTarget.value = String(external);
              event.currentTarget.blur();
            }
            if (event.key === "ArrowUp" || event.key === "ArrowDown") {
              event.preventDefault();
              const current = Number(event.currentTarget.value);
              const next =
                (Number.isFinite(current) ? current : external) +
                (event.key === "ArrowUp" ? step : -step);
              event.currentTarget.value = String(next);
            }
          }}
        />
        {suffix && <span aria-hidden="true">{suffix}</span>}
      </div>
    </div>
  );
}

export const paddingField: CustomField<Padding> = {
  type: "custom",
  label: "Padding",
  render: ({ value, onChange, readOnly }) => (
    <div className="puck-padding-field">
      <div className="puck-field__label">Padding</div>
      <div className="puck-padding-field__grid">
        {(["top", "right", "bottom", "left"] as const).map((side) => (
          <NumericField
            key={`${side}-${value?.[side] ?? 0}`}
            label={side[0].toUpperCase() + side.slice(1)}
            value={value?.[side] ?? 0}
            onChange={(next) => onChange({ ...padding(0), ...value, [side]: next })}
            readOnly={readOnly}
            step={1}
            min={0}
            suffix="px"
          />
        ))}
      </div>
    </div>
  ),
};

export function padding(
  top: number,
  right = top,
  bottom = top,
  left = right,
): Padding {
  return { top, right, bottom, left };
}

export function paddingStyle(p: Padding) {
  return {
    paddingTop: p.top,
    paddingRight: p.right,
    paddingBottom: p.bottom,
    paddingLeft: p.left,
  };
}
