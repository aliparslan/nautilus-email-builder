import { padding } from "../fields/shared";
import { block, document } from "./block";

const LOGO = "https://cdn.bfldr.com/PENMAIHR/at/7n74b4hw42nr59f6wk46xkj/Mister_Logo-23-BlueYellow-RGB.png?format=png&width=450&height=153";

export const welcome = document(
  {
    subject: "Welcome to Unlimited Wash Club",
    previewText: "Your membership is active. Here's what happens next.",
  },
  [
    block("Section", "header", {
      padding: padding(32, 32, 8),
      children: [
        block("Image", "logo", {
          src: LOGO,
          alt: "Mister Car Wash",
          width: 140,
          href: "https://mistercarwash.com/",
          marginBottom: 0,
        }),
      ],
    }),
    block("Section", "body", {
      padding: padding(16, 32, 32),
      children: [
        block("Heading", "title", {
          text: "Welcome to Unlimited Wash Club",
          level: "h1",
          fontSize: 32,
        }),
        block("Text", "intro", {
          content:
            "<p>Your <strong>Titanium Unlimited</strong> plan is active. Pull up to any lane and your member pass takes care of the rest.</p><p>Your first renewal is on <strong>March 3</strong>. You can manage your plan and payment details from your account.</p>",
          marginBottom: 24,
        }),
        block("Container", "plan", {
          children: [
            block("Heading", "plan-title", {
              text: "Titanium Unlimited",
              level: "h3",
              fontSize: 18,
              fontWeight: 600,
              marginBottom: 6,
            }),
            block("Text", "plan-perks", {
              content:
                "<ul><li>Unlimited washes</li><li>Titanium 360° protection</li><li>HotShine® Carnauba Wax and Wheel Polish</li></ul>",
              fontSize: 15,
              color: "#525252",
              marginBottom: 0,
            }),
          ],
        }),
        block("Spacer", "gap", { height: 24 }),
        block("Button", "cta", {
          text: "Open member portal",
          href: "https://mistercarwash.com/",
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
            '<p>Mister Car Wash · Your preferred location</p><p>You\'re receiving this because you joined Unlimited Wash Club®. <a href="https://mistercarwash.com/">Manage preferences</a></p>',
          fontSize: 13,
          lineHeight: 1.5,
          color: "#6f6f6f",
          marginBottom: 0,
        }),
      ],
    }),
  ],
);
