# Architecture and submission notes

This is a single-user demo of a car wash email builder inside a Nautilus-styled dashboard. The sample brand is Mister Car Wash. The app is desktop-first, with a browser-local draft and reusable content; there is no account system or shared database.

## How an email moves through the app

1. `src/components/editor/EmailEditor.tsx` loads the saved draft or a starter template and gives it to Puck. `src/components/editor/EditorWorkspace.tsx` composes Puck's preview, fields, outline, and drawer into the rail, panels, and canvas. Puck owns selection, nested drag and drop, rich text, and undo/redo.
2. `src/email/config.tsx`, `src/email/root.tsx`, and `src/email/blocks/` define the Puck document, its editable fields, defaults, and React Email render functions. The internal project title lives in root props but is excluded from recipient-facing output. Device size, zoom, editor theme, and dark estimate are view state only.
3. `src/email/render-tree.tsx` walks the saved Puck JSON and calls those same block render functions on the server. It converts Puck slots and rich-text HTML into the nodes that React Email needs. This small bridge is deliberate: Puck's hook-based read-only renderer cannot run reliably inside the Next server render path.
4. `src/email/render.tsx` wraps the tree in an email document, renders HTML and plain text, and uses `juice` to inline CSS. `POST /api/email/render` supplies the review and dark-estimate views. Send and scheduled delivery call the same `renderEmail` function, so the review is based on the delivery renderer.
5. `src/lib/send-email.ts` is the single Resend adapter. `POST /api/email/send` validates the flat recipient list and sender local part before calling it. The sender domain is server-owned through `RESEND_FROM_EMAIL`.
6. `POST /api/schedule` starts a Temporal workflow with a snapshot of the document, recipients, subject, sender, and delivery time. `src/temporal/workflows.ts` waits durably; `src/temporal/activities.ts` then calls the same send adapter. `src/lib/scheduler.ts` lists and cancels workflows.

The visual document is therefore the source of truth for both canvas content and delivered HTML. The inbox header (From, To, subject, preview text) in the review dialog is separate presentation around the HTML body.

## Project map

| Path | Role |
| --- | --- |
| `src/app/page.tsx`, `layout.tsx`, `globals.css`, `editor.css` | Client-only editor entry, app metadata, design tokens, and isolated Puck chrome styles |
| `src/components/editor/` | Workspace, panels, canvas, dialogs, templates, preview, shortcuts, and document edit helpers |
| `src/components/fields/`, `src/email/fields/` | Browser controls and server-safe Puck field definitions |
| `src/email/blocks/`, `templates/`, `root.tsx`, `config.tsx` | Email-safe blocks, starter documents, page fields, and shared editor/render config |
| `src/email/render-tree.tsx`, `render.tsx`, `inline-images.ts` | Puck-to-React-Email bridge, final HTML/text, and CID image handling |
| `src/hooks/` | Autosaved draft, recipients/groups, patterns, saved templates, activity, and rendered preview |
| `src/app/api/`, `src/lib/` | Validated API routes, Resend delivery, Temporal adapter, and utility functions |
| `src/temporal/` | Workflow, activity, worker, client, and scheduling payload |
| `src/brands/`, `public/brands/` | Mister Car Wash defaults and reusable brand imagery |

## Editor decisions and limitations

- **Puck rather than a custom dnd-kit editor.** Puck 0.23 supplies nested slots, layer dragging, selection, rich text, field editing, and history. dnd-kit supplies drag behavior only; rebuilding the rest would have expanded this demo considerably. The cost is that the Nautilus shell needs custom composition and some Puck-specific CSS. The layer rename display currently syncs a saved `editorLabel` into Puck's outline DOM because Puck's outline label is static; this is the most version-sensitive integration.
- **React Email for the delivery format.** Blocks use email-safe tables and inline styles. This constrains freeform web layout but improves compatibility with email clients. In particular, block padding belongs on table cells, and responsive columns use preserved media queries.
- **Browser storage for authoring.** `localStorage` holds one draft, recipient groups/selection, patterns, saved templates, recently sent/scheduled snapshots, and color swatches. This is fast for a demo. It is specific to one browser and may hit storage limits with large inline images. A production version needs accounts, server persistence, media storage, and an activity database.
- **Activity status.** Resend's successful API response means the provider accepted the message; it is not proof of inbox delivery. Sent history is browser-local. Temporal visibility is authoritative for scheduled workflow state, but preview/edit/duplicate requires the browser-local document snapshot. A workflow scheduled in another browser can be listed without that snapshot.
- **Dark estimate.** It transforms only a read-only preview. Gmail on iPhone and other clients can apply different dark-mode rules; the saved and sent HTML are unchanged.
- **Image delivery.** Uploaded local images are embedded as CID attachments. This avoids a media backend, at the cost of message size. Remote assets remain remote URLs.
- **Scheduling runtime.** The web app can run on Vercel. Temporal needs a reachable service and a continuously running Node worker; a serverless request alone cannot wait for scheduled work. The included `Dockerfile.worker` and `fly.worker.toml` run that worker on Fly.io while Temporal Cloud stores the workflows. Cloudflare can provide DNS or a custom domain for the web app.

## Running and deploying

Local development:

```bash
bun install
cp .env.example .env.local
bun run dev
temporal server start-dev
bun run worker
```

Run the last two commands in separate terminals when testing scheduling. Set `RESEND_API_KEY` and a verified `RESEND_FROM_EMAIL` to send to external addresses. For production, deploy the Next app to Vercel and follow [the Temporal Cloud + Fly.io guide](./temporal-hosting.md). A custom domain is optional and does not replace the worker. Do not put secrets in the browser or git.

Verification commands are `npx tsc --noEmit`, `bun run lint`, `bun test`, and `bun run build`. Visual and delivery behavior still require a manual browser/email check before submission. No deployment is part of this code pass.
