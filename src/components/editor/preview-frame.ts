type PreviewConnection = (
  document: Document,
  frame: HTMLIFrameElement,
) => void | (() => void);

/**
 * Connect to Puck's preview document and reconnect whenever Puck replaces or
 * reloads its iframe. Puck remounts the frame for a few editor view changes,
 * so a one-time query leaves shortcuts and editor-only theming behind.
 */
export function observePreviewFrame(connect: PreviewConnection) {
  let frame: HTMLIFrameElement | null = null;
  let frameDocument: Document | null = null;
  let disconnectCurrent: (() => void) | undefined;

  const attach = () => {
    const nextFrame = document.getElementById(
      "preview-frame",
    ) as HTMLIFrameElement | null;
    const nextDocument = nextFrame?.contentDocument ?? null;

    if (nextFrame === frame && nextDocument === frameDocument) return;

    disconnectCurrent?.();
    frame?.removeEventListener("load", attach);
    frame = nextFrame;
    frameDocument = nextDocument;
    disconnectCurrent = undefined;

    if (!frame) return;
    frame.addEventListener("load", attach);
    if (frameDocument) disconnectCurrent = connect(frameDocument, frame) || undefined;
  };

  attach();
  const observer = new MutationObserver(attach);
  observer.observe(document.body, { childList: true, subtree: true });

  return () => {
    observer.disconnect();
    frame?.removeEventListener("load", attach);
    disconnectCurrent?.();
  };
}
