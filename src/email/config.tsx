import type { Config, Data } from "@puckeditor/core";
import { Button, type ButtonProps } from "./blocks/Button";
import { Columns, type ColumnsProps } from "./blocks/Columns";
import { Container, type ContainerProps } from "./blocks/Container";
import { Divider, type DividerProps } from "./blocks/Divider";
import { Heading, type HeadingProps } from "./blocks/Heading";
import { Image, type ImageProps } from "./blocks/Image";
import {
  MisterHeader,
  type MisterHeaderProps,
  MisterLocationCta,
  type MisterLocationCtaProps,
  MisterMembershipHero,
  type MisterMembershipHeroProps,
  MisterProductSpotlight,
  type MisterProductSpotlightProps,
} from "./blocks/MisterPatterns";
import { Section, type SectionProps } from "./blocks/Section";
import { Spacer, type SpacerProps } from "./blocks/Spacer";
import { Text, type TextProps } from "./blocks/Text";
import { emailRoot, type EmailRootProps } from "./root";

export type { EmailRootProps };

export type EmailComponents = {
  Section: SectionProps;
  Container: ContainerProps;
  Columns: ColumnsProps;
  Heading: HeadingProps;
  Text: TextProps;
  Button: ButtonProps;
  Image: ImageProps;
  Divider: DividerProps;
  Spacer: SpacerProps;
  MisterHeader: MisterHeaderProps;
  MisterMembershipHero: MisterMembershipHeroProps;
  MisterProductSpotlight: MisterProductSpotlightProps;
  MisterLocationCta: MisterLocationCtaProps;
};

export type EmailConfig = Config<{
  components: EmailComponents;
  root: EmailRootProps;
  categories: ["layout", "content", "patterns"];
}>;

/** Puck `Data` for an email document. This JSON is the single source of truth for editor, preview, and send. */
export type EmailData = Data<EmailComponents, EmailRootProps>;

/** The editor and server renderer share these block render functions. */
export const emailConfig: EmailConfig = {
  root: emailRoot,
  categories: {
    layout: {
      title: "Layout",
      components: ["Section", "Columns", "Container", "Spacer", "Divider"],
    },
    content: {
      title: "Content",
      components: ["Heading", "Text", "Button", "Image"],
    },
    patterns: {
      title: "Patterns",
      components: [
        "MisterHeader",
        "MisterMembershipHero",
        "MisterProductSpotlight",
        "MisterLocationCta",
      ],
    },
  },
  components: {
    Section,
    Columns,
    Container,
    Heading,
    Text,
    Button,
    Image,
    Divider,
    Spacer,
    MisterHeader,
    MisterMembershipHero,
    MisterProductSpotlight,
    MisterLocationCta,
  },
};
