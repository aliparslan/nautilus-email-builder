import { WorkflowNotFoundError } from "@temporalio/client";
import { env } from "@/lib/env";
import { getTemporalClient } from "@/temporal/client";
import type {
  ScheduledEmailInput,
  ScheduledEmailMemo,
} from "@/temporal/shared";

export type ScheduledEmailStatus =
  "scheduled" | "sending" | "sent" | "cancelled" | "failed";

export type ScheduledEmail = {
  id: string;
  subject: string;
  to: string[];
  sendAt: string;
  createdAt: string;
  status: ScheduledEmailStatus;
};

export class SchedulerUnavailableError extends Error {
  constructor(cause: unknown) {
    super("Scheduling is unavailable: can't reach the Temporal server", {
      cause,
    });
    this.name = "SchedulerUnavailableError";
  }
}

/**
 * Temporal is the database here. Each scheduled email is one workflow execution; the
 * list view is a visibility query, and cancellation is workflow cancellation. The memo
 * carries what the list needs so we never have to deserialize workflow inputs.
 */
export async function scheduleEmail(
  input: ScheduledEmailInput,
): Promise<ScheduledEmail> {
  const client = await connect();
  const memo: ScheduledEmailMemo = {
    subject: input.subject,
    to: input.to,
    sendAt: input.sendAt,
  };
  // Never pass a function here: Next's production bundler minifies its .name
  // (e.g. to "s"), which is not the name exported by the Temporal worker.
  const handle = await client.workflow.start("scheduledEmail", {
    taskQueue: env.temporalTaskQueue,
    workflowId: `email-${crypto.randomUUID()}`,
    args: [input],
    memo,
  });

  return {
    id: handle.workflowId,
    ...memo,
    createdAt: new Date().toISOString(),
    status: "scheduled",
  };
}

export async function cancelScheduledEmail(id: string): Promise<boolean> {
  const client = await connect();
  try {
    await client.workflow.getHandle(id).cancel();
    return true;
  } catch (e) {
    if (e instanceof WorkflowNotFoundError) return false;
    throw e;
  }
}

export async function listScheduledEmails(): Promise<ScheduledEmail[]> {
  const client = await connect();
  const items: ScheduledEmail[] = [];

  try {
    for await (const info of client.workflow.list({
      // Include workflows created by the earlier minified production client.
      query: `WorkflowType = 'scheduledEmail' OR WorkflowType = 's'`,
      pageSize: 100,
    })) {
      const memo = (info.memo ?? {}) as Partial<ScheduledEmailMemo>;
      const sendAt = memo.sendAt ?? info.startTime.toISOString();
      items.push({
        id: info.workflowId,
        subject: memo.subject ?? "(no subject)",
        to: memo.to ?? [],
        sendAt,
        createdAt: info.startTime.toISOString(),
        status: toStatus(info.status.name, sendAt),
      });
    }
  } catch (e) {
    throw wrapConnectionError(e);
  }

  return items.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}

function toStatus(name: string, sendAt: string): ScheduledEmailStatus {
  switch (name) {
    case "RUNNING":
      return new Date(sendAt).getTime() <= Date.now() ? "sending" : "scheduled";
    case "COMPLETED":
      return "sent";
    case "CANCELLED":
    case "TERMINATED":
      return "cancelled";
    default:
      return "failed";
  }
}

async function connect() {
  // Serverless deploys have no Temporal; fail fast instead of waiting on a connection timeout.
  if (process.env.NODE_ENV === "production" && !process.env.TEMPORAL_ADDRESS) {
    throw new SchedulerUnavailableError(
      new Error("TEMPORAL_ADDRESS is not set"),
    );
  }
  try {
    return await getTemporalClient();
  } catch (e) {
    throw new SchedulerUnavailableError(e);
  }
}

function wrapConnectionError(e: unknown): unknown {
  const code = (e as { code?: number }).code;
  // gRPC 14 = UNAVAILABLE, 4 = DEADLINE_EXCEEDED: the server went away after we connected.
  return code === 14 || code === 4 ? new SchedulerUnavailableError(e) : e;
}
