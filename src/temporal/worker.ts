import path from "node:path";
import { NativeConnection, Worker } from "@temporalio/worker";
import { env } from "@/lib/env";
import * as activities from "./activities";

async function main() {
  const connection = await NativeConnection.connect({
    address: env.temporalAddress,
  });

  const worker = await Worker.create({
    connection,
    namespace: env.temporalNamespace,
    taskQueue: env.temporalTaskQueue,
    workflowsPath: path.resolve(__dirname, "workflows.ts"),
    activities,
  });

  console.log(
    `Temporal worker listening on "${env.temporalTaskQueue}" @ ${env.temporalAddress}`,
  );
  await worker.run();
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
