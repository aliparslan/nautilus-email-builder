import type { CustomField } from "@puckeditor/core";

const HEX = /^#([0-9a-f]{3}|[0-9a-f]{6})$/i;

/**
 * Puck has no built-in color field. This one pairs a native swatch with a hex input.
 * An empty value means "transparent" so backgrounds can be cleared.
 *
 * Deliberately avoids Puck runtime imports (e.g. FieldLabel) so the email config stays
 * importable from server code; styling lives in globals.css under `.puck-field`.
 */
export function colorField(label: string): CustomField<string> {
  return {
    type: "custom",
    label,
    render: ({ value, onChange, readOnly, id }) => {
      const hex = HEX.test(value) ? value : "";
      return (
        <div className="puck-field">
          <div className="puck-field__label">{label}</div>
          <div className="puck-field__row">
            <label
              className="puck-field__swatch"
              style={{ background: hex || undefined }}
              data-empty={hex ? undefined : ""}
              aria-label={`${label} swatch`}
            >
              <input
                type="color"
                id={id}
                value={hex || "#ffffff"}
                disabled={readOnly}
                onChange={(e) => onChange(e.target.value)}
              />
            </label>
            <input
              type="text"
              className="puck-field__input puck-field__input--mono"
              value={value ?? ""}
              placeholder="Transparent"
              disabled={readOnly}
              spellCheck={false}
              onChange={(e) => onChange(e.target.value.trim())}
            />
          </div>
        </div>
      );
    },
  };
}
