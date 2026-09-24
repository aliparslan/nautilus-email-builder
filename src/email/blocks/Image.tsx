import type { ComponentConfig } from "@puckeditor/core";
import { Column, Img, Link, Row } from "@react-email/components";
import { imageField } from "../fields/image";
import { alignField, pxField, type Align } from "../fields/shared";

export type ImageProps = {
  src: string;
  alt: string;
  width: number;
  borderRadius: number;
  href: string;
  align: Align;
  marginBottom: number;
};

export const Image: ComponentConfig<ImageProps> = {
  label: "Image",
  fields: {
    align: alignField,
    src: imageField("Image"),
    alt: { type: "text", label: "Alt text" },
    width: pxField("Width", { min: 16, max: 600 }),
    borderRadius: pxField("Corner radius", { max: 48 }),
    href: {
      type: "text",
      label: "Link URL (optional)",
      placeholder: "https://",
    },
    marginBottom: pxField("Space below", { max: 96 }),
  },
  defaultProps: {
    src: "https://cdn.bfldr.com/PENMAIHR/at/7n74b4hw42nr59f6wk46xkj/Mister_Logo-23-BlueYellow-RGB.png?format=png&width=450&height=153",
    alt: "Mister Car Wash",
    width: 160,
    borderRadius: 0,
    href: "",
    align: "left",
    marginBottom: 16,
  },
  render: ({ src, alt, width, borderRadius, href, align, marginBottom }) => {
    const img = (
      <Img
        src={src}
        alt={alt}
        width={width}
        style={{
          width,
          maxWidth: "100%",
          height: "auto",
          borderRadius,
          display: "inline-block",
        }}
      />
    );
    return (
      <Row style={{ marginBottom }}>
        <Column align={align} style={{ textAlign: align }}>
          {href ? <Link href={href}>{img}</Link> : img}
        </Column>
      </Row>
    );
  },
};
