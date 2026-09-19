"use client";

import { Puck } from "@puckeditor/core";
import "@puckeditor/core/puck.css";
import { MotionConfig } from "motion/react";
import { useState } from "react";
import { Toaster } from "sonner";
import { emailConfig, type EmailData } from "@/email/config";
import { defaultTemplate } from "@/email/templates";
import { loadDraft, useDraftAutosave } from "@/hooks/useDraft";
import { EditorHeader } from "./EditorHeader";

const VIEWPORTS = [
  { width: 375, height: "auto", label: "Mobile", icon: "Smartphone" },
  { width: 720, height: "auto", label: "Desktop", icon: "Monitor" },
] as const;

export function EmailEditor() {
  // Client-only component (see page.tsx), so reading localStorage during the first render is safe.
  const [initialData] = useState<EmailData>(
    () => loadDraft()?.data ?? defaultTemplate.data,
  );
  const { save, flush, savedAt } = useDraftAutosave();

  return (
    <MotionConfig reducedMotion="user">
      <Puck
        config={emailConfig}
        data={initialData}
        onChange={save}
        viewports={[...VIEWPORTS]}
        overrides={{
          header: () => <EditorHeader savedAt={savedAt} onSaveNow={flush} />,
        }}
      />
      <Toaster
        position="bottom-right"
        richColors
        closeButton
        toastOptions={{ className: "rounded-xl!" }}
      />
    </MotionConfig>
  );
}
