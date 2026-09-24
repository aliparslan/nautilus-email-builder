"use client";

import { Puck } from "@puckeditor/core";
import {
  Eye,
  Minus,
  Monitor,
  PanelRightOpen,
  Pencil,
  Plus,
  Redo2,
  Smartphone,
  Trash2,
  Undo2,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";
import type { EmailData } from "@/email/config";
import { useRenderedEmail } from "@/hooks/useRenderedEmail";
import { cn } from "@/lib/cn";
import { IconButton } from "../ui/IconButton";
import { observePreviewFrame } from "./preview-frame";
import { useEmailPuck } from "./puck";

type Device = "desktop" | "mobile";
const DEVICE_WIDTH: Record<Device, number> = { desktop: 960, mobile: 375 };
const ZOOMS = [50, 75, 100, 125, 150, 200];

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}

function darkEstimate(html: string) {
  const css = `<style data-preview-dark="true">html { filter: invert(1) hue-rotate(180deg); background: #fff !important; } img, video { filter: invert(1) hue-rotate(180deg); }</style>`;
  return html.includes("</head>")
    ? html.replace("</head>", `${css}</head>`)
    : `${css}${html}`;
}

function DarkPreview({ data }: { data: EmailData }) {
  const { rendered, loading, error } = useRenderedEmail(data);
  return rendered ? (
    <iframe
      title="Dark email estimate"
      sandbox=""
      srcDoc={darkEstimate(rendered.html)}
      className="h-full w-full border-0 bg-neutral-950"
    />
  ) : (
    <div
      className="flex h-full items-center justify-center bg-neutral-900 px-6 text-sm text-neutral-200"
      role="status"
    >
      {error || (loading ? "Rendering dark preview…" : "Nothing to preview")}
    </div>
  );
}

