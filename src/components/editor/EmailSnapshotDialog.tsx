"use client";

import type { EmailData } from "@/email/config";
import { useRenderedEmail } from "@/hooks/useRenderedEmail";
import { Button } from "../ui/Button";
import { Dialog, DialogBody, DialogFooter } from "../ui/Dialog";
import { EmailPreviewFrame } from "./EmailPreviewFrame";

export function EmailSnapshotDialog({
  title,
  data,
  to,
  from,
  action,
  onAction,
  onClose,
}: {
  title: string;
  data: EmailData;
  to?: string[];
  from?: string;
  action: string;
  onAction: () => void;
  onClose: () => void;
}) {
  const { rendered, loading, error } = useRenderedEmail(data);

  return (
    <Dialog open onClose={onClose} title={title} size="xl">
      <DialogBody className="h-[min(72dvh,780px)]">
        <EmailPreviewFrame
          html={rendered?.html ?? null}
          loading={loading}
          error={error}
          from={from}
          to={to}
          subject={data.root.props?.subject ?? ""}
          previewText={data.root.props?.previewText ?? ""}
        />
      </DialogBody>
      <DialogFooter>
        <Button variant="ghost" onClick={onClose}>Cancel</Button>
        <Button variant="primary" onClick={onAction}>{action}</Button>
      </DialogFooter>
    </Dialog>
  );
}
