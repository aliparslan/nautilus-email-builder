# Permanent Temporal hosting

**Recommended:** Keep the Next.js app on Vercel, use [Temporal Cloud](https://docs.temporal.io/cloud/get-started) for durable workflows, and run this repo's worker as a separate, always-on Fly.io app. You do not need a VPS or a hostname under `alip.dev` for this arrangement. The web app and worker both make outbound TLS connections to Temporal Cloud. The worker also calls Resend when a scheduled email becomes due.

**Do you have to use Temporal Cloud? No.** `bun run worker` on a Fly Machine works exactly as it does locally, but the worker only *polls and executes* tasks. A separate Temporal **service** stores workflow state and durable timers. In local development, `temporal server start-dev` supplies that service; running only the worker on Fly while leaving the dev server on your laptop would stop scheduling when your laptop is off. Fly can also host a self-managed Temporal service, but then you need a persistent database, backups, upgrades, and a secure TLS/authenticated gRPC endpoint that your Vercel app can reach. Do **not** deploy `temporal server start-dev` as the production service. Temporal Cloud + one Fly worker is the simplest reliable choice here; self-hosting trades the Cloud bill for operational work. Cloudflare is fine for DNS, but a standard Cloudflare Worker is not a drop-in long-running Node Temporal worker or Temporal service.

## 1. Create the Temporal Cloud namespace

1. Create a namespace in the [Temporal Cloud console](https://docs.temporal.io/cloud/namespaces) and choose API key authentication.
2. Copy its full namespace ID and gRPC address from the namespace's **Connect** page. The address has a port, usually `<namespace>.<account>.tmprl.cloud:7233`; use the exact value shown in the console and omit `https://`.
3. Create an [API key](https://docs.temporal.io/cloud/api-keys) with access to this namespace. A service-account key is preferable for production. Copy it when shown; it will not be displayed again.

Set these values on the deployed **Vercel web app** as production environment variables, then redeploy the web app:

```text
TEMPORAL_ADDRESS=<the namespace gRPC address, including :7233>
TEMPORAL_NAMESPACE=<the full namespace ID>
TEMPORAL_API_KEY=<the API key>
```

The web app also needs its existing `RESEND_API_KEY`, `RESEND_FROM_EMAIL`, and optionally `RESEND_FROM_NAME`. The API key makes this app enable TLS automatically. No code change or `alip.dev` DNS record is needed.

## 2. Run the worker on Fly.io

The repo includes [`Dockerfile.worker`](../Dockerfile.worker) and [`fly.worker.toml`](../fly.worker.toml). Use a **separate Fly app** for the worker, even if you already host another app there. This config has no HTTP service, so Fly's HTTP autostop does not park the worker. It starts one `shared-cpu-1x` Machine with 1 GB RAM.

From the repo root, after `fly auth login`:

```bash
FLY_WORKER_APP=choose-a-globally-unique-worker-name
fly apps create "$FLY_WORKER_APP"
```

Create an ignored `.env.worker.local` containing only these `NAME=value` lines, with your actual values and no quotes:

```text
TEMPORAL_ADDRESS=<same address as Vercel>
TEMPORAL_NAMESPACE=<same namespace as Vercel>
TEMPORAL_API_KEY=<same API key as Vercel>
RESEND_API_KEY=<your Resend key>
RESEND_FROM_EMAIL=<your verified sender address>
RESEND_FROM_NAME=Mister Car Wash
```

Then import secrets and deploy:

```bash
fly secrets import -a "$FLY_WORKER_APP" --stage < .env.worker.local
fly deploy -a "$FLY_WORKER_APP" -c fly.worker.toml
fly scale count 1 -a "$FLY_WORKER_APP"
fly status -a "$FLY_WORKER_APP"
fly logs -a "$FLY_WORKER_APP"
```

The logs should say `Temporal worker listening on "nautilus-email"`. The task queue name is fixed in this repo and must match the web app's scheduler. Keep this Fly Machine running; there is no inbound port to expose. The worker image includes `tsx`, which the current `bun run worker` script needs.

Schedule a test email a few minutes ahead. Verify it appears in the app and Temporal Cloud, restart the Fly Machine, and confirm delivery still occurs. Temporal Cloud stores the timer; the Fly worker handles execution when it is online. If the worker is down at the scheduled time, delivery waits until a worker reconnects. To update the worker after a code change, run `fly deploy -a "$FLY_WORKER_APP" -c fly.worker.toml` again.

If your existing Fly machine is a general Linux VM outside a Fly app deployment, you can instead run `bun install --frozen-lockfile` and `bun run worker` there under a process supervisor. It needs the same environment values and automatic restart. The dedicated Fly app above makes source updates and restarts simpler.

## If you want to self-host the Temporal server

Rent a persistent Linux VPS from a VM provider. Cloudflare can still handle the domain and [tunnel the web app](https://developers.cloudflare.com/tunnel/get-started/) from `email.alip.dev` to its HTTP port. For a straightforward private connection, run the Next app, Temporal worker, and Temporal service on that same VM or private network.

1. Follow [Temporal's self-hosted deployment guide](https://docs.temporal.io/self-hosted-guide/deployment). Use the production `temporalio/server` image with PostgreSQL or another supported persistent database. Do not use `temporal server start-dev` for this permanent setup.
2. Put the database on a persistent volume or managed database. Set up backups, schema upgrades, and health checks. Run Temporal, the worker, and the web app as supervised services that restart on failure and reboot.
3. Keep Temporal gRPC (`7233`), PostgreSQL, and the Temporal UI on the private network. Point both app and worker at the internal Temporal address and namespace. Leave `TEMPORAL_API_KEY` unset for an internal connection unless you add a matching authentication/TLS configuration.
4. Publish only the Next app's HTTP port through a Cloudflare Tunnel. [Cloudflare Tunnel does not support a public-hostname route for gRPC](https://developers.cloudflare.com/network/grpc-connections/), so `temporal.alip.dev` is not a drop-in endpoint for this app.
5. Test sending, scheduling, cancelling, restarting the worker, and restarting the VM before relying on scheduled delivery.

The same applies if you self-host the Temporal service on Fly instead of a VPS: the Fly worker could use Fly's private network, but the Vercel app still needs secure public gRPC access to start/list/cancel workflows. The current client configuration is insufficient for a secure public self-hosted endpoint; add TLS and authentication before exposing it. Temporal Cloud avoids that extra integration. Moving the Next app and the worker onto the same private network as the self-hosted service is another option, but adds migration and database operations.
