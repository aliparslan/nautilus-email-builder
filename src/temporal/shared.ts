import type { EmailData } from "@/email/config";

/** Pure types shared by the workflow (sandboxed) and everything else. Keep this file free of runtime imports. */
export type ScheduledEmailInput = {
  data: EmailData;
  to: string[];
  subject: string;
  senderLocalPart?: string;
  /** ISO 8601 */
  sendAt: string;
};

export type ScheduledEmailMemo = {
  subject: string;
  to: string[];
  sendAt: string;
};
