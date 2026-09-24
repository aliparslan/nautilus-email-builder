"use client";

import { Puck } from "@puckeditor/core";
import { MotionConfig } from "motion/react";
import { useCallback, useRef, useState } from "react";
import { Toaster } from "sonner";
import { emailConfig, type EmailData } from "@/email/config";
import { defaultTemplate } from "@/email/templates";
import { DEFAULT_ROOT_PROPS } from "@/email/root";
import { loadDraft, useDraftAutosave } from "@/hooks/useDraft";
import type { SavedPattern } from "@/hooks/usePatterns";
import { EditorWorkspace, type DroppedItem } from "./EditorWorkspace";
import type { ImageAsset } from "./editor-data";

export function EmailEditor() {
  // Client-only component (see page.tsx), so reading localStorage during the first render is safe.
  const [initialData] = useState<EmailData>(
    () =>
      loadDraft()?.data ?? {
        ...structuredClone(defaultTemplate.data),
        root: {
          ...defaultTemplate.data.root,
          props: {
            ...DEFAULT_ROOT_PROPS,
            ...defaultTemplate.data.root.props,
            projectTitle: defaultTemplate.name,
          },
        },
      },
  );
  const { save, flush, savedAt } = useDraftAutosave();
  const draggedAsset = useRef<ImageAsset | null>(null);
  const draggedPattern = useRef<SavedPattern | null>(null);
  const dropHandler = useRef<((drop: DroppedItem) => void) | null>(null);
  const registerDrop = useCallback((handler: typeof dropHandler.current) => {
    dropHandler.current = handler;
  }, []);

  return (
    <MotionConfig reducedMotion="user">
      <Puck
        config={emailConfig}
        data={initialData}
        onChange={save}
        onAction={(action) => {
          if (action.type !== "insert" || !action.id) return;
          let drop: DroppedItem | null = null;
          if (
            draggedPattern.current &&
            action.componentType === draggedPattern.current.node.type
          ) {
            drop = {
              id: action.id,
              kind: "pattern",
              pattern: draggedPattern.current,
            };
            draggedPattern.current = null;
          } else if (action.componentType === "Image" && draggedAsset.current) {
            drop = { id: action.id, kind: "asset", asset: draggedAsset.current };
            draggedAsset.current = null;
          }
          // Wait until Puck has inserted its placeholder before filling its props.
          if (drop) queueMicrotask(() => dropHandler.current?.(drop));
        }}
      >
        <EditorWorkspace
          savedAt={savedAt}
          registerDrop={registerDrop}
          onSaveNow={flush}
          onAssetDragStart={(asset) => {
            draggedAsset.current = asset;
          }}
          onPatternDragStart={(pattern) => {
            draggedPattern.current = pattern;
          }}
        />
      </Puck>
      <Toaster
        position="bottom-right"
        richColors
        closeButton
        toastOptions={{ className: "rounded-xl!" }}
      />
    </MotionConfig>
  );
}
