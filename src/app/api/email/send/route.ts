import { NextResponse } from "next/server";
import { apiError, parseBody } from "@/lib/api";
import { sendRequestSchema } from "@/lib/schemas";
import { SendEmailError, sendEmail } from "@/lib/send-email";

export async function POST(req: Request) {
  const body = await parseBody(req, sendRequestSchema);
  if (!body.ok) return body.response;

  try {
    const { id } = await sendEmail(body.value);
    return NextResponse.json({ id });
  } catch (e) {
    if (e instanceof SendEmailError)
      return apiError(e.message, e.status, { code: e.code });
    console.error("send failed", e);
    return apiError("Something went wrong while sending", 500);
  }
}
