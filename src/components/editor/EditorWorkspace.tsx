"use client";

import { Puck, type Data } from "@puckeditor/core";
import {
  Check,
  ChevronDown,
  CircleHelp,
  Image as ImageIcon,
  Layers,
  LayoutTemplate,
  LibraryBig,
  Mail,
  Monitor,
  Moon,
  PanelRightClose,
  Send,
  SquarePen,
  SquarePlus,
  Sun,
  Users,
  X,
} from "lucide-react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import Image from "next/image";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { toast } from "sonner";
import type { EmailData } from "@/email/config";
import type { EmailTemplate } from "@/email/templates";
import { useRecipients } from "@/hooks/useRecipients";
import { useEmailHistory } from "@/hooks/useEmailHistory";
import type { SavedPattern } from "@/hooks/usePatterns";
import { DEFAULT_ROOT_PROPS } from "@/email/root";
import { useTheme } from "@/components/theme/useTheme";
import type { ThemePreference } from "@/components/theme/theme";
import { cn } from "@/lib/cn";
import { useTooltip } from "@/components/ui/useTooltip";
import { AssetsPanel } from "./AssetsPanel";
import { BlocksPanel } from "./BlocksPanel";
import { CanvasStage } from "./CanvasStage";
import { EmailsPanel } from "./EmailsPanel";
import {
  addBlock,
  addSavedNode,
  insertionLocation,
  renameNode,
  setSavedNode,
  setImageAsset,
  type BlockType,
  type EmailNode,
  type ImageAsset,
} from "./editor-data";
import { useEmailPuck } from "./puck";
import { RecipientsDialog } from "./RecipientsDialog";
import { ReviewSendDialog } from "./ReviewSendDialog";
import { ShortcutsDialog } from "./ShortcutsDialog";
import { useShortcuts } from "./shortcuts";
import { TemplatesPanel } from "./TemplatesPanel";
import { PatternsPanel } from "./PatternsPanel";
import { LayersPanel } from "./LayersPanel";
import { observePreviewFrame } from "./preview-frame";
import { WalkthroughDialog } from "./WalkthroughDialog";
import { Button } from "../ui/Button";
import { Dialog, DialogBody, DialogFooter } from "../ui/Dialog";
import { IconButton } from "../ui/IconButton";

type Panel =
  "layers" | "assets" | "blocks" | "patterns" | "templates" | "emails";
type DialogName =
  "recipients" | "review" | "shortcuts" | "clear" | "walkthrough" | null;
type Mode = "now" | "later";
export type DroppedItem =
  | { id: string; kind: "asset"; asset: ImageAsset }
  | { id: string; kind: "pattern"; pattern: SavedPattern };
const WALKTHROUGH_KEY = "nautilus-email:walkthrough:v1";

const RAIL_TOP = [
  { id: "layers", label: "Layers", Icon: Layers },
  { id: "assets", label: "Assets", Icon: ImageIcon },
  { id: "blocks", label: "Blocks", Icon: SquarePlus },
  { id: "patterns", label: "Patterns", Icon: LibraryBig },
  { id: "templates", label: "Templates", Icon: LayoutTemplate },
] as const;

const LAYER_APPEARANCE: Record<string, { color: string; icon: string }> = {
  Section: { color: "#007da9", icon: "panels-top-left" },
  Columns: { color: "#5669b6", icon: "columns-3" },
  Container: { color: "#557a98", icon: "square" },
  Heading: { color: "#a45189", icon: "heading-1" },
  Text: { color: "#677198", icon: "align-left" },
  Button: { color: "#a87623", icon: "rectangle-horizontal" },
  Image: { color: "#16846b", icon: "image" },
  Divider: { color: "#72818c", icon: "minus" },
  Spacer: { color: "#627b83", icon: "space" },
  MisterHeader: { color: "#c08b00", icon: "layout-panel-top" },
  MisterMembershipHero: { color: "#00a7d5", icon: "sparkles" },
  MisterProductSpotlight: { color: "#8b62c9", icon: "badge-dollar-sign" },
  MisterLocationCta: { color: "#d68508", icon: "map-pin" },
};

