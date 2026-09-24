import type { EmailData } from "@/email/config";
import type { RenderedEmail } from "@/email/render";
import type { ScheduledEmail } from "@/lib/scheduler";
import type { ApiError } from "./api";

export class ApiClientError extends Error {
  constructor(
    message: string,
    readonly status: number,
    readonly code?: string,
  ) {
    super(message);
    this.name = "ApiClientError";
  }
}

async function request<T>(url: string, init?: RequestInit): Promise<T> {
  let res: Response;
  try {
    res = await fetch(url, {
      ...init,
      headers: { "content-type": "application/json", ...init?.headers },
    });
  } catch (error) {
    if (init?.signal?.aborted) throw error;
    throw new ApiClientError(
      "Can't reach the server. Check your connection.",
      0,
    );
  }
  const body = (await res.json().catch(() => null)) as
    (T & Partial<ApiError>) | null;
  if (!res.ok) {
    throw new ApiClientError(
      body?.error ?? `Request failed (${res.status})`,
      res.status,
      body?.code,
    );
  }
  return body as T;
}

export const api = {
  render: (data: EmailData, signal?: AbortSignal) =>
    request<RenderedEmail & { from: string; fromEmail: string }>("/api/email/render", {
      method: "POST",
      body: JSON.stringify({ data }),
      signal,
    }),

  send: (payload: { data: EmailData; to: string[]; subject: string; senderLocalPart?: string }) =>
    request<{ id: string }>("/api/email/send", {
      method: "POST",
      body: JSON.stringify(payload),
    }),

  schedule: (payload: {
    data: EmailData;
    to: string[];
    subject: string;
    senderLocalPart?: string;
    sendAt: string;
  }) =>
    request<{ item: ScheduledEmail }>("/api/schedule", {
      method: "POST",
      body: JSON.stringify(payload),
    }),

  listScheduled: () => request<{ items: ScheduledEmail[] }>("/api/schedule"),

  cancelScheduled: (id: string) =>
    request<{ ok: true }>(`/api/schedule/${encodeURIComponent(id)}`, {
      method: "DELETE",
    }),
};
