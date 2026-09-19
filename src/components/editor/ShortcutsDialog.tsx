"use client";

import { Dialog, DialogBody } from "../ui/Dialog";
import { Kbd } from "../ui/Kbd";
import { PUCK_SHORTCUTS, SHORTCUTS } from "./shortcuts";

export function ShortcutsDialog({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  return (
    <Dialog open={open} onClose={onClose} eyebrow="Keyboard" title="Shortcuts">
      <DialogBody>
        <div className="grid gap-6 p-6 sm:grid-cols-2">
          <Group title="Editor">
            {SHORTCUTS.map((s) => (
              <Row key={s.id} keys={s.keys} label={s.label} />
            ))}
          </Group>
          <Group title="Canvas">
            {PUCK_SHORTCUTS.map((s) => (
              <Row key={s.label} keys={s.keys} label={s.label} />
            ))}
            <Row keys={["⎋"]} label="Close dialogs" />
            <p className="mt-3 text-xs leading-relaxed text-gray-500">
              Inside a text block, standard formatting shortcuts apply: bold,
              italic, underline, and link.
            </p>
          </Group>
        </div>
      </DialogBody>
    </Dialog>
  );
}

function Group({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section>
      <h3 className="mb-3 font-mono text-[11px] font-medium tracking-wider text-gray-600 uppercase dark:text-neutral-500">
        {title}
      </h3>
      <div className="space-y-2">{children}</div>
    </section>
  );
}

function Row({ keys, label }: { keys: string[]; label: string }) {
  return (
    <div className="flex items-center justify-between gap-4 text-sm">
      <span className="text-charcoal-800 dark:text-neutral-200">{label}</span>
      <span className="flex items-center gap-1">
        {keys.map((k, i) => (
          <Kbd key={i}>{k}</Kbd>
        ))}
      </span>
    </div>
  );
}
