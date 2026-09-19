export type InlineAttachment = {
  filename: string;
  content: string;
  contentType: string;
  contentId: string;
};

const DATA_IMG_SRC = /src="data:(image\/[a-z+.-]+);base64,([^"]+)"/gi;

/**
 * Uploaded images live in the document as data URLs (fine for the canvas and preview), but
 * Gmail and Outlook refuse data URIs in email. Swap them for `cid:` references and return the
 * bytes as inline attachments, which every major client renders.
 */
export function extractInlineImages(html: string): {
  html: string;
  attachments: InlineAttachment[];
} {
  const attachments: InlineAttachment[] = [];
  const seen = new Map<string, string>();

  const out = html.replace(
    DATA_IMG_SRC,
    (_match, contentType: string, base64: string) => {
      let cid = seen.get(base64);
      if (!cid) {
        cid = `img-${attachments.length + 1}@nautilus-email`;
        seen.set(base64, cid);
        attachments.push({
          filename: `image-${attachments.length + 1}.${extensionFor(contentType)}`,
          content: base64,
          contentType,
          contentId: cid,
        });
      }
      return `src="cid:${cid}"`;
    },
  );

  return { html: out, attachments };
}

function extensionFor(contentType: string): string {
  const subtype = contentType.split("/")[1] ?? "png";
  return subtype === "jpeg" ? "jpg" : subtype.replace("+xml", "");
}
