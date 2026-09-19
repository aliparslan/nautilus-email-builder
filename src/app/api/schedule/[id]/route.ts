import { NextResponse } from "next/server";
import { apiError, schedulerError } from "@/lib/api";
import { cancelScheduledEmail } from "@/lib/scheduler";

export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  try {
    const cancelled = await cancelScheduledEmail(id);
    return cancelled
      ? NextResponse.json({ ok: true })
      : apiError("That scheduled email no longer exists", 404);
  } catch (e) {
    return schedulerError(e);
  }
}
