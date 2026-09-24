import type { ComponentConfig } from "@puckeditor/core";
import { Button as EmailButton, Column, Row } from "@react-email/components";
import { colorField } from "../fields/color";
import {
  alignField,
  padding,
  paddingField,
  paddingStyle,
  pxField,
  type Align,
  type Padding,
} from "../fields/shared";

export type ButtonProps = {
  text: string;
  href: string;
  backgroundColor: string;
  color: string;
  fontSize: number;
  borderRadius: number;
  padding: Padding;
  align: Align;
  marginBottom: number;
};

export const Button: ComponentConfig<ButtonProps> = {
  label: "Button",
  fields: {
    align: alignField,
    text: { type: "text", label: "Label", contentEditable: true },
    href: { type: "text", label: "Link URL", placeholder: "https://" },
    backgroundColor: colorField("Background"),
    color: colorField("Text color"),
    fontSize: pxField("Font size", { min: 10, max: 32 }),
    borderRadius: pxField("Corner radius", { max: 40 }),
    padding: paddingField,
    marginBottom: pxField("Space below", { max: 96 }),
  },
  defaultProps: {
    text: "Get started",
    href: "https://",
    backgroundColor: "#05b2df",
    color: "#ffffff",
    fontSize: 16,
    borderRadius: 12,
    padding: padding(12, 24),
    align: "left",
    marginBottom: 16,
  },
  render: ({
    text,
    href,
    backgroundColor,
    color,
    fontSize,
    borderRadius,
    padding,
    align,
    marginBottom,
  }) => (
    <Row style={{ marginBottom }}>
      <Column align={align} style={{ textAlign: align }}>
        <EmailButton
          href={href}
          style={{
            backgroundColor,
            color,
            fontSize,
            fontWeight: 600,
            lineHeight: 1.2,
            borderRadius,
            textDecoration: "none",
            ...paddingStyle(padding),
          }}
        >
          {text}
        </EmailButton>
      </Column>
    </Row>
  ),
};
