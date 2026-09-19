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
    src: imageField("Image"),
    alt: { type: "text", label: "Alt text" },
    width: pxField("Width", { min: 16, max: 600 }),
    borderRadius: pxField("Corner radius", { max: 48 }),
    href: {
      type: "text",
      label: "Link URL (optional)",
      placeholder: "https://",
    },
    align: alignField,
    marginBottom: pxField("Space below", { max: 96 }),
  },
  defaultProps: {
    src: "https://www.nautilus.co/nautilus-logo.png",
    alt: "Nautilus",
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
