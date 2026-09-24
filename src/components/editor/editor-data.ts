import type { EmailComponents, EmailData } from "@/email/config";
import { emailConfig } from "@/email/config";

export type BlockType = keyof EmailComponents;
export type EmailNode = EmailData["content"][number];
type Node = EmailNode;
export type BlockLocation = { index: number; zone: string };

const ROOT_ZONE = "root:default-zone";

function slotLength(node: Node, key: string): number {
  const slot = (node.props as Record<string, unknown>)[key];
  return Array.isArray(slot) ? slot.length : 0;
}

export function insertionLocation(
  data: EmailData,
  type: BlockType,
  selected: Node | null,
  selectedLocation?: BlockLocation,
): BlockLocation {
  if (selected) {
    const id = String(selected.props.id);
    const slot =
      selected.type === "Section" || selected.type === "Container"
        ? "children"
        : selected.type === "Columns"
          ? "col1"
          : null;
    if (slot)
      return { zone: `${id}:${slot}`, index: slotLength(selected, slot) };
    if (selectedLocation)
      return { zone: selectedLocation.zone, index: selectedLocation.index + 1 };
  }
  if (type !== "Section") {
    const lastSection = [...data.content]
      .reverse()
      .find((node) => node.type === "Section");
    if (lastSection)
      return {
        zone: `${lastSection.props.id}:children`,
        index: slotLength(lastSection, "children"),
      };
  }
  return { zone: ROOT_ZONE, index: data.content.length };
}

function isNodeArray(value: unknown): value is Node[] {
  return (
    Array.isArray(value) &&
    value.every(
      (item) =>
        item && typeof item === "object" && "type" in item && "props" in item,
    )
  );
}

function addAt(
  content: Node[],
  parentId: string,
  slot: string,
  index: number,
  node: Node,
): Node[] {
  return content.map((item) => {
    const props = item.props as Record<string, unknown>;
    if (String(props.id) === parentId) {
      const existing = isNodeArray(props[slot]) ? props[slot] : [];
      const next = existing.slice();
      next.splice(Math.min(index, next.length), 0, node);
      return { ...item, props: { ...props, [slot]: next } } as Node;
    }
    const nextProps = { ...props };
    for (const [key, value] of Object.entries(props)) {
      if (isNodeArray(value) && value.length)
        nextProps[key] = addAt(value, parentId, slot, index, node);
    }
    return { ...item, props: nextProps } as Node;
  });
}

export function addBlock(
  data: EmailData,
  type: BlockType,
  location: BlockLocation,
  extraProps: Record<string, unknown> = {},
): EmailData {
  const defaults = emailConfig.components[type].defaultProps ?? {};
  const node = {
    type,
    props: { ...defaults, ...extraProps, id: crypto.randomUUID() },
  } as Node;
  if (location.zone === ROOT_ZONE) {
    const content = data.content.slice();
    content.splice(Math.min(location.index, content.length), 0, node);
    return { ...data, content };
  }
  const colon = location.zone.lastIndexOf(":");
  const parentId = location.zone.slice(0, colon);
  const slot = location.zone.slice(colon + 1);
  return {
    ...data,
    content: addAt(data.content, parentId, slot, location.index, node),
  };
}

function cloneValue(value: unknown): unknown {
  if (isNodeArray(value)) return value.map((node) => cloneNodeWithNewIds(node));
  if (Array.isArray(value)) return value.map(cloneValue);
  if (value && typeof value === "object") {
    return Object.fromEntries(
      Object.entries(value as Record<string, unknown>).map(([key, child]) => [
        key,
        cloneValue(child),
      ]),
    );
  }
  return value;
}

/** Clone a saved fragment and give every Puck node a fresh identity. */
export function cloneNodeWithNewIds(node: EmailNode): EmailNode {
  const props = Object.fromEntries(
    Object.entries(node.props as Record<string, unknown>).map(([key, value]) => [
      key,
      key === "id" ? crypto.randomUUID() : cloneValue(value),
    ]),
  );
  return { ...node, props } as EmailNode;
}

/** Insert a complete saved fragment while preserving its nested slots. */
export function addSavedNode(
  data: EmailData,
  saved: EmailNode,
  location: BlockLocation,
): EmailData {
  const node = cloneNodeWithNewIds(saved);
  if (location.zone === ROOT_ZONE) {
    const content = data.content.slice();
    content.splice(Math.min(location.index, content.length), 0, node);
    return { ...data, content };
  }
  const colon = location.zone.lastIndexOf(":");
  return {
    ...data,
    content: addAt(
      data.content,
      location.zone.slice(0, colon),
      location.zone.slice(colon + 1),
      location.index,
      node,
    ),
  };
}

/** Replace Puck's drag placeholder with a complete saved fragment. */
export function setSavedNode(
  data: EmailData,
  id: string,
  saved: EmailNode,
): EmailData {
  const replacement = cloneNodeWithNewIds(saved);
  replacement.props = { ...replacement.props, id };
  const update = (nodes: Node[]): Node[] =>
    nodes.map((node) => {
      if (String(node.props.id) === id) return replacement;
      const props = { ...node.props } as Record<string, unknown>;
      for (const [key, value] of Object.entries(props)) {
        if (isNodeArray(value)) props[key] = update(value);
      }
      return { ...node, props } as Node;
    });
  return { ...data, content: update(data.content) };
}

export function renameNode(data: EmailData, id: string, name: string): EmailData {
  const update = (nodes: Node[]): Node[] =>
    nodes.map((node) => {
      const props = node.props as Record<string, unknown>;
      if (String(props.id) === id) {
        return { ...node, props: { ...props, editorLabel: name } } as unknown as Node;
      }
      const nextProps = { ...props };
      for (const [key, value] of Object.entries(props)) {
        if (isNodeArray(value)) nextProps[key] = update(value);
      }
      return { ...node, props: nextProps } as Node;
    });
  return { ...data, content: update(data.content) };
}

export function imageSources(data: EmailData): string[] {
  const seen = new Set<string>();
  const walk = (content: Node[]) => {
    for (const node of content) {
      if (node.type === "Image") {
        const src = (node.props as Record<string, unknown>).src;
        if (typeof src === "string" && src) seen.add(src);
      }
      for (const value of Object.values(node.props)) {
        if (isNodeArray(value)) walk(value);
      }
    }
  };
  walk(data.content);
  return [...seen];
}

export type ImageAsset = { src: string; alt?: string };

export function setImageAsset(
  data: EmailData,
  id: string,
  asset: ImageAsset,
): EmailData {
  const update = (nodes: Node[]): Node[] =>
    nodes.map((node) => {
      if (String(node.props.id) === id && node.type === "Image") {
        return {
          ...node,
          props: {
            ...node.props,
            src: asset.src,
            ...(asset.alt ? { alt: asset.alt } : {}),
          },
        } as Node;
      }
      const props = { ...node.props } as Record<string, unknown>;
      for (const [key, value] of Object.entries(props)) {
        if (isNodeArray(value)) props[key] = update(value);
      }
      return { ...node, props } as Node;
    });
  return { ...data, content: update(data.content) };
}
