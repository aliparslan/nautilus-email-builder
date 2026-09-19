import { proxyActivities, sleep } from "@temporalio/workflow";
import type * as activities from "./activities";
import type { ScheduledEmailInput } from "./shared";

const { sendScheduledEmail } = proxyActivities<typeof activities>({
  startToCloseTimeout: "2 minutes",
  retry: { initialInterval: "10s", backoffCoefficient: 2, maximumAttempts: 5 },
});

/**
 * The whole scheduling feature: a durable timer followed by one retried send.
 * Temporal persists the timer, so the worker can restart or redeploy mid-wait.
 * Cancelling the workflow interrupts the sleep and the email is never sent.
 */
export async function scheduledEmail(
  input: ScheduledEmailInput,
): Promise<{ id: string }> {
  const delay = new Date(input.sendAt).getTime() - Date.now();
  if (delay > 0) await sleep(delay);
  return sendScheduledEmail(input);
}
