import { describe, test } from "node:test";
import assert from "node:assert/strict";
import { expandRecipients, parseAddresses } from "./recipients";

describe("recipient lists", () => {
  test("splits pasted lists, flags invalid entries, and deduplicates case-insensitively", () => {
    assert.deepEqual(
      parseAddresses("A@example.com; b@example.com\n a@EXAMPLE.com,invalid"),
      { emails: ["a@example.com", "b@example.com"], invalid: ["invalid"] },
    );
  });

  test("expands selected groups into a flat snapshot independent of later edits", () => {
    const groups = [
      {
        id: "members",
        name: "Members",
        emails: ["a@example.com", "b@example.com"],
      },
    ];
    const selection = {
      direct: ["A@example.com", "c@example.com"],
      groupIds: ["members"],
    };
    const snapshot = expandRecipients(selection, groups);
    assert.deepEqual(snapshot, [
      "a@example.com",
      "c@example.com",
      "b@example.com",
    ]);
    groups[0].emails.push("later@example.com");
    assert.deepEqual(snapshot, [
      "a@example.com",
      "c@example.com",
      "b@example.com",
    ]);
  });
});
