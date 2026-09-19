import { sendEmail } from "@/lib/send-email";
import type { ScheduledEmailInput } from "./shared";

export async function sendScheduledEmail({
  data,
  to,
  subject,
}: ScheduledEmailInput): Promise<{ id: string }> {
  return sendEmail({ data, to, subject });
}
