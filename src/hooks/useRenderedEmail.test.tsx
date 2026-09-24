import assert from "node:assert/strict";
import { test } from "node:test";
import { act } from "react";
import { Window } from "happy-dom";
import type { EmailData } from "@/email/config";
import type { RenderedEmail } from "@/email/render";
import { DEFAULT_ROOT_PROPS } from "@/email/root";
import { templates } from "@/email/templates";
import { api } from "@/lib/client-api";
import { useRenderedEmail } from "./useRenderedEmail";

type Preview = RenderedEmail & { from: string; fromEmail: string };
const wait = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

test("preview requests debounce edits, abort obsolete fetches, and preserve the previous preview", async () => {
  const browser = new Window({ url: "http://localhost:3000" });
  const previous = new Map<string, PropertyDescriptor | undefined>();
  for (const [key, value] of Object.entries({
    window: browser,
    document: browser.document,
    navigator: browser.navigator,
    HTMLElement: browser.HTMLElement,
    IS_REACT_ACT_ENVIRONMENT: true,
  })) {
    previous.set(key, Object.getOwnPropertyDescriptor(globalThis, key));
    Object.defineProperty(globalThis, key, { configurable: true, value });
  }

  const originalRender = api.render;
  const calls: Array<{
    data: EmailData;
    signal?: AbortSignal;
    resolve: (result: Preview) => void;
  }> = [];
  api.render = (data, signal) => new Promise((resolve) => {
    calls.push({ data, signal, resolve });
  });

  let root: import("react-dom/client").Root | null = null;
  try {
    const { createRoot } = await import("react-dom/client");
    const container = browser.document.createElement("div");
    browser.document.body.append(container);
    root = createRoot(container as unknown as HTMLElement);
    const initial = structuredClone(templates[0].data);
    const states: ReturnType<typeof useRenderedEmail>[] = [];
    function Probe({ data }: { data: EmailData }) {
      const state = useRenderedEmail(data);
      states.push(state);
      return <div>{state.rendered?.html ?? "No preview"}</div>;
    }
    const preview = (html: string): Preview => ({
      html, text: html, subject: "", from: "Sender", fromEmail: "send@example.com",
    });

    await act(async () => { root!.render(<Probe data={initial} />); });
    await act(async () => { await wait(20); });
    assert.equal(calls.length, 1);
    await act(async () => { calls[0].resolve(preview("First preview")); });
    assert.equal(states.at(-1)?.rendered?.html, "First preview");

    const second: EmailData = { ...initial, root: { ...initial.root, props: { ...DEFAULT_ROOT_PROPS, ...initial.root.props, previewText: "Second" } } };
    const third: EmailData = { ...second, root: { ...second.root, props: { ...DEFAULT_ROOT_PROPS, ...second.root.props, previewText: "Third" } } };
    await act(async () => { root!.render(<Probe data={second} />); });
    assert.equal(calls[0].signal?.aborted, true);
    assert.equal(states.at(-1)?.rendered?.html, "First preview");
    assert.equal(states.at(-1)?.loading, true);
    await act(async () => { root!.render(<Probe data={third} />); });
    await act(async () => { await wait(350); });
    assert.equal(calls.length, 2);
    assert.strictEqual(calls[1].data, third);
    await act(async () => { calls[1].resolve(preview("Third preview")); });
    assert.equal(states.at(-1)?.rendered?.html, "Third preview");
  } finally {
    const mountedRoot = root;
    if (mountedRoot) await act(async () => { mountedRoot.unmount(); });
    api.render = originalRender;
    await browser.happyDOM.abort();
    for (const [key, descriptor] of previous) {
      if (descriptor) Object.defineProperty(globalThis, key, descriptor);
      else Reflect.deleteProperty(globalThis, key);
    }
  }
});
