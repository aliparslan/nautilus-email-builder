import { padding } from "../fields/shared";
import { block, document } from "./block";

const LOGO = "https://www.nautilus.co/nautilus-logo.png";

export const promo = document(
  {
    subject: "Upgrade to Ceramic, first month on us",
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
          alt: "Nautilus",
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
          text: "Upgrade to Ceramic. First month on us.",
          level: "h1",
          fontSize: 34,
          color: "#ffffff",
          align: "center",
          marginBottom: 14,
        }),
        block("Text", "lede", {
          content:
            "<p>Ceramic Unlimited adds a hydrophobic coat every wash, so pollen, rain and road grime rinse off before they stick. Switch by Sunday and your first month is <strong>$0</strong>.</p>",
          fontSize: 17,
          lineHeight: 1.55,
          color: "#c2ecf7",
          align: "center",
          marginBottom: 28,
        }),
        block("Button", "cta", {
          text: "Upgrade for $0",
          href: "https://www.nautilus.co",
          backgroundColor: "#01b2de",
          color: "#033148",
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
                  text: "Deluxe Unlimited",
                  level: "h3",
                  fontSize: 17,
                  fontWeight: 600,
                  marginBottom: 8,
                }),
                block("Text", "cur-perks", {
                  content:
                    "<ul><li>Unlimited washes</li><li>Tire shine</li><li>Interior vacuums</li></ul>",
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
              borderColor: "#01b2de",
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
                    "<ul><li>Everything in Deluxe</li><li><strong>Ceramic coat every wash</strong></li><li>Priority express lane</li></ul>",
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
            '<p>Offer valid for active Deluxe members through Sunday. Renews at $39.99/mo after the first month; cancel anytime.</p><p>Splash Car Wash · 525 Brannan St, San Francisco, CA · <a href="https://www.nautilus.co">Unsubscribe</a></p>',
          fontSize: 12,
          lineHeight: 1.5,
          color: "#8a8a8a",
          marginBottom: 0,
        }),
      ],
    }),
  ],
);
