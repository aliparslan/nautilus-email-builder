import type { ComponentConfig } from "@puckeditor/core";
import { Hr } from "@react-email/components";
import { colorField } from "../fields/color";
import { pxField } from "../fields/shared";

export type DividerProps = {
  color: string;
  thickness: number;
  marginY: number;
};

export const Divider: ComponentConfig<DividerProps> = {
  label: "Divider",
  fields: {
    color: colorField("Color"),
    thickness: pxField("Thickness", { min: 1, max: 8 }),
    marginY: pxField("Space above & below", { max: 96 }),
  },
  defaultProps: { color: "#eaedf1", thickness: 1, marginY: 16 },
  render: ({ color, thickness, marginY }) => (
    <Hr
      style={{
        border: "none",
        borderTop: `${thickness}px solid ${color}`,
        margin: `${marginY}px 0`,
      }}
    />
  ),
};
