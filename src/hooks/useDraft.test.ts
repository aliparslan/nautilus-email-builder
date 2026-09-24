import { test } from "node:test";
import assert from "node:assert/strict";
import { loadDraft } from "./useDraft";

test("an older browser draft receives a separate internal project title", () => {
  const original = Object.getOwnPropertyDescriptor(globalThis, "localStorage");
  Object.defineProperty(globalThis, "localStorage", {
    configurable: true,
    value: {
      getItem: (key: string) =>
        key === "nautilus-email:draft:v1"
          ? JSON.stringify({
              savedAt: "2026-09-20T12:00:00Z",
              data: {
                root: { props: { subject: "Member update" } },
                content: [],
              },
            })
          : null,
    },
  });
  try {
    const draft = loadDraft();
    assert.equal(draft?.data.root.props?.projectTitle, "Member update");
    assert.equal(draft?.data.root.props?.subject, "Member update");
    assert.equal(draft?.data.root.props?.contentWidth, 600);
  } finally {
    if (original) Object.defineProperty(globalThis, "localStorage", original);
    else Reflect.deleteProperty(globalThis, "localStorage");
  }
});
