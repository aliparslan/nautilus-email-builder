import { padding } from "../fields/shared";
import { block, document } from "./block";

const LOGO = "https://www.nautilus.co/nautilus-logo.png";

export const welcome = document(
  {
    subject: "Welcome to Unlimited",
    previewText: "Your membership is active. Here's what happens next.",
  },
  [
    block("Section", "header", {
      padding: padding(32, 32, 8),
      children: [
        block("Image", "logo", {
          src: LOGO,
          alt: "Nautilus",
          width: 140,
          href: "https://www.nautilus.co",
          marginBottom: 0,
        }),
      ],
    }),
    block("Section", "body", {
      padding: padding(16, 32, 32),
      children: [
        block("Heading", "title", {
          text: "Welcome to Unlimited",
          level: "h1",
          fontSize: 32,
        }),
        block("Text", "intro", {
          content:
            "<p>Your <strong>Ceramic Unlimited</strong> plan is active. Pull up to any lane, and the camera takes care of the rest — no ticket, no waiting.</p><p>Your first renewal is on <strong>March 3</strong>. You can pause, upgrade, or switch vehicles anytime from your member portal.</p>",
          marginBottom: 24,
        }),
        block("Container", "plan", {
          children: [
            block("Heading", "plan-title", {
              text: "Ceramic Unlimited · $39.99/mo",
              level: "h3",
              fontSize: 18,
              fontWeight: 600,
              marginBottom: 6,
            }),
            block("Text", "plan-perks", {
              content:
                "<ul><li>Unlimited ceramic washes, every day</li><li>Free tire shine and interior vacuums</li><li>Cancel or pause in one tap</li></ul>",
              fontSize: 15,
              color: "#525252",
              marginBottom: 0,
            }),
          ],
        }),
        block("Spacer", "gap", { height: 24 }),
        block("Button", "cta", {
          text: "Open member portal",
          href: "https://www.nautilus.co",
          marginBottom: 0,
        }),
      ],
    }),
    block("Section", "footer", {
      padding: padding(0, 32, 32),
      children: [
        block("Divider", "rule", { marginY: 0 }),
        block("Spacer", "footer-gap", { height: 20 }),
        block("Text", "footer-text", {
          content:
            '<p>Splash Car Wash · 525 Brannan St, San Francisco, CA</p><p>You\'re receiving this because you joined an Unlimited plan. <a href="https://www.nautilus.co">Manage preferences</a></p>',
          fontSize: 13,
          lineHeight: 1.5,
          color: "#6f6f6f",
          marginBottom: 0,
        }),
      ],
    }),
  ],
);
