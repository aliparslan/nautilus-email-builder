import { NextResponse } from "next/server";
import type { ZodType } from "zod";
import { SchedulerUnavailableError } from "@/lib/scheduler";

export type ApiError = { error: string; code?: string; issues?: string[] };

export function apiError(
  message: string,
  status: number,
  extra: Omit<ApiError, "error"> = {},
) {
  return NextResponse.json<ApiError>({ error: message, ...extra }, { status });
}

/** Parses a JSON body against a schema, returning either the value or a ready-to-send 400. */
export async function parseBody<T>(
  req: Request,
  schema: ZodType<T>,
): Promise<{ ok: true; value: T } | { ok: false; response: NextResponse }> {
  let json: unknown;
  try {
    json = await req.json();
  } catch {
    return { ok: false, response: apiError("Request body must be JSON", 400) };
  }
  const result = schema.safeParse(json);
  if (!result.success) {
    const issues = result.error.issues.map((i) =>
      i.path.length ? `${i.path.join(".")}: ${i.message}` : i.message,
    );
    return {
      ok: false,
      response: apiError(issues[0] ?? "Invalid request", 400, { issues }),
    };
  }
  return { ok: true, value: result.data };
}

export function schedulerError(e: unknown) {
  if (e instanceof SchedulerUnavailableError)
    return apiError(e.message, 503, { code: "scheduler_unavailable" });
  console.error("scheduler error", e);
  return apiError("Something went wrong with scheduling", 500);
}
