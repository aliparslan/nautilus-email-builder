import type { ComponentConfig, Slot } from "@puckeditor/core";
import {
  Column,
  Container as EmailContainer,
  Row,
} from "@react-email/components";
import { colorField } from "../fields/color";
import {
  padding,
  paddingField,
  paddingStyle,
  pxField,
  type Padding,
} from "../fields/shared";

export type ContainerProps = {
  backgroundColor: string;
  borderColor: string;
  borderWidth: number;
  borderRadius: number;
  padding: Padding;
  children: Slot;
};

/** A bordered/filled box for grouping content inside a section, e.g. a plan summary card. */
export const Container: ComponentConfig<ContainerProps> = {
  label: "Card",
  fields: {
    backgroundColor: colorField("Background"),
    borderColor: colorField("Border color"),
    borderWidth: pxField("Border width", { max: 8 }),
    borderRadius: pxField("Corner radius", { max: 32 }),
    padding: paddingField,
    children: { type: "slot" },
  },
  defaultProps: {
    backgroundColor: "#f9fafb",
    borderColor: "#eaedf1",
    borderWidth: 1,
    borderRadius: 12,
    padding: padding(20),
    children: [],
  },
  render: ({
    backgroundColor,
    borderColor,
    borderWidth,
    borderRadius,
    padding,
    children: Children,
  }) => (
    <EmailContainer
      style={{
        maxWidth: "100%",
        backgroundColor: backgroundColor || undefined,
        border:
          borderWidth > 0 && borderColor
            ? `${borderWidth}px solid ${borderColor}`
            : undefined,
        borderRadius,
      }}
    >
      <Row>
        <Column style={paddingStyle(padding)}>
          <Children minEmptyHeight={48} />
        </Column>
      </Row>
    </EmailContainer>
  ),
};
