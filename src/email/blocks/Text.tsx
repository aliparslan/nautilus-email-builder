import type { ComponentConfig, RichText } from "@puckeditor/core";
import { colorField } from "../fields/color";
import { alignField, pxField, type Align } from "../fields/shared";

export type TextProps = {
  content: RichText;
  fontSize: number;
  lineHeight: number;
  color: string;
  align: Align;
  marginBottom: number;
};

/**
 * Rich text block. Puck stores the TipTap output as an HTML string and hands the render a
 * ReactNode containing <p>/<a>/<ul> markup, so this wraps it in a styled <div> rather than
 * React Email's <Text> (which is itself a <p> and would nest invalidly). Inner element
 * typography comes from the root stylesheet, see styles.ts.
 */
export const Text: ComponentConfig<TextProps> = {
  label: "Text",
  fields: {
    content: {
      type: "richtext",
      label: "Content",
      contentEditable: true,
      options: {
        // Structural elements have dedicated blocks; keep rich text to inline formatting + lists.
        heading: false,
        blockquote: false,
        code: false,
        codeBlock: false,
        horizontalRule: false,
        textAlign: false,
      },
    },
    fontSize: pxField("Font size", { min: 10, max: 40 }),
    lineHeight: {
      type: "number",
      label: "Line height",
      min: 1,
      max: 2.5,
      step: 0.1,
    },
    color: colorField("Color"),
    align: alignField,
    marginBottom: pxField("Space below", { max: 96 }),
  },
  defaultProps: {
    content: "<p>Write something worth reading.</p>",
    fontSize: 16,
    lineHeight: 1.6,
    color: "#29292e",
    align: "left",
    marginBottom: 16,
  },
  render: ({ content, fontSize, lineHeight, color, align, marginBottom }) => (
    <div
      style={{ fontSize, lineHeight, color, textAlign: align, marginBottom }}
    >
      {content}
    </div>
  ),
};
