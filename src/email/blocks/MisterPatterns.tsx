import type { ComponentConfig } from "@puckeditor/core";
import {
  Button,
  Column,
  Heading,
  Img,
  Row,
  Section,
  Text,
} from "@react-email/components";
import { misterAsset } from "@/brands/mister";
import { colorField } from "../fields/color";
import { padding, paddingField, paddingStyle, type Padding } from "../fields/shared";
import { EMAIL_COLUMN_CLASS } from "../styles";

const navy = "#173654";
const cyan = "#00b5ef";
const yellow = "#f8d31c";

export type MisterHeaderProps = {
  logo: string;
  linkText: string;
  linkHref: string;
  backgroundColor: string;
  padding: Padding;
};

export const MisterHeader: ComponentConfig<MisterHeaderProps> = {
  label: "Mister header",
  fields: {
    logo: { type: "text", label: "Logo URL" },
    linkText: { type: "text", label: "Link label", contentEditable: true },
    linkHref: { type: "text", label: "Link URL" },
    backgroundColor: colorField("Background"),
    padding: paddingField,
  },
  defaultProps: {
    logo: misterAsset("mister-logo-color").src,
    linkText: "Find a location",
    linkHref: "https://mistercarwash.com/locations/",
    backgroundColor: "#ffffff",
    padding: padding(20, 28),
  },
  render: ({ logo, linkText, linkHref, backgroundColor, padding: inset }) => (
    <Section style={{ backgroundColor }}>
      <Row>
        <Column style={paddingStyle(inset)}>
          <Img
            src={logo}
            alt="Mister Car Wash"
            width="150"
            style={{ display: "block", width: 150, maxWidth: "100%", height: "auto" }}
          />
        </Column>
        <Column align="right" style={{ ...paddingStyle(inset), paddingLeft: 0 }}>
          <a
            href={linkHref}
            style={{ color: navy, fontSize: 13, fontWeight: 600, textDecoration: "none" }}
          >
            {linkText} →
          </a>
        </Column>
      </Row>
    </Section>
  ),
};

export type MisterMembershipHeroProps = {
  image: string;
  eyebrow: string;
  heading: string;
  body: string;
  ctaText: string;
  ctaHref: string;
  backgroundColor: string;
};

export const MisterMembershipHero: ComponentConfig<MisterMembershipHeroProps> = {
  label: "Unlimited hero",
  fields: {
    image: { type: "text", label: "Image URL" },
    eyebrow: { type: "text", label: "Eyebrow", contentEditable: true },
    heading: { type: "text", label: "Heading", contentEditable: true },
    body: { type: "textarea", label: "Body", contentEditable: true },
    ctaText: { type: "text", label: "Button label", contentEditable: true },
    ctaHref: { type: "text", label: "Button URL" },
    backgroundColor: colorField("Background"),
  },
  defaultProps: {
    image: misterAsset("mister-tunnel").src,
    eyebrow: "UNLIMITED WASH CLUB®",
    heading: "A clean car whenever you want it.",
    body: "Wash every day at any Mister location with one simple monthly membership.",
    ctaText: "Explore Unlimited",
    ctaHref: "https://mistercarwash.com/unlimited-wash-club/",
    backgroundColor: navy,
  },
  render: ({ image, eyebrow, heading, body, ctaText, ctaHref, backgroundColor }) => (
    <Section style={{ backgroundColor }}>
      <Img
        src={image}
        alt="A vehicle in a Mister Car Wash tunnel"
        width="600"
        style={{ display: "block", width: "100%", maxWidth: "100%", height: "auto" }}
      />
      <Row>
        <Column style={{ padding: "30px 32px 34px" }}>
          <Text style={{ margin: "0 0 10px", color: yellow, fontSize: 12, fontWeight: 700, letterSpacing: "0.08em" }}>
            {eyebrow}
          </Text>
          <Heading as="h1" style={{ margin: "0 0 14px", color: "#ffffff", fontSize: 34, lineHeight: 1.12, letterSpacing: "-0.02em" }}>
            {heading}
          </Heading>
          <Text style={{ margin: "0 0 24px", color: "#eaf7fb", fontSize: 16, lineHeight: 1.55 }}>
            {body}
          </Text>
          <Button href={ctaHref} style={{ backgroundColor: cyan, color: "#ffffff", borderRadius: 10, padding: "13px 22px", fontSize: 15, fontWeight: 700, textDecoration: "none" }}>
            {ctaText}
          </Button>
        </Column>
      </Row>
    </Section>
  ),
};

