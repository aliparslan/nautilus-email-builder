export const env = {
  resendApiKey: process.env.RESEND_API_KEY,
  fromEmail: process.env.RESEND_FROM_EMAIL || "onboarding@resend.dev",
  fromName: process.env.RESEND_FROM_NAME || "Mister Car Wash",
  temporalAddress: process.env.TEMPORAL_ADDRESS || "localhost:7233",
  temporalNamespace: process.env.TEMPORAL_NAMESPACE || "default",
  temporalApiKey: process.env.TEMPORAL_API_KEY,
  temporalTaskQueue: "nautilus-email",
};

export const fromHeader = `${env.fromName} <${env.fromEmail}>`;

/** The domain stays server-owned even when the sender's local part is edited. */
export function senderHeader(localPart?: string) {
  if (!localPart) return fromHeader;
  const domain = env.fromEmail.split("@").at(-1);
  return `${env.fromName} <${localPart}@${domain}>`;
}
