import { describe, test } from "node:test";
import assert from "node:assert/strict";
import { emailConfig, type EmailData } from "@/email/config";
import { DEFAULT_ROOT_PROPS } from "@/email/root";
import { addBlock, addSavedNode, insertionLocation } from "./editor-data";

describe("block placement", () => {
  const section = {
    type: "Section" as const,
    props: {
      id: "section-1",
      backgroundColor: "",
      padding: { top: 24, right: 32, bottom: 24, left: 32 },
      children: [],
    },
  };
  const draft: EmailData = {
    root: { props: DEFAULT_ROOT_PROPS },
    content: [section],
  };

  test("clicking a content block with nothing selected appends to the last section", () => {
    const location = insertionLocation(draft, "Text", null);
    assert.deepEqual(location, { zone: "section-1:children", index: 0 });
    const result = addBlock(draft, "Text", location);
    assert.equal(result.content.length, 1);
    assert.equal(
      (result.content[0].props as typeof section.props).children.length,
      1,
    );
    assert.equal(section.props.children.length, 0);
  });

  test("a new section goes to the page bottom", () => {
    assert.deepEqual(insertionLocation(draft, "Section", null), {
      zone: "root:default-zone",
      index: 1,
    });
  });

  test("inserting a saved pattern preserves nested content and assigns fresh ids", () => {
    const saved = {
      type: "Section" as const,
      props: {
        ...emailConfig.components.Section.defaultProps,
        id: "section-1",
        children: [
          {
            type: "Text" as const,
            props: {
              ...emailConfig.components.Text.defaultProps,
              id: "saved-text",
              content: "A saved message",
            },
          },
        ],
      },
    } as unknown as EmailData["content"][number];
    const empty: EmailData = {
      root: { props: DEFAULT_ROOT_PROPS },
      content: [],
    };
    const result = addSavedNode(empty, saved, {
      zone: "root:default-zone",
      index: 0,
    });
    const inserted = result.content[0];
    assert.equal(inserted.type, "Section");
    if (inserted.type !== "Section") throw new Error("Expected a section");
    const children = inserted.props.children;
    assert.notEqual(inserted.props.id, "section-1");
    assert.equal(children[0].type, "Text");
    if (children[0].type !== "Text") throw new Error("Expected text");
    assert.equal(children[0].props.content, "A saved message");
    assert.notEqual(children[0].props.id, "saved-text");
  });
});
