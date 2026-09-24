"use client";

import { Drawer } from "@puckeditor/core";
import {
  AlignLeft,
  Columns2,
  Heading1,
  ImageIcon,
  MousePointerClick,
  MoveVertical,
  PanelTop,
  Square,
  Minus,
} from "lucide-react";
import type { ComponentType } from "react";
import type { BlockType } from "./editor-data";

const BLOCKS: {
  title: string;
  items: {
    type: BlockType;
    label: string;
    Icon: ComponentType<{ className?: string; strokeWidth?: number }>;
  }[];
}[] = [
  {
    title: "Layout",
    items: [
      { type: "Section", label: "Section", Icon: PanelTop },
      { type: "Columns", label: "Columns", Icon: Columns2 },
      { type: "Container", label: "Card", Icon: Square },
      { type: "Spacer", label: "Spacer", Icon: MoveVertical },
      { type: "Divider", label: "Divider", Icon: Minus },
    ],
  },
  {
    title: "Content",
    items: [
      { type: "Heading", label: "Heading", Icon: Heading1 },
      { type: "Text", label: "Text", Icon: AlignLeft },
      { type: "Button", label: "Button", Icon: MousePointerClick },
      { type: "Image", label: "Image", Icon: ImageIcon },
    ],
  },
];

export function BlocksPanel({
  onInsert,
}: {
  onInsert: (type: BlockType) => void;
}) {
  return (
    <div className="space-y-6 p-3">
      {BLOCKS.map((group) => (
        <section key={group.title}>
          <h3 className="px-1 pb-3 text-xs font-semibold text-charcoal-800 dark:text-neutral-200">
            {group.title}
          </h3>
          <Drawer>
            <div className="grid grid-cols-3 gap-2">
              {group.items.map(({ type, label, Icon }) => (
                <Drawer.Item key={type} id={type} name={type} label={label}>
                  {() => (
                    <div
                      role="button"
                      tabIndex={0}
                      onClick={() => onInsert(type)}
                      onKeyDown={(event) => {
                        if (event.key === "Enter" || event.key === " ") {
                          event.preventDefault();
                          onInsert(type);
                        }
                      }}
                      title={`Add ${label}; drag to place`}
                      className="nautilus-block-tile group flex w-full cursor-grab flex-col items-center gap-1.5 text-center active:cursor-grabbing focus-visible:outline-2 focus-visible:outline-brand"
                    >
                      <span
                        aria-hidden="true"
                        className="flex h-16 w-full items-center justify-center rounded-lg border border-divide bg-gray-50 text-brand-dark shadow-[0_1px_2px_rgba(3,49,72,.05)] transition-colors group-hover:border-brand/50 group-hover:bg-brand/8 dark:border-neutral-700 dark:bg-neutral-800 dark:text-brand dark:group-hover:bg-brand/10"
                      >
                        <Icon className="size-8" strokeWidth={1.8} />
                      </span>
                      <span className="text-[11px] font-medium leading-tight text-charcoal-800 dark:text-neutral-200">
                        {label}
                      </span>
                    </div>
                  )}
                </Drawer.Item>
              ))}
            </div>
          </Drawer>
        </section>
      ))}
    </div>
  );
}
