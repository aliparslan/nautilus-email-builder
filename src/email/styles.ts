/**
 * Stylesheet emitted by the email root as a <style> tag. It exists for three reasons:
 *
 * 1. Rich text (from Puck's TipTap field) arrives as raw <p>/<a>/<ul> markup with no
 *    inline styles, so this is where it gets its typography.
 * 2. Font-family must reach every text element for Outlook, which doesn't inherit
 *    reliably across table cells.
 * 3. Web fonts and the page background must be identical in the editor canvas and the
 *    sent email, and only the root knows which font/background is selected.
 *
 * Because the root render emits it, the exact same CSS is active in the editor canvas
 * and in the rendered email. At send time `juice` inlines these rules onto elements so
 * clients that strip <style> tags still render correctly; @font-face is preserved as-is.
 *
 * Rules are deliberately unlayered so they take precedence over Tailwind's @layer base
 * reset, which Puck copies into the canvas iframe. The table rule exists purely to undo
 * that reset (`border-collapse: collapse`) so the canvas matches real email clients.
 */
export const EMAIL_ROOT_CLASS = "email-root";
export const EMAIL_COLUMN_CLASS = "email-col";

export type EmailCssOptions = {
  fontFamily: string;
  linkColor: string;
  backgroundColor: string;
  webFont?: { name: string; url: string };
};

export function emailCss({
  fontFamily,
  linkColor,
  backgroundColor,
  webFont,
}: EmailCssOptions): string {
  const r = `.${EMAIL_ROOT_CLASS}`;
  // No quotes anywhere: React escapes them to entities inside <style>, which breaks CSS parsing.
  const fontFace = webFont
    ? `@font-face { font-family: ${webFont.name}; font-style: normal; font-weight: 100 900; font-display: swap; src: url(${webFont.url}); }`
    : "";

  return `
${fontFace}
body { margin: 0; padding: 0; background-color: ${backgroundColor}; }
${r} table { border-collapse: separate; border-spacing: 0; }
${r}, ${r} td, ${r} p, ${r} h1, ${r} h2, ${r} h3, ${r} a, ${r} li, ${r} span { font-family: ${fontFamily}; }
${r} .rich-text p { margin: 0 0 12px 0; }
${r} .rich-text p:last-child { margin-bottom: 0; }
${r} .rich-text ul { list-style: disc; margin: 0 0 12px 0; padding: 0 0 0 24px; }
${r} .rich-text ol { list-style: decimal; margin: 0 0 12px 0; padding: 0 0 0 24px; }
${r} .rich-text li { margin: 0 0 4px 0; }
${r} .rich-text li p { margin: 0; }
${r} .rich-text a { color: ${linkColor}; text-decoration: underline; }
${r} .rich-text strong { font-weight: 700; }
${r} .rich-text em { font-style: italic; }
${r} .rich-text u { text-decoration: underline; }
${r} .rich-text s { text-decoration: line-through; }
@media only screen and (max-width: 600px) {
  ${r} .${EMAIL_COLUMN_CLASS} { display: block !important; width: 100% !important; padding-left: 0 !important; padding-right: 0 !important; }
}
`.trim();
}
