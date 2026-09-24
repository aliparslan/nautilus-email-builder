# Nautilus Email Builder

A desktop-first visual email builder for car wash operators. Users can assemble emails from reusable blocks and branded patterns, preview responsive output, manage recipients, send through Resend, and schedule delivery with Temporal.

**Nautilus Engineering · Full-Stack Engineer Take-Home**

## Run locally

```bash
bun install
cp .env.example .env.local
bun run dev
```

Open `http://localhost:3000`.

Scheduling also requires Temporal and the worker:

```bash
temporal server start-dev
bun run worker
```

The required environment variables are documented in [`.env.example`](./.env.example). Sending requires `RESEND_API_KEY`; use a verified `RESEND_FROM_EMAIL` for recipients outside your Resend account.

## Architecture

See [Architecture and submission notes](./docs/architecture.md) for the rendering bridge, project map, decisions, and deployment runtime.
For permanent scheduling options, see [Temporal hosting](./docs/temporal-hosting.md).

- **Next.js App Router** provides the application shell and server endpoints.
- **Puck** owns the JSON document model, nested drag and drop, selection, properties, layers, and history.
- **React Email** components define every block. The same block configuration renders the editor canvas and the final email.
- A small, hook-free tree walker converts the Puck document into React Email output. `juice` inlines CSS for email-client compatibility.
- **Resend** sends the rendered HTML, plain text, and inline image attachments.
- **Temporal** stores each scheduled send as a durable workflow and executes delivery in a separate worker.
- Drafts, recipient groups, saved patterns, and recent activity are browser-local for this demo.

```text
Puck document
  ├─ editor canvas and properties
  └─ renderEmail()
       ├─ preview API
       ├─ Resend API
       └─ Temporal activity
```

## Project structure

| Path                             | Responsibility                                                                          |
| -------------------------------- | --------------------------------------------------------------------------------------- |
| `src/components/editor`          | Editor workspace, panels, canvas controls, dialogs, recipients, patterns, and templates |
| `src/email`                      | Email schema, blocks, root settings, templates, HTML rendering, and inline images       |
| `src/app/api`                    | Render, send, schedule, list, and cancellation endpoints                                |
| `src/hooks`                      | Local draft, recipients, patterns, activity, and rendered-preview state                 |
| `src/lib`                        | Validation, API clients, Resend delivery, and Temporal scheduling adapter               |
| `src/temporal`                   | Workflow, activity, worker, and Temporal client                                         |
| `src/brands` and `public/brands` | Mister Car Wash defaults and reusable brand assets                                      |

## Decisions and tradeoffs

- **Puck instead of a custom dnd-kit editor:** it supplies nesting, rich text, history, layers, and field editing. Its stock chrome required substantial composition and theming, but the email renderer is isolated enough to replace the editor later.
- **One block definition for edit and send:** this prevents the visual editor and delivered email from drifting. Email-safe table markup and inline styles constrain some canvas-like layout freedom.
- **Local-first persistence:** it keeps the demo simple and immediately usable. A production version would add authentication, shared drafts, asset storage, and a database-backed activity log.
- **CID images:** uploaded images work without storage infrastructure and across major email clients, at the cost of larger message payloads.
- **Temporal scheduling:** it provides durable timers, retries, cancellation, and status. With the web app on Vercel, the straightforward permanent setup is Temporal Cloud and a long-running worker host.
- **Dark preview is an estimate:** email clients apply different dark-mode transformations, so it does not modify saved or sent HTML.

## Verification

```bash
npx tsc --noEmit
bun run lint
bun test
bun run build
```

## Deployment

The Next.js application deploys directly to Vercel:

```bash
vercel link
vercel deploy --prod
```

Configure the Resend variables in Vercel before testing delivery. For permanent scheduling, use Temporal Cloud and the dedicated Fly.io worker config included here. Follow the [step-by-step hosting guide](./docs/temporal-hosting.md) to set matching Temporal credentials on Vercel and Fly.io, deploy the worker, and test a scheduled send. The API key enables TLS automatically; local development remains unchanged.

## Time spent

**7 hours**
