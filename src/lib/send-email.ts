import { Resend } from "resend";
import type { EmailData } from "@/email/config";
import { extractInlineImages } from "@/email/inline-images";
import { renderEmail } from "@/email/render";
import { env, fromHeader } from "./env";

export type SendEmailInput = {
  data: EmailData;
  to: string[];
  subject: string;
};

export class SendEmailError extends Error {
  constructor(
    message: string,
    readonly code: string,
    readonly status: number,
  ) {
    super(message);
    this.name = "SendEmailError";
  }
}

/** The one place an email turns into a Resend call — used by the API route and the Temporal activity alike. */
export async function sendEmail({
  data,
  to,
  subject,
}: SendEmailInput): Promise<{ id: string }> {
  if (!env.resendApiKey) {
    throw new SendEmailError(
      "RESEND_API_KEY is not configured",
      "missing_api_key",
      500,
    );
  }

  const rendered = await renderEmail(data);
  const { html, attachments } = extractInlineImages(rendered.html);

  const resend = new Resend(env.resendApiKey);
  const { data: result, error } = await resend.emails.send({
    from: fromHeader,
    to,
    subject,
    html,
    text: rendered.text,
    attachments: attachments.length ? attachments : undefined,
  });

  if (error) {
    throw new SendEmailError(
      friendlyResendMessage(error.name, error.message),
      error.name,
      error.statusCode ?? 502,
    );
  }
  return { id: result.id };
}

function friendlyResendMessage(code: string, fallback: string): string {
  switch (code) {
    case "invalid_from_address":
    case "validation_error":
      return `Resend rejected the request: ${fallback}`;
    case "rate_limit_exceeded":
      return "Resend rate limit hit. Try again in a moment.";
    case "daily_quota_exceeded":
    case "monthly_quota_exceeded":
      return "Resend sending quota exceeded for this account.";
    case "invalid_api_key":
    case "restricted_api_key":
      return "The Resend API key is invalid or lacks send permission.";
    default:
      return fallback;
  }
}
