import { describe, test } from "node:test";
import assert from "node:assert/strict";
import { templates } from "./templates";
import { renderEmail } from "./render";
import { DEFAULT_ROOT_PROPS } from "./root";
import { emailConfig, type EmailData, type EmailComponents } from "./config";

describe("email rendering after the editor upgrade", () => {
  for (const template of templates) {
    test(`${template.name} renders and keeps the internal title out of the message`, async () => {
      const data = structuredClone(template.data);
      data.root.props = {
        ...DEFAULT_ROOT_PROPS,
        ...data.root.props,
        projectTitle: "Internal only token",
      };
      const result = await renderEmail(data);
      assert.match(result.html, /<html/i);
      if (template.id !== "blank") assert.ok(result.text.length > 0);
      assert.equal(result.html.includes("Internal only token"), false);
      assert.equal(
        result.subject,
        template.data.root.props?.subject?.trim() ?? "",
      );
    });
  }

  test("saved email width changes output HTML", async () => {
    const data = structuredClone(templates[0].data);
    data.root.props = {
      ...DEFAULT_ROOT_PROPS,
      ...data.root.props,
      contentWidth: 720,
    };
    const { html } = await renderEmail(data);
    assert.match(html, /max-width:\s*720px/i);
  });

  test("Mister patterns render through the same email pipeline", async () => {
    const types: Array<keyof EmailComponents> = [
      "MisterHeader",
      "MisterMembershipHero",
      "MisterProductSpotlight",
      "MisterLocationCta",
    ];
    const data = {
      root: { props: { ...DEFAULT_ROOT_PROPS, subject: "Pattern preview" } },
      content: types.map((type) => ({
        type,
        props: {
          ...structuredClone(emailConfig.components[type].defaultProps),
          id: `pattern-${type}`,
        },
      })),
    } as EmailData;

    const { html, text } = await renderEmail(data);
    assert.match(html, /Mister_Logo/);
    assert.match(text, /Unlimited Wash Club/i);
    assert.match(text, /Titanium 360/i);
  });
});
