import type { RootConfig } from "@puckeditor/core";
import { Column, Container, Row, Section } from "@react-email/components";
import { colorField } from "./fields/color";
import { pxField } from "./fields/shared";
import { emailFont, fontOptions, type EmailFontKey } from "./fonts";
import { EMAIL_ROOT_CLASS, emailCss } from "./styles";

export type EmailRootProps = {
  /** Internal draft name; never rendered in the email. */
  projectTitle: string;
  subject: string;
  previewText: string;
  fontFamily: EmailFontKey;
  backgroundColor: string;
  contentBackgroundColor: string;
  contentWidth: number;
  linkColor: string;
};

export const DEFAULT_ROOT_PROPS: EmailRootProps = {
  projectTitle: "Untitled email",
  subject: "",
  previewText: "",
  fontFamily: "inter",
  backgroundColor: "#f5f5f5",
  contentBackgroundColor: "#ffffff",
  contentWidth: 600,
  linkColor: "#05b2df",
};

/**
 * The root is the email body: outer background, centered content column, and the
 * stylesheet every block relies on. <Html>/<Head> can't exist inside the editor canvas,
 * so those are added by EmailDocument at render time.
 */
export const emailRoot: RootConfig<EmailRootProps> = {
  fields: {
    projectTitle: { type: "text", label: "Project title" },
    contentWidth: pxField("Email width", { min: 320, max: 800, step: 10 }),
    subject: { type: "text", label: "Email subject" },
    previewText: {
      type: "text",
      label: "Email preview text",
      placeholder: "Shown after the subject in most inboxes",
    },
    fontFamily: { type: "select", label: "Font", options: fontOptions },
    backgroundColor: colorField("Page background"),
    contentBackgroundColor: colorField("Content background"),
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
                className="email-content"
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
