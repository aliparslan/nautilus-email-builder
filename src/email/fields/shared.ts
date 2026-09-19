import type { NumberField, ObjectField, RadioField } from "@puckeditor/core";

export type Align = "left" | "center" | "right";

export type Padding = {
  top: number;
  right: number;
  bottom: number;
  left: number;
};

export const alignField: RadioField = {
  type: "radio",
  label: "Align",
  options: [
    { label: "Left", value: "left" },
    { label: "Center", value: "center" },
    { label: "Right", value: "right" },
  ],
};

export function pxField(
  label: string,
  opts: Partial<NumberField> = {},
): NumberField {
  return { type: "number", label, min: 0, step: 1, ...opts };
}

export const paddingField: ObjectField<Padding> = {
  type: "object",
  label: "Padding",
  objectFields: {
    top: pxField("Top"),
    right: pxField("Right"),
    bottom: pxField("Bottom"),
    left: pxField("Left"),
  },
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
