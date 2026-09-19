import type { ComponentConfig } from "@puckeditor/core";
import { pxField } from "../fields/shared";

export type SpacerProps = { height: number };

export const Spacer: ComponentConfig<SpacerProps> = {
  label: "Spacer",
  fields: { height: pxField("Height", { min: 4, max: 200 }) },
  defaultProps: { height: 24 },
  // A table cell with explicit height is the only spacer Outlook honours.
  render: ({ height }) => (
    <table
      role="presentation"
      width="100%"
      cellPadding={0}
      cellSpacing={0}
      border={0}
    >
      <tbody>
        <tr>
          <td style={{ height, lineHeight: `${height}px`, fontSize: 1 }}>
            &nbsp;
          </td>
        </tr>
      </tbody>
    </table>
  ),
};
