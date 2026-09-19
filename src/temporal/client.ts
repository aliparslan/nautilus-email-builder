import { Client, Connection } from "@temporalio/client";
import { env } from "@/lib/env";

let clientPromise: Promise<Client> | null = null;

/** Lazily connects once per server process; a failed connection is forgotten so the next call retries. */
export function getTemporalClient(): Promise<Client> {
  clientPromise ??= Connection.connect({
    address: env.temporalAddress,
    connectTimeout: "3s",
  })
    .then(
      (connection) =>
        new Client({ connection, namespace: env.temporalNamespace }),
    )
    .catch((e) => {
      clientPromise = null;
      throw e;
    });
  return clientPromise;
}
