import { padding } from "../fields/shared";
import { block, document } from "./block";

const LOGO = "https://cdn.bfldr.com/PENMAIHR/at/7n74b4hw42nr59f6wk46xkj/Mister_Logo-23-BlueYellow-RGB.png?format=png&width=450&height=153";

export const promo = document(
  {
    subject: "Upgrade to Titanium, first month on us",
    previewText: "Spring pollen doesn't stand a chance. Offer ends Sunday.",
    backgroundColor: "#0a1f3d",
    contentBackgroundColor: "#ffffff",
  },
  [
    block("Section", "hero", {
      backgroundColor: "#033148",
      padding: padding(40, 32, 36),
      children: [
        block("Image", "logo", {
          src: LOGO,
          alt: "Mister Car Wash",
          width: 130,
          align: "center",
          marginBottom: 28,
        }),
        block("Text", "eyebrow", {
          content: "<p>MEMBERS ONLY · ENDS SUNDAY</p>",
          fontSize: 12,
          color: "#66d1ec",
          align: "center",
          marginBottom: 12,
        }),
        block("Heading", "title", {
          text: "Upgrade to Titanium. First month on us.",
          level: "h1",
          fontSize: 34,
          color: "#ffffff",
          align: "center",
          marginBottom: 14,
        }),
        block("Text", "lede", {
          content:
            "<p>Titanium delivers 360° protection, underbody corrosion defense, and a mirror-like finish. Switch by Sunday and your first month is <strong>$0</strong>.</p>",
          fontSize: 17,
          lineHeight: 1.55,
          color: "#c2ecf7",
          align: "center",
          marginBottom: 28,
        }),
        block("Button", "cta", {
          text: "Upgrade for $0",
          href: "https://mistercarwash.com/",
          backgroundColor: "#05b2df",
          color: "#ffffff",
          align: "center",
          marginBottom: 0,
        }),
      ],
    }),
    block("Section", "compare", {
      padding: padding(32, 32, 8),
      children: [
        block("Heading", "compare-title", {
          text: "What changes",
          level: "h2",
          fontSize: 22,
          align: "center",
          marginBottom: 20,
        }),
        block("Columns", "compare-cols", {
          layout: "50-50",
          gap: 16,
          col1: [
            block("Container", "plan-current", {
              backgroundColor: "#ffffff",
              padding: padding(20),
              children: [
                block("Text", "cur-label", {
                  content: "<p>YOUR PLAN</p>",
                  fontSize: 11,
                  color: "#a1a1a1",
                  marginBottom: 6,
                }),
                block("Heading", "cur-name", {
                  text: "Platinum Unlimited",
                  level: "h3",
                  fontSize: 17,
                  fontWeight: 600,
                  marginBottom: 8,
                }),
                block("Text", "cur-perks", {
                  content:
                    "<ul><li>Unlimited washes</li><li>HotShine® Carnauba Wax</li><li>Platinum Repel Shield</li></ul>",
                  fontSize: 14,
                  color: "#525252",
                  marginBottom: 0,
                }),
              ],
            }),
          ],
          col2: [
            block("Container", "plan-next", {
              backgroundColor: "#effafd",
              borderColor: "#05b2df",
              padding: padding(20),
              children: [
                block("Text", "next-label", {
                  content: "<p>CERAMIC UNLIMITED</p>",
                  fontSize: 11,
                  color: "#0189ab",
                  marginBottom: 6,
                }),
                block("Heading", "next-name", {
                  text: "$39.99/mo · first month $0",
                  level: "h3",
                  fontSize: 17,
                  fontWeight: 600,
                  marginBottom: 8,
                }),
                block("Text", "next-perks", {
                  content:
                    "<ul><li>Everything in Platinum</li><li><strong>Titanium 360° every wash</strong></li><li>Underbody corrosion defense</li></ul>",
                  fontSize: 14,
                  color: "#525252",
                  marginBottom: 0,
                }),
              ],
            }),
          ],
          col3: [],
        }),
      ],
    }),
    block("Section", "fineprint", {
      padding: padding(16, 32, 32),
      children: [
        block("Divider", "rule", { marginY: 8 }),
        block("Text", "fine", {
          content:
            '<p>Offer valid for active Platinum members through Sunday. Regular pricing varies by location; cancel anytime.</p><p>Mister Car Wash · Your preferred location · <a href="https://mistercarwash.com/">Unsubscribe</a></p>',
          fontSize: 12,
          lineHeight: 1.5,
          color: "#8a8a8a",
          marginBottom: 0,
        }),
      ],
    }),
  ],
);
