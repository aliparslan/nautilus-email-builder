import { NextResponse } from "next/server";
import { renderEmail } from "@/email/render";
import { apiError, parseBody } from "@/lib/api";
import { fromHeader } from "@/lib/env";
import { emailDataSchema } from "@/lib/schemas";
import { z } from "zod";

const renderRequestSchema = z.object({ data: emailDataSchema });

export async function POST(req: Request) {
  const body = await parseBody(req, renderRequestSchema);
  if (!body.ok) return body.response;

  try {
    const rendered = await renderEmail(body.value.data);
    return NextResponse.json({ ...rendered, from: fromHeader });
  } catch (e) {
    console.error("render failed", e);
    return apiError("Couldn't render this email", 500);
  }
}
