import assert from "node:assert/strict";
import { describe, test } from "node:test";
import { defaultTemplate } from "@/email/templates";
import { env, senderHeader } from "./env";
import { sendRequestSchema } from "./schemas";

describe("editable sender address", () => {
  test("keeps the configured domain when the local part changes", () => {
    const domain = env.fromEmail.split("@").at(-1);
    assert.equal(senderHeader("updates"), `${env.fromName} <updates@${domain}>`);
  });

  test("rejects sender values that could change the address or header", () => {
    const request = {
      data: defaultTemplate.data,
      to: ["delivered@resend.dev"],
      subject: "Test",
    };
    assert.equal(sendRequestSchema.safeParse({ ...request, senderLocalPart: "updates" }).success, true);
    assert.equal(sendRequestSchema.safeParse({ ...request, senderLocalPart: "other@example.com" }).success, false);
    assert.equal(sendRequestSchema.safeParse({ ...request, senderLocalPart: "hello\nBcc: x" }).success, false);
  });
});
