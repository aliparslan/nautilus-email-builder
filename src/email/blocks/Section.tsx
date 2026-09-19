import type { ComponentConfig, Slot } from "@puckeditor/core";
import { Column, Row, Section as EmailSection } from "@react-email/components";
import { colorField } from "../fields/color";
import {
  padding,
  paddingField,
  paddingStyle,
  type Padding,
} from "../fields/shared";

export type SectionProps = {
  backgroundColor: string;
  padding: Padding;
  children: Slot;
};

export const Section: ComponentConfig<SectionProps> = {
  label: "Section",
  fields: {
    backgroundColor: colorField("Background"),
    padding: paddingField,
    children: { type: "slot" },
  },
  defaultProps: {
    backgroundColor: "",
    padding: padding(24, 32),
    children: [],
  },
  // Padding lives on the <td>: Outlook (and any table with border-collapse) ignores padding on <table>.
  render: ({ backgroundColor, padding, children: Children }) => (
    <EmailSection style={{ backgroundColor: backgroundColor || undefined }}>
      <Row>
        <Column style={paddingStyle(padding)}>
          <Children minEmptyHeight={64} />
        </Column>
      </Row>
    </EmailSection>
  ),
};
