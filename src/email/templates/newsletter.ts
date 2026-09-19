import { padding } from "../fields/shared";
import { block, document } from "./block";

const LOGO = "https://www.nautilus.co/nautilus-logo.png";

export const newsletter = document(
  {
    subject: "Your March wash report",
    previewText:
      "12 washes, a new express lane, and a heads-up on spring pollen.",
    backgroundColor: "#eef4f7",
  },
  [
    block("Section", "header", {
      padding: padding(28, 32, 0),
      children: [
        block("Columns", "header-cols", {
          layout: "67-33",
          col1: [
            block("Image", "logo", {
              src: LOGO,
              alt: "Nautilus",
              width: 120,
              marginBottom: 0,
            }),
          ],
          col2: [
            block("Text", "issue", {
              content: "<p>MARCH 2026 · ISSUE 07</p>",
              fontSize: 12,
              color: "#6f6f6f",
              align: "right",
              marginBottom: 0,
            }),
          ],
          col3: [],
        }),
      ],
    }),
    block("Section", "hero", {
      padding: padding(28, 32, 8),
      children: [
        block("Heading", "title", {
          text: "You washed 12 times in March",
          level: "h1",
          fontSize: 30,
        }),
        block("Text", "lede", {
          content:
            "<p>That's <strong>$168 of washes</strong> on a $39.99 plan — your membership paid for itself by the 4th. Here's what's new at Splash.</p>",
          color: "#525252",
          marginBottom: 8,
        }),
      ],
    }),
    block("Section", "stats", {
      padding: padding(8, 32, 8),
      children: [
        block("Columns", "stat-cols", {
          layout: "33-33-33",
          gap: 16,
          col1: [
            block("Container", "stat-1", {
              padding: padding(16),
              children: [
                block("Heading", "stat-1-n", {
                  text: "12",
                  level: "h2",
                  fontSize: 28,
                  color: "#01b2de",
                  marginBottom: 2,
                }),
                block("Text", "stat-1-l", {
                  content: "<p>Washes</p>",
                  fontSize: 13,
                  color: "#6f6f6f",
                  marginBottom: 0,
                }),
              ],
            }),
          ],
          col2: [
            block("Container", "stat-2", {
              padding: padding(16),
              children: [
                block("Heading", "stat-2-n", {
                  text: "$168",
                  level: "h2",
                  fontSize: 28,
                  color: "#01b2de",
                  marginBottom: 2,
                }),
                block("Text", "stat-2-l", {
                  content: "<p>Retail value</p>",
                  fontSize: 13,
                  color: "#6f6f6f",
                  marginBottom: 0,
                }),
              ],
            }),
          ],
          col3: [
            block("Container", "stat-3", {
              padding: padding(16),
              children: [
                block("Heading", "stat-3-n", {
                  text: "4m 20s",
                  level: "h2",
                  fontSize: 28,
                  color: "#01b2de",
                  marginBottom: 2,
                }),
                block("Text", "stat-3-l", {
                  content: "<p>Avg. time in lane</p>",
                  fontSize: 13,
                  color: "#6f6f6f",
                  marginBottom: 0,
                }),
              ],
            }),
          ],
        }),
      ],
    }),
    block("Section", "news", {
      padding: padding(24, 32, 8),
      children: [
        block("Heading", "news-title", {
          text: "What's new",
          level: "h2",
          fontSize: 22,
        }),
        block("Columns", "news-cols", {
          layout: "50-50",
          col1: [
            block("Heading", "n1-t", {
              text: "Express lane is open",
              level: "h3",
              fontSize: 16,
              fontWeight: 600,
              marginBottom: 6,
            }),
            block("Text", "n1-b", {
              content:
                "<p>Members now skip the pay station entirely. Look for the blue lane on the left.</p>",
              fontSize: 15,
              color: "#525252",
            }),
          ],
          col2: [
            block("Heading", "n2-t", {
              text: "Pollen season prep",
              level: "h3",
              fontSize: 16,
              fontWeight: 600,
              marginBottom: 6,
            }),
            block("Text", "n2-b", {
              content:
                "<p>Ceramic members get a free <strong>clear-coat refresh</strong> through April. Just ask at the lane.</p>",
              fontSize: 15,
              color: "#525252",
            }),
          ],
          col3: [],
        }),
        block("Button", "cta", {
          text: "See your wash history",
          href: "https://www.nautilus.co",
          marginBottom: 8,
        }),
      ],
    }),
    block("Section", "footer", {
      padding: padding(8, 32, 32),
      children: [
        block("Divider", "rule", { marginY: 8 }),
        block("Text", "footer-text", {
          content:
            '<p>Splash Car Wash · 525 Brannan St, San Francisco, CA</p><p><a href="https://www.nautilus.co">Manage preferences</a> · <a href="https://www.nautilus.co">Unsubscribe</a></p>',
          fontSize: 13,
          lineHeight: 1.5,
          color: "#6f6f6f",
          marginBottom: 0,
        }),
      ],
    }),
  ],
);
