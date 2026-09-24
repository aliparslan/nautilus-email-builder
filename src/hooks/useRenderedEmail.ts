"use client";

import { useEffect, useRef, useState } from "react";
import type { EmailData } from "@/email/config";
import type { RenderedEmail } from "@/email/render";
import { api, ApiClientError } from "@/lib/client-api";

type Result = {
  forData: EmailData;
  rendered: (RenderedEmail & { from: string; fromEmail: string }) | null;
  error: string | null;
};

/** Renders through the same server path used for sending, so the preview is the sent bytes. */
export function useRenderedEmail(data: EmailData) {
  const [result, setResult] = useState<Result | null>(null);
  const hasRequested = useRef(false);

  useEffect(() => {
    const controller = new AbortController();
    let active = true;
    const timer = setTimeout(() => {
      hasRequested.current = true;
      void api.render(data, controller.signal).then(
        (rendered) => {
          if (active) setResult({ forData: data, rendered, error: null });
        },
        (cause) => {
          if (!active || controller.signal.aborted) return;
          setResult({
            forData: data,
            rendered: null,
            error:
              cause instanceof ApiClientError
                ? cause.message
                : "Couldn't render this email",
          });
        },
      );
    }, hasRequested.current ? 300 : 0);

    return () => {
      active = false;
      clearTimeout(timer);
      controller.abort();
    };
  }, [data]);

  const current = result?.forData === data ? result : null;
  return {
    // Keep the previous preview and sender address visible while re-rendering.
    rendered: current ? current.rendered : result?.rendered ?? null,
    error: current?.error ?? null,
    loading: current === null,
  };
}