/** Puck owns the Layers DOM, so style its stable item IDs from our document data. */
function layerIconStyles(data: EmailData) {
  const rules: string[] = [];
  const walk = (nodes: EmailData["content"]) => {
    for (const node of nodes) {
      const appearance = LAYER_APPEARANCE[node.type];
      if (appearance && typeof node.props.id === "string")
        rules.push(
          `.nautilus-editor [data-puck-layer-tree-id=${CSS.escape(node.props.id)}] { --puck-outline-color-icon: ${appearance.color}; --puck-outline-icon: url(/layer-icons/${appearance.icon}.svg); }`,
        );
      for (const value of Object.values(node.props)) {
        if (
          Array.isArray(value) &&
          value.every(
            (item) =>
              item &&
              typeof item === "object" &&
              "type" in item &&
              "props" in item,
          )
        )
          walk(value as EmailData["content"]);
      }
    }
  };
  walk(data.content);
  return rules.join("\n");
}

export function EditorWorkspace({
  savedAt,
  onSaveNow,
  onAssetDragStart,
  onPatternDragStart,
  registerDrop,
}: {
  savedAt: string | null;
  onSaveNow: () => boolean;
  onAssetDragStart: (asset: ImageAsset | null) => void;
  onPatternDragStart: (pattern: SavedPattern | null) => void;
  registerDrop: (handler: ((drop: DroppedItem) => void) | null) => void;
}) {
  const data = useEmailPuck((store) => store.appState.data as EmailData);
  const layerStyles = useMemo(() => layerIconStyles(data), [data]);
  const selected = useEmailPuck((store) => store.selectedItem);
  const getSelectorForId = useEmailPuck((store) => store.getSelectorForId);
  const dispatch = useEmailPuck((store) => store.dispatch);
  const history = useEmailPuck((store) => store.history);
  const recipients = useRecipients();
  const emailHistory = useEmailHistory();
  const { theme, preference, setPreference } = useTheme();
  const reducedMotion = useReducedMotion();
  const [panel, setPanel] = useState<Panel | null>("blocks");
  const [dialog, setDialog] = useState<DialogName>(() =>
    localStorage.getItem(WALKTHROUGH_KEY) ? null : "walkthrough",
  );
  const [sendMenu, setSendMenu] = useState(false);
  const [themeMenu, setThemeMenu] = useState(false);
  const [reviewMode, setReviewMode] = useState<Mode>("now");
  const [editingTitle, setEditingTitle] = useState(false);
  const [titleDraft, setTitleDraft] = useState("");
  const [sideWidth, setSideWidth] = useState(280);
  const [resizing, setResizing] = useState(false);
  const [propertiesWidth, setPropertiesWidth] = useState(300);
  const [propertiesOpen, setPropertiesOpen] = useState(true);
  const [propertiesResizing, setPropertiesResizing] = useState(false);
  const resizeRef = useRef<{ x: number; width: number } | null>(null);
  const propertiesResizeRef = useRef<{ x: number; width: number } | null>(null);
  const sendMenuRef = useRef<HTMLDivElement>(null);
  const themeMenuRef = useRef<HTMLDivElement>(null);
  const cancelTitleRef = useRef(false);
  const renameTooltip = useTooltip("Rename project");
  const selectedNode = selected as EmailNode | null;

  useEffect(() => {
    if (!sendMenu && !themeMenu) return;
    const dismiss = (event: PointerEvent) => {
      const target = event.target as Node;
      if (sendMenu && !sendMenuRef.current?.contains(target))
        setSendMenu(false);
      if (themeMenu && !themeMenuRef.current?.contains(target))
        setThemeMenu(false);
    };
    const escape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setSendMenu(false);
        setThemeMenu(false);
      }
    };
    document.addEventListener("pointerdown", dismiss, true);
    document.addEventListener("keydown", escape);
    return () => {
      document.removeEventListener("pointerdown", dismiss, true);
      document.removeEventListener("keydown", escape);
    };
  }, [sendMenu, themeMenu]);

  /*
   * Puck portals the selected-block toolbar into the preview iframe. Mirror only
   * the editor appearance there so the toolbar follows the shell without
   * applying the app's dark theme to the email itself.
   */
  useEffect(() => {
    return observePreviewFrame((previewDocument) => {
      previewDocument.documentElement.dataset.editorTheme = theme;
      return () => {
        delete previewDocument.documentElement.dataset.editorTheme;
      };
    });
  }, [theme]);

  useEffect(() => {
    registerDrop((drop) => {
      dispatch({
        type: "setData",
        recordHistory: true,
        data: (previous) =>
          (drop.kind === "asset"
            ? setImageAsset(previous as EmailData, drop.id, drop.asset)
            : setSavedNode(
                previous as EmailData,
                drop.id,
                drop.pattern.node,
              )) as Data,
      });
    });
    return () => registerDrop(null);
  }, [dispatch, registerDrop]);

  const title =
    data.root.props?.projectTitle ||
    data.root.props?.subject ||
    "Untitled email";
  const subject = data.root.props?.subject ?? "";
  const previewText = data.root.props?.previewText ?? "";

  function setRootField<
    K extends keyof NonNullable<EmailData["root"]["props"]>,
  >(key: K, value: NonNullable<EmailData["root"]["props"]>[K]) {
    dispatch({
      type: "setData",
      recordHistory: true,
      data: (previous) => ({
        ...previous,
        root: {
          ...previous.root,
          props: { ...previous.root.props, [key]: value },
        },
      }),
    });
  }

  function insert(type: BlockType, extraProps: Record<string, unknown> = {}) {
    const selector = selected
      ? getSelectorForId(String(selected.props.id))
      : undefined;
    const location = insertionLocation(data, type, selected, selector);
    if (Object.keys(extraProps).length) {
      const next = addBlock(data, type, location, extraProps);
      dispatch({ type: "setData", data: next as Data, recordHistory: true });
    } else {
      dispatch({
        type: "insert",
        componentType: type,
        destinationIndex: location.index,
        destinationZone: location.zone,
      });
    }
    dispatch({
      type: "setUi",
      ui: { itemSelector: { zone: location.zone, index: location.index } },
    });
  }

  function insertSaved(pattern: SavedPattern) {
    const selector = selectedNode
      ? getSelectorForId(String(selectedNode.props.id))
      : undefined;
    const location = insertionLocation(
      data,
      pattern.node.type,
      selectedNode,
      selector,
    );
    dispatch({
      type: "setData",
      recordHistory: true,
      data: addSavedNode(data, pattern.node, location) as Data,
    });
    toast.success(`${pattern.name} added`);
  }

  function loadActivity(
    snapshot: EmailData,
    addresses: string[],
    duplicate: boolean,
  ) {
    const next = structuredClone(snapshot);
    if (duplicate) {
      const currentTitle =
        next.root.props?.projectTitle || next.root.props?.subject || "Email";
      next.root.props = {
        ...DEFAULT_ROOT_PROPS,
        ...next.root.props,
        projectTitle: `${currentTitle} copy`,
      };
    }
    dispatch({ type: "setData", data: next as Data, recordHistory: true });
    dispatch({ type: "setUi", ui: { itemSelector: null } });
    recipients.setSelection({ direct: addresses, groupIds: [] });
    setPanel("layers");
    toast.success(duplicate ? "Email duplicated" : "Email ready to edit");
  }

  function clearCanvas() {
    dispatch({
      type: "setData",
      recordHistory: true,
      data: (previous) => ({ ...previous, content: [] }),
    });
    dispatch({ type: "setUi", ui: { itemSelector: null } });
    setDialog(null);
    toast.success("Canvas cleared", {
      description: "Use Undo to restore the content.",
    });
  }

  function closeWalkthrough() {
    localStorage.setItem(WALKTHROUGH_KEY, "complete");
    setDialog(null);
  }

  function applyTemplate(template: EmailTemplate) {
    const next = structuredClone(template.data);
    next.root.props = {
      ...DEFAULT_ROOT_PROPS,
      ...next.root.props,
      projectTitle: template.name,
    };
    dispatch({ type: "setData", data: next as Data, recordHistory: true });
    dispatch({ type: "setUi", ui: { itemSelector: null } });
    recipients.clearSelection();
    toast.success(`${template.name} applied`);
  }

  const openReview = useCallback((mode: Mode) => {
    setReviewMode(mode);
    setSendMenu(false);
    setDialog("review");
  }, []);

  const saveNow = useCallback(() => {
    toast.success(onSaveNow() ? "Draft saved" : "Already saved", {
      duration: 1500,
    });
  }, [onSaveNow]);

  useShortcuts(
    useMemo(
      () => ({
        undo: history.back,
        redo: history.forward,
        review: () => openReview("now"),
        recipients: () => setDialog("recipients"),
        templates: () => setPanel("templates"),
        scheduled: () => setPanel("emails"),
        shortcuts: () =>
          setDialog((current) =>
            current === "shortcuts" ? null : "shortcuts",
          ),
        save: saveNow,
      }),
      [openReview, saveNow, history.back, history.forward],
    ),
    dialog === null || dialog === "shortcuts",
  );

  function startTitleEdit() {
    cancelTitleRef.current = false;
    setTitleDraft(title);
    setEditingTitle(true);
  }

  function commitTitle() {
    if (cancelTitleRef.current) {
      cancelTitleRef.current = false;
      setEditingTitle(false);
      return;
    }
    if (titleDraft.trim() !== title)
      setRootField("projectTitle", titleDraft.trim() || "Untitled email");
    setEditingTitle(false);
  }

  return (
    <div className="nautilus-editor flex h-dvh min-h-[600px] flex-col bg-white text-charcoal-900 dark:bg-neutral-950 dark:text-neutral-100">
      <style>{layerStyles}</style>
      <header className="grid h-12 shrink-0 grid-cols-[1fr_auto_1fr] items-center gap-3 border-b border-divide px-3 dark:border-neutral-800">
        <div className="flex min-w-0 items-center gap-2.5">
          <Image
            src="/nautilus-porthole.png"
            alt=""
            width={24}
            height={24}
            priority
            className="size-6 shrink-0"
          />
          <span className="font-heading truncate text-[15px] font-medium tracking-[0.005em]">
            Email Builder
          </span>
        </div>
        <div className="min-w-0 max-w-[300px]">
          {editingTitle ? (
            <div className="flex items-center gap-1">
              <input
                autoFocus
                aria-label="Project title"
                value={titleDraft}
                maxLength={100}
                onChange={(event) => setTitleDraft(event.target.value)}
                onBlur={commitTitle}
                onKeyDown={(event) => {
                  if (event.key === "Enter") event.currentTarget.blur();
                  if (event.key === "Escape") {
                    cancelTitleRef.current = true;
                    event.currentTarget.blur();
                  }
                }}
                className="h-8 min-w-0 flex-1 rounded-md border border-brand bg-white px-2 text-center text-sm outline-none dark:bg-neutral-900"
              />
              <button
                type="button"
                aria-label="Save project title"
                title="Save project title"
                onMouseDown={(event) => event.preventDefault()}
                onClick={commitTitle}
                className="rounded p-1 hover:bg-gray-200 dark:hover:bg-neutral-800"
              >
                <Check className="size-4" />
              </button>
            </div>
          ) : (
            <button
              type="button"
              onClick={startTitleEdit}
              {...renameTooltip.trigger}
              className="group flex h-8 max-w-full items-center justify-center gap-1.5 rounded-md px-2 text-sm font-medium hover:bg-gray-200 focus-visible:outline-2 focus-visible:outline-brand dark:hover:bg-neutral-800"
            >
              <span className="truncate">{title}</span>
              <SquarePen
                className="size-4 shrink-0 text-charcoal-800 group-hover:text-brand dark:text-neutral-300"
                strokeWidth={2}
              />
            </button>
          )}
        </div>
        <div className="flex items-center justify-end gap-2">
          <button
            type="button"
            onClick={() => setDialog("recipients")}
            className="flex h-8 items-center gap-1.5 rounded-md px-2 text-xs font-medium text-charcoal-800 hover:bg-gray-200 focus-visible:outline-2 focus-visible:outline-brand dark:text-neutral-200 dark:hover:bg-neutral-800"
          >
            <Users className="size-4" />
            <span>Recipients</span>
            {recipients.addresses.length > 0 && (
              <span className="rounded bg-gray-200 px-1 tabular-nums dark:bg-neutral-800">
                {recipients.addresses.length}
              </span>
            )}
          </button>
          <div
            ref={sendMenuRef}
            className="relative flex h-8 rounded-md bg-brand text-white"
          >
            <button
              type="button"
              onClick={() => openReview("now")}
              className="flex items-center gap-1.5 rounded-l-md px-3 text-xs font-semibold hover:bg-white/10 focus-visible:outline-2 focus-visible:outline-brand"
            >
              <Send className="size-3.5" strokeWidth={2} />
              Send
            </button>
            <button
              type="button"
              aria-label="Send options"
              aria-expanded={sendMenu}
              aria-haspopup="menu"
              onClick={() => setSendMenu((open) => !open)}
              className="flex w-7 items-center justify-center rounded-r-md border-l border-white/25 hover:bg-white/10 focus-visible:outline-2 focus-visible:outline-brand"
            >
              <ChevronDown className="size-3.5" />
            </button>
            {sendMenu && (
              <div
                role="menu"
                className="absolute right-0 top-9 z-30 w-36 rounded-lg border border-divide bg-white p-1 text-charcoal-900 shadow-float dark:border-neutral-700 dark:bg-neutral-900 dark:text-white"
              >
                <button
                  type="button"
                  role="menuitem"
                  onClick={() => openReview("later")}
                  className="w-full rounded px-2 py-1.5 text-left text-xs hover:bg-gray-200 dark:hover:bg-neutral-800"
                >
                  Schedule send
                </button>
              </div>
            )}
          </div>
        </div>
      </header>

      <div className="flex min-h-0 flex-1">
        <nav
          aria-label="Editor panels"
          className="flex w-14 shrink-0 flex-col items-center justify-between border-r border-divide bg-white py-2 dark:border-neutral-800 dark:bg-neutral-950"
        >
          <div className="flex flex-col gap-1">
            {RAIL_TOP.map(({ id, label, Icon }) => (
              <RailButton
                key={id}
                label={label}
                active={panel === id}
                onClick={() =>
                  setPanel((current) => (current === id ? null : id))
                }
              >
                <Icon className="size-5" strokeWidth={1.9} />
              </RailButton>
            ))}
          </div>
          <div ref={themeMenuRef} className="relative flex flex-col gap-1">
            <RailButton
              label="Emails"
              active={panel === "emails"}
              onClick={() =>
                setPanel((current) => (current === "emails" ? null : "emails"))
              }
            >
              <Mail className="size-5" strokeWidth={1.9} />
            </RailButton>
            <RailButton
              label="Keyboard shortcuts"
              onClick={() => setDialog("shortcuts")}
            >
              <CircleHelp className="size-5" strokeWidth={1.9} />
            </RailButton>
            <RailButton
              label="Theme"
              active={themeMenu}
              onClick={() => setThemeMenu((open) => !open)}
            >
              {preference === "system" ? (
                <Monitor className="size-5" strokeWidth={1.9} />
              ) : preference === "dark" ? (
                <Moon className="size-5" strokeWidth={1.9} />
              ) : (
                <Sun className="size-5" strokeWidth={1.9} />
              )}
            </RailButton>
            {themeMenu && (
              <div
                role="menu"
                className="absolute bottom-0 left-12 z-40 w-36 rounded-lg border border-divide bg-white p-1 shadow-float dark:border-neutral-700 dark:bg-neutral-900"
              >
                {(["system", "light", "dark"] as ThemePreference[]).map(
                  (choice) => (
                    <button
                      key={choice}
                      type="button"
                      role="menuitemradio"
                      aria-checked={preference === choice}
                      onClick={() => {
                        setPreference(choice);
                        setThemeMenu(false);
                      }}
                      className="flex w-full items-center justify-between rounded px-2 py-1.5 text-left text-xs capitalize hover:bg-gray-200 dark:hover:bg-neutral-800"
                    >
                      {choice}
                      {preference === choice && (
                        <Check className="size-3.5 text-brand" />
                      )}
                    </button>
                  ),
                )}
              </div>
            )}
          </div>
        </nav>

        <AnimatePresence initial={false}>
          {panel && (
            <motion.aside
              key="left-panel"
              aria-label={`${panel} panel`}
              initial={reducedMotion ? false : { width: 0, opacity: 0 }}
              animate={{ width: sideWidth, opacity: 1 }}
              exit={reducedMotion ? { width: 0 } : { width: 0, opacity: 0 }}
              transition={{ duration: reducedMotion || resizing ? 0 : 0.18 }}
              className="relative min-h-0 shrink-0 overflow-hidden border-r border-divide bg-white dark:border-neutral-800 dark:bg-neutral-950"
            >
              <div
                className="flex h-full flex-col"
                style={{ width: sideWidth }}
              >
                <div className="flex h-11 shrink-0 items-center justify-between border-b border-divide px-4 dark:border-neutral-800">
                  <h2 className="text-sm font-semibold capitalize">{panel}</h2>
                  <button
                    type="button"
                    onClick={() => setPanel(null)}
                    aria-label="Close panel"
                    className="rounded p-1 text-gray-600 hover:bg-gray-200 dark:hover:bg-neutral-800"
                  >
                    <X className="size-4" />
                  </button>
                </div>
                <div className="min-h-0 flex-1 overflow-y-auto">
                  {panel === "layers" && (
                    <LayersPanel
                      data={data}
                      selected={selectedNode}
                      onRename={(id, name) => {
                        if (!name) return;
                        dispatch({
                          type: "setData",
                          recordHistory: true,
                          data: renameNode(data, id, name) as Data,
                        });
                      }}
                    />
                  )}
                  {panel === "assets" && (
                    <AssetsPanel
                      data={data}
                      onInsert={(src, alt) =>
                        insert("Image", { src, ...(alt ? { alt } : {}) })
                      }
                      onDragStart={onAssetDragStart}
                    />
                  )}
                  {panel === "blocks" && (
                    <BlocksPanel onInsert={(type) => insert(type)} />
                  )}
                  {panel === "patterns" && (
                    <PatternsPanel
                      selected={selectedNode}
                      onInsert={(type) => insert(type)}
                      onInsertSaved={insertSaved}
                      onDragStart={onPatternDragStart}
                    />
                  )}
                  {panel === "templates" && (
                    <TemplatesPanel data={data} onSelect={applyTemplate} />
                  )}
                  {panel === "emails" && (
                    <EmailsPanel
                      title={title}
                      savedAt={savedAt}
                      history={emailHistory}
                      onSaveNow={saveNow}
                      onLoad={loadActivity}
                    />
                  )}
                </div>
              </div>
              <button
                type="button"
                aria-label="Resize left panel"
                title="Drag to resize left panel"
                onPointerDown={(event) => {
                  event.preventDefault();
                  event.currentTarget.setPointerCapture(event.pointerId);
                  resizeRef.current = { x: event.clientX, width: sideWidth };
                  setResizing(true);
                }}
                onPointerMove={(event) => {
                  if (resizeRef.current)
                    setSideWidth(
                      Math.min(
                        420,
                        Math.max(
                          240,
                          resizeRef.current.width +
                            event.clientX -
                            resizeRef.current.x,
                        ),
                      ),
                    );
                }}
                onPointerUp={() => {
                  resizeRef.current = null;
                  setResizing(false);
                }}
                onPointerCancel={() => {
                  resizeRef.current = null;
                  setResizing(false);
                }}
                onKeyDown={(event) => {
                  if (event.key === "ArrowLeft" || event.key === "ArrowRight") {
                    event.preventDefault();
                    setSideWidth((width) =>
                      Math.min(
                        420,
                        Math.max(
                          240,
                          width + (event.key === "ArrowRight" ? 20 : -20),
                        ),
                      ),
                    );
                  }
                }}
                className="absolute inset-y-0 right-0 z-10 w-1.5 cursor-col-resize border-r border-transparent hover:border-brand focus-visible:outline-2 focus-visible:outline-brand"
              />
            </motion.aside>
          )}
        </AnimatePresence>

        <CanvasStage
          data={data}
          onClear={() => setDialog("clear")}
          propertiesOpen={propertiesOpen}
          onOpenProperties={() => setPropertiesOpen(true)}
        />
        <AnimatePresence initial={false}>
          {propertiesOpen && (
            <motion.aside
              key="properties-panel"
              aria-label="Properties"
              initial={reducedMotion ? false : { width: 0, opacity: 0 }}
              animate={{ width: propertiesWidth, opacity: 1 }}
              exit={reducedMotion ? { width: 0 } : { width: 0, opacity: 0 }}
              transition={{
                duration: reducedMotion || propertiesResizing ? 0 : 0.18,
              }}
              className="properties-panel relative flex min-h-0 shrink-0 flex-col overflow-hidden border-l border-divide bg-white dark:border-neutral-800 dark:bg-neutral-950"
            >
              <button
                type="button"
                aria-label="Resize properties panel"
                onPointerDown={(event) => {
                  event.preventDefault();
                  event.currentTarget.setPointerCapture(event.pointerId);
                  propertiesResizeRef.current = {
                    x: event.clientX,
                    width: propertiesWidth,
                  };
                  setPropertiesResizing(true);
                }}
                onPointerMove={(event) => {
                  if (propertiesResizeRef.current) {
                    const { x, width } = propertiesResizeRef.current;
                    setPropertiesWidth(
                      Math.min(460, Math.max(270, width + x - event.clientX)),
                    );
                  }
                }}
                onPointerUp={() => {
                  propertiesResizeRef.current = null;
                  setPropertiesResizing(false);
                }}
                onPointerCancel={() => {
                  propertiesResizeRef.current = null;
                  setPropertiesResizing(false);
                }}
                onKeyDown={(event) => {
                  if (event.key === "ArrowLeft" || event.key === "ArrowRight") {
                    event.preventDefault();
                    setPropertiesWidth((width) =>
                      Math.min(
                        460,
                        Math.max(
                          270,
                          width + (event.key === "ArrowLeft" ? 20 : -20),
                        ),
                      ),
                    );
                  }
                }}
                className="absolute inset-y-0 left-0 z-10 w-1.5 cursor-col-resize border-l border-transparent hover:border-brand focus-visible:outline-2 focus-visible:outline-brand"
              />
              <div
                className="flex h-full flex-col"
                style={{ width: propertiesWidth }}
              >
                <div className="flex h-12 shrink-0 items-center justify-between border-b border-divide px-4 dark:border-neutral-800">
                  <h2 className="text-sm font-semibold">Properties</h2>
                  <IconButton
                    label="Close properties"
                    tooltip={false}
                    onClick={() => setPropertiesOpen(false)}
                  >
                    <PanelRightClose className="size-4" />
                  </IconButton>
                </div>
                <div className="min-h-0 flex-1 overflow-y-auto">
                  <Puck.Fields wrapFields={false} />
                </div>
              </div>
            </motion.aside>
          )}
        </AnimatePresence>
      </div>

      <RecipientsDialog
        open={dialog === "recipients"}
        onClose={() => setDialog(null)}
        recipients={recipients}
      />
      <ReviewSendDialog
        open={dialog === "review"}
        onClose={() => setDialog(null)}
        initialMode={reviewMode}
        data={data}
        subject={subject}
        onSubjectChange={(value) => setRootField("subject", value)}
        onPreviewTextChange={(value) => setRootField("previewText", value)}
        previewText={previewText}
        recipients={recipients}
        onActivity={emailHistory.record}
        onScheduled={() => {
          setDialog(null);
          setPanel("emails");
        }}
      />
      <ShortcutsDialog
        open={dialog === "shortcuts"}
        onClose={() => setDialog(null)}
      />
      <Dialog
        open={dialog === "clear"}
        onClose={() => setDialog(null)}
        title="Clear the canvas?"
      >
        <DialogBody className="px-6 pb-2 text-sm leading-6 text-gray-600 dark:text-neutral-300">
          This removes every block from the current email. You can restore the
          content with Undo.
        </DialogBody>
        <DialogFooter>
          <Button variant="ghost" onClick={() => setDialog(null)}>
            Cancel
          </Button>
          <Button variant="danger" onClick={clearCanvas}>
            Clear canvas
          </Button>
        </DialogFooter>
      </Dialog>
      <WalkthroughDialog
        open={dialog === "walkthrough"}
        onClose={closeWalkthrough}
      />
      {renameTooltip.tooltip}
    </div>
  );
}

function RailButton({
  label,
  active,
  onClick,
  children,
}: {
  label: string;
  active?: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  const { trigger, tooltip } = useTooltip(label, "right");
  return (
    <>
      <button
        type="button"
        aria-label={label}
        aria-pressed={active}
        onClick={onClick}
        {...trigger}
        className={cn(
          "flex size-10 items-center justify-center rounded-lg transition-colors focus-visible:outline-2 focus-visible:outline-brand",
          active
            ? "bg-brand/10 text-brand"
            : "text-navy hover:bg-brand/[0.07] hover:text-brand dark:text-neutral-300 dark:hover:bg-neutral-800 dark:hover:text-brand",
        )}
      >
        <span className="flex size-5 items-center justify-center">
          {children}
        </span>
      </button>
      {tooltip}
    </>
  );
}
