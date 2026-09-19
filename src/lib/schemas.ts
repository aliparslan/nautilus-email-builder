import { z } from "zod";
import type { EmailData } from "@/email/config";

/**
 * Structural validation only. Block props are validated by their own definitions when
 * rendered; unknown block types are skipped by the renderer.
 */
export const emailDataSchema = z
  .object({
    root: z.object({ props: z.record(z.string(), z.unknown()).optional() }),
    content: z.array(
      z.object({ type: z.string(), props: z.record(z.string(), z.unknown()) }),
    ),
  })
  .transform((v) => v as unknown as EmailData);

export const recipientsSchema = z
  .array(z.email("Enter a valid email address"))
  .min(1, "Add at least one recipient")
  .max(50, "Up to 50 recipients per send");

export const sendRequestSchema = z.object({
  data: emailDataSchema,
  to: recipientsSchema,
  subject: z.string().trim().min(1, "Subject is required").max(200),
});

export const scheduleRequestSchema = sendRequestSchema.extend({
  sendAt: z.iso
    .datetime({ offset: true })
    .refine((iso) => new Date(iso).getTime() > Date.now() + 30_000, {
      message: "Pick a time at least a minute from now",
    }),
});

export type SendRequest = z.infer<typeof sendRequestSchema>;
export type ScheduleRequest = z.infer<typeof scheduleRequestSchema>;
