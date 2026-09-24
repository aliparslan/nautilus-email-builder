"use client";

import { PanelRightOpen, Send } from "lucide-react";
import { useState } from "react";
import { Button } from "../ui/Button";
import { Dialog, DialogBody, DialogFooter } from "../ui/Dialog";
import { PANEL_ICONS } from "./editor-navigation";

const STEPS = [
  {
    title: "Build from the left",
    body: "Add blocks, reuse Mister assets and patterns, or start from a template.",
    Icon: PANEL_ICONS.blocks,
  },
  {
    title: "Arrange in Layers",
    body: "Select, reorder, and nest email content from the Layers panel.",
    Icon: PANEL_ICONS.layers,
  },
  {
    title: "Edit in Properties",
    body: "Select a block to change its content and style. Click the canvas to edit rich text.",
    Icon: PanelRightOpen,
  },
  {
    title: "Review and send",
    body: "Choose recipients, check the rendered email, then send now or schedule it.",
    Icon: Send,
  },
];

export function WalkthroughDialog({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const [step, setStep] = useState(0);
  const current = STEPS[step];

  function close() {
    setStep(0);
    onClose();
  }

  return (
    <Dialog
      open={open}
      onClose={close}
      title="Welcome to Email Builder"
    >
      <DialogBody className="px-6 pb-2">
        <div className="overflow-hidden rounded-2xl bg-[radial-gradient(circle_at_20%_0%,rgba(5,178,223,.20),transparent_45%),linear-gradient(145deg,#f4fbfd,#e8f3f7)] p-6 dark:bg-[radial-gradient(circle_at_20%_0%,rgba(5,178,223,.25),transparent_45%),linear-gradient(145deg,#101d24,#071117)]">
          <div className="flex size-12 items-center justify-center rounded-xl bg-white text-brand shadow-card dark:bg-neutral-900">
            <current.Icon className="size-6" strokeWidth={1.9} />
          </div>
          <p className="mt-8 font-heading text-xl tracking-[0.015em] text-navy dark:text-white">
            {current.title}
          </p>
          <p className="mt-2 max-w-sm text-sm leading-6 text-gray-600 dark:text-neutral-300">
            {current.body}
          </p>
        </div>
        <div className="mt-5 flex items-center justify-center gap-1.5" aria-label={`Step ${step + 1} of ${STEPS.length}`}>
          {STEPS.map((item, index) => (
            <span
              key={item.title}
              className={index === step ? "h-1.5 w-5 rounded-full bg-brand" : "size-1.5 rounded-full bg-gray-300 dark:bg-neutral-700"}
            />
          ))}
        </div>
      </DialogBody>
      <DialogFooter className="!border-t-0">
        <button
          type="button"
          onClick={close}
          className="mr-auto h-9 rounded-lg px-3 text-sm text-gray-600 hover:bg-gray-200 dark:text-neutral-400 dark:hover:bg-neutral-800"
        >
          Skip
        </button>
        {step > 0 && (
          <Button variant="ghost" onClick={() => setStep((value) => value - 1)}>
            Back
          </Button>
        )}
        <Button
          variant="primary"
          icon={step === STEPS.length - 1 ? <PANEL_ICONS.blocks className="size-4" /> : undefined}
          onClick={() => {
            if (step === STEPS.length - 1) close();
            else setStep((value) => value + 1);
          }}
        >
          {step === STEPS.length - 1 ? "Start building" : "Next"}
        </Button>
      </DialogFooter>
    </Dialog>
  );
}
