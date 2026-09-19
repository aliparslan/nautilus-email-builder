import type { ComponentData } from "@puckeditor/core";
import { emailConfig, type EmailComponents, type EmailData } from "../config";
import { DEFAULT_ROOT_PROPS, type EmailRootProps } from "../root";

type BlockType = keyof EmailComponents;
type Block<T extends BlockType> = ComponentData<
  EmailComponents[T],
  T,
  EmailComponents
>;

/** Builds a block with the component's defaults filled in, so templates only state what differs. */
export function block<T extends BlockType>(
  type: T,
  id: string,
  props: Partial<Block<T>["props"]> = {},
): Block<T> {
  const defaults = emailConfig.components[type]
    .defaultProps as Block<T>["props"];
  return { type, props: { ...defaults, ...props, id } };
}

export function document(
  root: Partial<EmailRootProps>,
  content: EmailData["content"],
): EmailData {
  return { root: { props: { ...DEFAULT_ROOT_PROPS, ...root } }, content };
}
