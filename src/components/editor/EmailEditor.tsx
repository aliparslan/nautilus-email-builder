"use client";

import { Puck } from "@puckeditor/core";
import { MotionConfig } from "motion/react";
import { useRef, useState } from "react";
import { Toaster } from "sonner";
import { emailConfig, type EmailData } from "@/email/config";
import { defaultTemplate } from "@/email/templates";
import { DEFAULT_ROOT_PROPS } from "@/email/root";
import { loadDraft, useDraftAutosave } from "@/hooks/useDraft";
import type { SavedPattern } from "@/hooks/usePatterns";
import { EditorWorkspace } from "./EditorWorkspace";
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

  return (
    <MotionConfig reducedMotion="user">
      <Puck
        config={emailConfig}
        data={initialData}
        onChange={save}
        onAction={(action) => {
          if (
            action.type === "insert" &&
            action.id &&
            draggedPattern.current &&
            action.componentType === draggedPattern.current.node.type
          ) {
            const pattern = draggedPattern.current;
            draggedPattern.current = null;
            queueMicrotask(() =>
              window.dispatchEvent(
                new CustomEvent("nautilus:pattern-dropped", {
                  detail: { id: action.id, pattern },
                }),
              ),
            );
          }
          if (
            action.type === "insert" &&
            action.componentType === "Image" &&
            action.id &&
            draggedAsset.current
          ) {
            const asset = draggedAsset.current;
            draggedAsset.current = null;
            queueMicrotask(() =>
              window.dispatchEvent(
                new CustomEvent("nautilus:asset-dropped", {
                  detail: { id: action.id, asset },
                }),
              ),
            );
          }
        }}
      >
        <EditorWorkspace
          savedAt={savedAt}
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
