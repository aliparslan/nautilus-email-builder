import {
  Body,
  Head,
  Html,
  Preview,
  render,
  toPlainText,
} from "@react-email/components";
import juice from "juice";
import type { EmailData } from "./config";
import { EmailTree } from "./render-tree";
import { DEFAULT_ROOT_PROPS } from "./root";

export type RenderedEmail = {
  html: string;
  text: string;
  subject: string;
};

/**
 * Wraps the Puck document in the <Html>/<Head>/<Body> shell the editor canvas can't render.
 * Fonts, background and typography all come from the root's own stylesheet so nothing
 * here can drift from the canvas.
 */
export function EmailDocument({ data }: { data: EmailData }) {
  const root = { ...DEFAULT_ROOT_PROPS, ...data.root.props };

  return (
    <Html lang="en">
      <Head />
      <Body
        style={{ margin: 0, padding: 0, backgroundColor: root.backgroundColor }}
      >
        {root.previewText && <Preview>{root.previewText}</Preview>}
        <EmailTree data={data} />
      </Body>
    </Html>
  );
}

/**
 * The single render path used for both preview and send, so the two can't drift.
 * `juice` inlines the root stylesheet onto elements for clients that strip <style>,
 * keeping @font-face and @media rules in place.
 */
export async function renderEmail(data: EmailData): Promise<RenderedEmail> {
  const raw = await render(<EmailDocument data={data} />);
  const html = juice(raw, {
    removeStyleTags: true,
    preserveMediaQueries: true,
    preserveFontFaces: true,
  });

  return {
    html,
    text: toPlainText(raw),
    subject: data.root.props?.subject?.trim() ?? "",
  };
}
