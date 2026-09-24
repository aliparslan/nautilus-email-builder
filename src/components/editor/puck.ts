"use client";

import { createUsePuck } from "@puckeditor/core";
import type { EmailConfig } from "@/email/config";

export const useEmailPuck = createUsePuck<EmailConfig>();
