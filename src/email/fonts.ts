// Font names are deliberately unquoted: React escapes quotes inside style attributes
// as HTML entities, which breaks the CSS inliner at send time.
export const EMAIL_FONTS = {
  inter: {
    label: "Inter (modern sans)",
    stack:
      "Inter, -apple-system, BlinkMacSystemFont, Segoe UI, Helvetica, Arial, sans-serif",
    // Web font for clients that support it (Apple Mail, iOS Mail). Gmail falls back to the stack.
    webFont: {
      name: "Inter",
      url: "https://fonts.gstatic.com/s/inter/v20/UcC73FwrK3iLTeHuS_nVMrMxCp50SjIa1ZL7W0Q5nw.woff2",
    },
  },
  helvetica: {
    label: "Helvetica / Arial",
    stack: "Helvetica, Arial, sans-serif",
  },
  georgia: {
    label: "Georgia (serif)",
    stack: "Georgia, Times New Roman, serif",
  },
  verdana: {
    label: "Verdana",
    stack: "Verdana, Geneva, sans-serif",
  },
  trebuchet: {
    label: "Trebuchet MS",
    stack: "Trebuchet MS, Helvetica, sans-serif",
  },
} as const;

export type EmailFontKey = keyof typeof EMAIL_FONTS;

export const fontOptions = (
  Object.entries(EMAIL_FONTS) as [
    EmailFontKey,
    (typeof EMAIL_FONTS)[EmailFontKey],
  ][]
).map(([value, { label }]) => ({ label, value }));

export function emailFont(key: EmailFontKey | undefined) {
  const font = EMAIL_FONTS[key ?? "inter"] ?? EMAIL_FONTS.inter;
  return {
    stack: font.stack,
    webFont: "webFont" in font ? font.webFont : undefined,
  };
}
