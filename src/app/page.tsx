"use client";

import dynamic from "next/dynamic";
import { EditorSkeleton } from "@/components/editor/EditorSkeleton";

// The editor is DOM-only (drag & drop, contentEditable, localStorage), so SSR adds nothing but hydration risk.
const EmailEditor = dynamic(
  () => import("@/components/editor/EmailEditor").then((m) => m.EmailEditor),
  {
    ssr: false,
    loading: () => <EditorSkeleton />,
  },
);

export default function Home() {
  return <EmailEditor />;
}
