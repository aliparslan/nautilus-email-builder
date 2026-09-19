import type { RootConfig } from "@puckeditor/core";
import { Column, Container, Row, Section } from "@react-email/components";
import { colorField } from "./fields/color";
import { pxField } from "./fields/shared";
import { emailFont, fontOptions, type EmailFontKey } from "./fonts";
import { EMAIL_ROOT_CLASS, emailCss } from "./styles";

export type EmailRootProps = {
  subject: string;
  previewText: string;
  fontFamily: EmailFontKey;
  backgroundColor: string;
  contentBackgroundColor: string;
  contentWidth: number;
  linkColor: string;
};

export const DEFAULT_ROOT_PROPS: EmailRootProps = {
  subject: "",
  previewText: "",
  fontFamily: "inter",
  backgroundColor: "#f5f5f5",
  contentBackgroundColor: "#ffffff",
  contentWidth: 600,
  linkColor: "#01b2de",
};

/**
 * The root is the email body: outer background, centered content column, and the
 * stylesheet every block relies on. <Html>/<Head> can't exist inside the editor canvas,
 * so those are added by EmailDocument at render time.
 */
export const emailRoot: RootConfig<EmailRootProps> = {
  fields: {
    subject: { type: "text", label: "Subject" },
    previewText: {
      type: "text",
      label: "Preview text",
      placeholder: "Shown after the subject in most inboxes",
    },
    fontFamily: { type: "select", label: "Font", options: fontOptions },
    backgroundColor: colorField("Page background"),
    contentBackgroundColor: colorField("Content background"),
    contentWidth: pxField("Content width", { min: 320, max: 800, step: 10 }),
    linkColor: colorField("Link color"),
  },
  defaultProps: DEFAULT_ROOT_PROPS,
  render: ({ children, ...props }) => {
    // Documents saved before a root field existed won't have it; fall back rather than emit "undefined".
    const {
      fontFamily,
      backgroundColor,
      contentBackgroundColor,
      contentWidth,
      linkColor,
    } = {
      ...DEFAULT_ROOT_PROPS,
      ...props,
    };
    const { stack, webFont } = emailFont(fontFamily);
    return (
      <>
        <style>
          {emailCss({ fontFamily: stack, linkColor, backgroundColor, webFont })}
        </style>
        <Section
          className={EMAIL_ROOT_CLASS}
          style={{ backgroundColor, fontFamily: stack }}
        >
          <Row>
            <Column style={{ padding: "32px 12px" }}>
              <Container
                style={{
                  maxWidth: contentWidth,
                  backgroundColor: contentBackgroundColor,
                }}
              >
                {children}
              </Container>
            </Column>
          </Row>
        </Section>
      </>
    );
  },
};
