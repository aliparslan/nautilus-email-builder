import type { ComponentConfig } from "@puckeditor/core";
import { Heading as EmailHeading } from "@react-email/components";
import { colorField } from "../fields/color";
import { alignField, pxField, type Align } from "../fields/shared";

type Level = "h1" | "h2" | "h3";

export type HeadingProps = {
  text: string;
  level: Level;
  fontSize: number;
  fontWeight: 400 | 600 | 700;
  color: string;
  align: Align;
  marginBottom: number;
};

const DEFAULT_SIZE: Record<Level, number> = { h1: 32, h2: 24, h3: 18 };

export const Heading: ComponentConfig<HeadingProps> = {
  label: "Heading",
  fields: {
    text: { type: "text", label: "Text", contentEditable: true },
    level: {
      type: "select",
      label: "Level",
      options: [
        { label: "Heading 1", value: "h1" },
        { label: "Heading 2", value: "h2" },
        { label: "Heading 3", value: "h3" },
      ],
    },
    fontSize: pxField("Font size", { min: 10, max: 72 }),
    fontWeight: {
      type: "select",
      label: "Weight",
      options: [
        { label: "Regular", value: 400 },
        { label: "Semibold", value: 600 },
        { label: "Bold", value: 700 },
      ],
    },
    color: colorField("Color"),
    align: alignField,
    marginBottom: pxField("Space below", { max: 96 }),
  },
  defaultProps: {
    text: "Heading",
    level: "h2",
    fontSize: DEFAULT_SIZE.h2,
    fontWeight: 700,
    color: "#202020",
    align: "left",
    marginBottom: 12,
  },
  // Changing the level snaps the size to that level's default, so the select feels like a real heading picker.
  resolveData: ({ props }, { changed, lastData }) => {
    if (changed.level && lastData && lastData.props.level !== props.level) {
      return { props: { ...props, fontSize: DEFAULT_SIZE[props.level] } };
    }
    return { props };
  },
  render: ({
    text,
    level,
    fontSize,
    fontWeight,
    color,
    align,
    marginBottom,
  }) => (
    <EmailHeading
      as={level}
      style={{
        fontSize,
        fontWeight,
        lineHeight: 1.2,
        color,
        textAlign: align,
        margin: 0,
        marginBottom,
        letterSpacing: fontSize >= 24 ? "-0.02em" : undefined,
      }}
    >
      {text}
    </EmailHeading>
  ),
};
