import type {
  ComponentConfig,
  ComponentData,
  Content,
  PuckContext,
} from "@puckeditor/core";
import type { ReactNode } from "react";
import { emailConfig, type EmailComponents, type EmailData } from "./config";
import { DEFAULT_ROOT_PROPS } from "./root";

/**
 * Renders a Puck document using the exact block `render` functions the editor canvas uses,
 * but without Puck's runtime renderer.
 *
 * Puck's own <Render> depends on hooks and Suspense. Inside Next's server layers the
 * `react-server` build of React and `react-dom/server` don't share a hook dispatcher, so
 * it throws "Invalid hook call". Externalizing Puck fixes the API route but breaks SSR of
 * the editor. This walker sidesteps all of that and lets the send pipeline (API routes,
 * Temporal worker) depend only on the block definitions, not the editor.
 */
export function EmailTree({ data }: { data: EmailData }) {
  const Root = emailConfig.root?.render;
  const content = <Blocks content={data.content} />;
  if (!Root) return content;

  return (
    <Root
      {...DEFAULT_ROOT_PROPS}
      {...data.root.props}
      id="root"
      puck={PUCK_CONTEXT}
    >
      {content}
    </Root>
  );
}

function Blocks({ content }: { content: Content }) {
  return (
    <>
      {content.map((item) => (
        <Block key={item.props.id} item={item} />
      ))}
    </>
  );
}

type AnyBlock = ComponentConfig<Record<string, unknown>>;

function blockFor(type: string): AnyBlock | undefined {
  if (!(type in emailConfig.components)) return undefined;
  // Document JSON is untyped at this boundary; each block's props are type-checked where it's defined.
  return emailConfig.components[
    type as keyof EmailComponents
  ] as unknown as AnyBlock;
}

function Block({ item }: { item: ComponentData }) {
  const def = blockFor(item.type);
  if (!def) return null;

  // Mirror what Puck does before calling render: slots become components, rich text becomes markup.
  const props: Record<string, unknown> = { ...item.props, puck: PUCK_CONTEXT };
  for (const [key, field] of Object.entries(def.fields ?? {})) {
    if (field.type === "slot") {
      const slotContent = (item.props[key] ?? []) as Content;
      props[key] = () => <Blocks content={slotContent} />;
    } else if (field.type === "richtext") {
      props[key] = <RichText html={item.props[key]} />;
    }
  }

  const Render = def.render;
  return <Render {...(props as Parameters<typeof Render>[0])} />;
}

/** Same wrapper Puck's read-only richtext renderer emits, so the root stylesheet targets both. */
function RichText({ html }: { html: unknown }): ReactNode {
  return (
    <div
      className="rich-text"
      dangerouslySetInnerHTML={{ __html: typeof html === "string" ? html : "" }}
    />
  );
}

const PUCK_CONTEXT: PuckContext = {
  isEditing: false,
  dragRef: null,
  metadata: {},
  renderDropZone: () => null,
};
