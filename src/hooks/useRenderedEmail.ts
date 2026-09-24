"use client";

import { useEffect, useState } from "react";
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

  useEffect(() => {
    let cancelled = false;
    api
      .render(data)
      .then(
        (rendered) =>
          !cancelled && setResult({ forData: data, rendered, error: null }),
      )
      .catch(
        (e) =>
          !cancelled &&
          setResult({
            forData: data,
            rendered: null,
            error:
              e instanceof ApiClientError
                ? e.message
                : "Couldn't render this email",
          }),
      );
    return () => {
      cancelled = true;
    };
  }, [data]);

  const current = result?.forData === data ? result : null;
  return {
    rendered: current?.rendered ?? null,
    error: current?.error ?? null,
    loading: current === null,
  };
}