export type MisterProductSpotlightProps = {
  image: string;
  eyebrow: string;
  heading: string;
  body: string;
  imageSide: "left" | "right";
  backgroundColor: string;
};

export const MisterProductSpotlight: ComponentConfig<MisterProductSpotlightProps> = {
  label: "Product spotlight",
  fields: {
    image: { type: "text", label: "Image URL" },
    eyebrow: { type: "text", label: "Eyebrow", contentEditable: true },
    heading: { type: "text", label: "Heading", contentEditable: true },
    body: { type: "textarea", label: "Body", contentEditable: true },
    imageSide: {
      type: "radio",
      label: "Image side",
      options: [
        { label: "Left", value: "left" },
        { label: "Right", value: "right" },
      ],
    },
    backgroundColor: colorField("Background"),
  },
  defaultProps: {
    image: misterAsset("mister-titanium").src,
    eyebrow: "SIGNATURE PRODUCT",
    heading: "Meet Titanium 360°",
    body: "All-around protection, underbody corrosion defense, water repellency, and a mirror-like finish.",
    imageSide: "left",
    backgroundColor: "#f2fbfe",
  },
  render: ({ image, eyebrow, heading, body, imageSide, backgroundColor }) => {
    const imageColumn = (
      <Column className={EMAIL_COLUMN_CLASS} style={{ width: "42%", verticalAlign: "middle" }}>
        <Img src={image} alt="Mister signature wash product" width="250" style={{ display: "block", width: "100%", height: "auto" }} />
      </Column>
    );
    const copyColumn = (
      <Column className={EMAIL_COLUMN_CLASS} style={{ width: "58%", padding: "26px 28px", verticalAlign: "middle" }}>
        <Text style={{ margin: "0 0 7px", color: cyan, fontSize: 11, fontWeight: 700, letterSpacing: "0.08em" }}>{eyebrow}</Text>
        <Heading as="h2" style={{ margin: "0 0 10px", color: navy, fontSize: 24, lineHeight: 1.18 }}>{heading}</Heading>
        <Text style={{ margin: 0, color: "#425c6c", fontSize: 14, lineHeight: 1.55 }}>{body}</Text>
      </Column>
    );
    return (
      <Section style={{ backgroundColor }}>
        <Row>{imageSide === "left" ? <>{imageColumn}{copyColumn}</> : <>{copyColumn}{imageColumn}</>}</Row>
      </Section>
    );
  },
};

export type MisterLocationCtaProps = {
  heading: string;
  body: string;
  ctaText: string;
  ctaHref: string;
  backgroundColor: string;
};

export const MisterLocationCta: ComponentConfig<MisterLocationCtaProps> = {
  label: "Location callout",
  fields: {
    heading: { type: "text", label: "Heading", contentEditable: true },
    body: { type: "textarea", label: "Body", contentEditable: true },
    ctaText: { type: "text", label: "Button label", contentEditable: true },
    ctaHref: { type: "text", label: "Button URL" },
    backgroundColor: colorField("Background"),
  },
  defaultProps: {
    heading: "Your nearest clean car is closer than you think.",
    body: "Find a Mister location, check hours, and get directions before you head out.",
    ctaText: "Find a location",
    ctaHref: "https://mistercarwash.com/locations/",
    backgroundColor: "#f7d719",
  },
  render: ({ heading, body, ctaText, ctaHref, backgroundColor }) => (
    <Section style={{ backgroundColor }}>
      <Row>
        <Column align="center" style={{ padding: "30px 32px 34px", textAlign: "center" }}>
          <Heading as="h2" style={{ margin: "0 auto 10px", maxWidth: 440, color: navy, fontSize: 26, lineHeight: 1.18 }}>{heading}</Heading>
          <Text style={{ margin: "0 auto 22px", maxWidth: 440, color: "#2e4c5e", fontSize: 15, lineHeight: 1.5 }}>{body}</Text>
          <Button href={ctaHref} style={{ backgroundColor: navy, color: "#ffffff", borderRadius: 10, padding: "13px 22px", fontSize: 15, fontWeight: 700, textDecoration: "none" }}>{ctaText}</Button>
        </Column>
      </Row>
    </Section>
  ),
};