export function CanvasStage({
  data,
  onClear,
  propertiesOpen,
  onOpenProperties,
}: {
  data: EmailData;
  onClear: () => void;
  propertiesOpen: boolean;
  onOpenProperties: () => void;
}) {
  const history = useEmailPuck((store) => store.history);
  const stageRef = useRef<HTMLDivElement>(null);
  const zoomMenuRef = useRef<HTMLDivElement>(null);
  const [space, setSpace] = useState(1000);
  const [contentHeight, setContentHeight] = useState(860);
  const [device, setDevice] = useState<Device>("desktop");
  const [zoom, setZoom] = useState<number | "fit">("fit");
  const [zoomOpen, setZoomOpen] = useState(false);
  const [dark, setDark] = useState(false);
  const deviceWidth = DEVICE_WIDTH[device];
  const scale =
    zoom === "fit"
      ? Math.min(1, Math.max(0.3, (space - 72) / deviceWidth))
      : zoom / 100;
  const percentage = Math.round(scale * 100);

  useEffect(() => {
    const node = stageRef.current;
    if (!node) return;
    const observer = new ResizeObserver(() => setSpace(node.clientWidth));
    observer.observe(node);
    setSpace(node.clientWidth);
    return () => observer.disconnect();
  }, []);

  useEffect(
    () =>
      observePreviewFrame((previewDocument) => {
        let content: Element | null = null;
        const resize = new ResizeObserver(measure);
        const changes = new MutationObserver(measure);

        function measure() {
          const next = previewDocument.querySelector(".email-root");
          if (next !== content) {
            resize.disconnect();
            content = next;
            if (content) resize.observe(content);
          }
          const measured = Math.max(
            860,
            Math.ceil(content?.getBoundingClientRect().height ?? 0) + 64,
          );
          setContentHeight((current) =>
            current === measured ? current : measured,
          );
        }

        changes.observe(previewDocument.body, {
          childList: true,
          subtree: true,
        });
        measure();
        return () => {
          changes.disconnect();
          resize.disconnect();
        };
      }),
    [],
  );

  useEffect(() => {
    if (!zoomOpen) return;
    const dismiss = (event: PointerEvent) => {
      if (!zoomMenuRef.current?.contains(event.target as Node))
        setZoomOpen(false);
    };
    const escape = (event: KeyboardEvent) => {
      if (event.key === "Escape") setZoomOpen(false);
    };
    document.addEventListener("pointerdown", dismiss, true);
    document.addEventListener("keydown", escape);
    return () => {
      document.removeEventListener("pointerdown", dismiss, true);
      document.removeEventListener("keydown", escape);
    };
  }, [zoomOpen]);

  function adjustZoom(step: number) {
    setZoom(clamp(Math.round((percentage + step) / 10) * 10, 50, 200));
  }

  return (
    <div className="canvas-stage flex min-w-0 flex-1 flex-col bg-canvas dark:bg-neutral-900">
      <div className="canvas-toolbar grid min-h-12 grid-cols-[1fr_auto_1fr] items-center gap-2 border-b border-divide bg-white px-3 dark:border-neutral-800 dark:bg-neutral-950">
        <div className="flex min-w-0 items-center gap-2">
          <div
            role="group"
            aria-label="Preview device"
            className="flex rounded-lg bg-gray-200 p-0.5 dark:bg-neutral-800"
          >
            {(["desktop", "mobile"] as const).map((mode) => (
              <button
                key={mode}
                type="button"
                aria-pressed={device === mode}
                onClick={() => {
                  setDevice(mode);
                }}
                title={`${mode === "desktop" ? "Desktop" : "Mobile"} preview`}
                className={cn(
                  "flex h-8 items-center gap-1.5 rounded-md px-2 text-xs font-medium focus-visible:outline-2 focus-visible:outline-brand",
                  device === mode
                    ? "bg-white text-navy shadow-sm dark:bg-neutral-700 dark:text-white"
                    : "text-gray-600 dark:text-neutral-400",
                )}
              >
                {mode === "desktop" ? (
                  <Monitor className="size-3.5" />
                ) : (
                  <Smartphone className="size-3.5" />
                )}
                <span className="hidden xl:inline">
                  {mode === "desktop" ? "Desktop" : "Mobile"}
                </span>
              </button>
            ))}
          </div>
        </div>

        <div ref={zoomMenuRef} className="relative flex items-center gap-1">
          <IconButton label="Zoom out" onClick={() => adjustZoom(-10)}>
            <Minus className="size-4" />
          </IconButton>
          <button
            type="button"
            aria-label={`Zoom ${percentage} percent; choose zoom level`}
            aria-expanded={zoomOpen}
            aria-haspopup="menu"
            onClick={() => setZoomOpen((open) => !open)}
            className="h-8 min-w-15 rounded-md px-1 text-xs font-medium tabular-nums hover:bg-gray-200 focus-visible:outline-2 focus-visible:outline-brand dark:hover:bg-neutral-800"
          >
            {percentage}%
          </button>
          <IconButton label="Zoom in" onClick={() => adjustZoom(10)}>
            <Plus className="size-4" />
          </IconButton>
          {zoomOpen && (
            <div
              role="menu"
              className="absolute left-1/2 top-9 z-30 w-28 -translate-x-1/2 rounded-lg border border-divide bg-white p-1 shadow-float dark:border-neutral-700 dark:bg-neutral-900"
            >
              <button
                role="menuitemradio"
                aria-checked={zoom === "fit"}
                onClick={() => {
                  setZoom("fit");
                  setZoomOpen(false);
                }}
                className="w-full rounded px-2 py-1.5 text-left text-xs hover:bg-gray-200 dark:hover:bg-neutral-800"
              >
                Fit
              </button>
              {ZOOMS.map((value) => (
                <button
                  key={value}
                  role="menuitemradio"
                  aria-checked={zoom === value}
                  onClick={() => {
                    setZoom(value);
                    setZoomOpen(false);
                  }}
                  className="w-full rounded px-2 py-1.5 text-left text-xs hover:bg-gray-200 dark:hover:bg-neutral-800"
                >
                  {value}%
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="flex justify-end gap-0.5">
          <IconButton
            label="Undo"
            disabled={!history.hasPast}
            onClick={history.back}
          >
            <Undo2 className="size-4" />
          </IconButton>
          <IconButton
            label="Redo"
            disabled={!history.hasFuture}
            onClick={history.forward}
          >
            <Redo2 className="size-4" />
          </IconButton>
          <IconButton label="Clear canvas" onClick={onClear}>
            <Trash2 className="size-4" />
          </IconButton>
          <span className="mx-1 h-6 border-l border-divide dark:border-neutral-800" />
          <IconButton
            label={dark ? "Edit email" : "Dark preview"}
            active={dark}
            onClick={() => setDark((current) => !current)}
          >
            {dark ? <Pencil className="size-4" /> : <Eye className="size-4" />}
          </IconButton>
          {!propertiesOpen && (
            <IconButton label="Open properties" onClick={onOpenProperties}>
              <PanelRightOpen className="size-4" />
            </IconButton>
          )}
        </div>
      </div>
      {dark && (
        <div className="border-b border-brand/20 bg-brand/8 px-4 py-1.5 text-center text-xs text-navy dark:bg-brand/10 dark:text-brand">
          Dark preview estimate · switch back to edit
        </div>
      )}
      <div ref={stageRef} className="min-h-0 flex-1 overflow-auto p-6">
        <div
          className="relative mx-auto"
          style={{ width: deviceWidth * scale, height: contentHeight * scale }}
        >
          <div
            className="origin-top-left bg-white shadow-card"
            style={{
              width: deviceWidth,
              height: contentHeight,
              transform: `scale(${scale})`,
            }}
          >
            {dark ? (
              <DarkPreview data={data} />
            ) : (
              <Puck.Preview id="email-preview" />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
