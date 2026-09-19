export const env = {
  resendApiKey: process.env.RESEND_API_KEY,
  fromEmail: process.env.RESEND_FROM_EMAIL || "onboarding@resend.dev",
  fromName: process.env.RESEND_FROM_NAME || "Nautilus",
  temporalAddress: process.env.TEMPORAL_ADDRESS || "localhost:7233",
  temporalNamespace: process.env.TEMPORAL_NAMESPACE || "default",
  temporalTaskQueue: "nautilus-email",
};

export const fromHeader = `${env.fromName} <${env.fromEmail}>`;
