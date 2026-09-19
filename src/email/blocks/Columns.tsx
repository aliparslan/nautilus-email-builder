import type { ComponentConfig, Slot } from "@puckeditor/core";
import { Column, Row } from "@react-email/components";
import { pxField } from "../fields/shared";
import { EMAIL_COLUMN_CLASS } from "../styles";

type Layout = "50-50" | "33-67" | "67-33" | "33-33-33";

export type ColumnsProps = {
  layout: Layout;
  gap: number;
  col1: Slot;
  col2: Slot;
  col3: Slot;
};

const WIDTHS: Record<Layout, number[]> = {
  "50-50": [50, 50],
  "33-67": [33.33, 66.67],
  "67-33": [66.67, 33.33],
  "33-33-33": [33.33, 33.33, 33.34],
};

export const Columns: ComponentConfig<ColumnsProps> = {
  label: "Columns",
  fields: {
    layout: {
      type: "select",
      label: "Layout",
      options: [
        { label: "Two columns · 1 : 1", value: "50-50" },
        { label: "Two columns · 1 : 2", value: "33-67" },
        { label: "Two columns · 2 : 1", value: "67-33" },
        { label: "Three columns", value: "33-33-33" },
      ],
    },
    gap: pxField("Gap", { max: 64 }),
    col1: { type: "slot", label: "Column 1" },
    col2: { type: "slot", label: "Column 2" },
    col3: { type: "slot", label: "Column 3" },
  },
  defaultProps: { layout: "50-50", gap: 24, col1: [], col2: [], col3: [] },
  resolveFields: ({ props }, { fields }) => ({
    ...fields,
    col3: { ...fields.col3, visible: props.layout === "33-33-33" },
  }),
  render: ({ layout, gap, col1: Col1, col2: Col2, col3: Col3 }) => {
    const widths = WIDTHS[layout] ?? WIDTHS["50-50"];
    const slots = [Col1, Col2, Col3].slice(0, widths.length);
    return (
      <Row>
        {slots.map((Slot, i) => (
          <Column
            key={i}
            className={EMAIL_COLUMN_CLASS}
            style={{
              width: `${widths[i]}%`,
              verticalAlign: "top",
              paddingLeft: i === 0 ? 0 : gap / 2,
              paddingRight: i === slots.length - 1 ? 0 : gap / 2,
            }}
          >
            <Slot minEmptyHeight={48} />
          </Column>
        ))}
      </Row>
    );
  },
};
