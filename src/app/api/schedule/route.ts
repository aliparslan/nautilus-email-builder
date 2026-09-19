import { NextResponse } from "next/server";
import { parseBody, schedulerError } from "@/lib/api";
import { listScheduledEmails, scheduleEmail } from "@/lib/scheduler";
import { scheduleRequestSchema } from "@/lib/schemas";

export async function GET() {
  try {
    return NextResponse.json({ items: await listScheduledEmails() });
  } catch (e) {
    return schedulerError(e);
  }
}

export async function POST(req: Request) {
  const body = await parseBody(req, scheduleRequestSchema);
  if (!body.ok) return body.response;

  try {
    return NextResponse.json(
      { item: await scheduleEmail(body.value) },
      { status: 201 },
    );
  } catch (e) {
    return schedulerError(e);
  }
}
