# Nautilus Email Builder

A drag-and-drop email builder for car-wash operators: compose with React Email blocks, preview the exact bytes that will be sent, send through Resend, or schedule delivery on a durable Temporal workflow.

**Nautilus Engineering · Full-Stack Engineer Take-Home**

## Features

| Tier | Feature                                                                                                                                                                   | Where                                              |
| ---- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------- |
| 1    | Drag & drop builder on Puck with React Email blocks: Section, Columns, Card, Heading, Text (rich text), Button, Image, Divider, Spacer                                    | `src/email/blocks/`                                |
| 1    | Sidebar property editing: colors, typography, sizing, padding, alignment, URLs; inline editing on the canvas for headings, button labels and rich text                    | `src/email/fields/`                                |
| 1    | Live canvas preview + **Review & send** dialog showing the rendered HTML with inbox chrome (From / To / Subject / preview text)                                           | `src/components/editor/`                           |
| 1    | Send via Resend with recipient chips, subject, plain-text alternative, inline image attachments, toast + inline error states                                              | `src/app/api/email/send`, `src/lib/send-email.ts`  |
| 1    | WYSIWYG parity: one block config renders both the canvas and the sent HTML; the preview _is_ the sent HTML                                                                | `src/email/render*.tsx`                            |
| 2    | Scheduling on Temporal: date/time picker, scheduled list with live status, cancellation                                                                                   | `src/temporal/`, `src/lib/scheduler.ts`            |
| 2    | Desktop / mobile widths on the canvas (Puck viewports) and in the preview; columns stack on mobile                                                                        | `EmailPreviewFrame.tsx`, `styles.ts`               |
| 3    | Undo / redo, keyboard shortcuts (`?` for the sheet), template library with rendered thumbnails, **local image upload**, light / dark mode for the shell, autosaved drafts | `EditorHeader.tsx`, `templates/`, `ImageField.tsx` |

## Quick start

```bash
bun install
cp .env.example .env.local        # add RESEND_API_KEY and a verified RESEND_FROM_EMAIL
bun run dev                        # http://localhost:3000
```

Scheduling needs Temporal running locally (two extra terminals):

```bash
temporal server start-dev          # https://docs.temporal.io/cli — Web UI at http://localhost:8233
bun run worker                     # runs src/temporal/worker.ts
```

Without Temporal, everything else works and the scheduling UI explains what to start.

### Environment variables

| Variable             | Required       | Description                                                                                                              |
| -------------------- | -------------- | ------------------------------------------------------------------------------------------------------------------------ |
| `RESEND_API_KEY`     | yes            | From [resend.com/api-keys](https://resend.com/api-keys)                                                                  |
| `RESEND_FROM_EMAIL`  | recommended    | A sender on a verified domain. Defaults to `onboarding@resend.dev`, which only delivers to your own Resend account email |
| `RESEND_FROM_NAME`   | no             | Display name for the From header (default `Nautilus`)                                                                    |
| `TEMPORAL_ADDRESS`   | for scheduling | Default `localhost:7233`. Unset in production = scheduling reports itself unavailable immediately                        |
| `TEMPORAL_NAMESPACE` | no             | Default `default`                                                                                                        |

### Scripts

| Script                            | What it does                                                              |
| --------------------------------- | ------------------------------------------------------------------------- |
| `bun run dev` / `build` / `start` | Next.js                                                                   |
| `bun run worker`                  | Temporal worker (Node via `tsx`; Temporal's core is a native Node module) |
| `bun run lint`                    | ESLint incl. React Compiler rules                                         |

## Architecture

### The bridge: one config, two consumers

The whole editor ↔ email problem collapses to a single observation: React Email components are just React components, and Puck is a config-driven React renderer. So each block is defined **once** — its fields, defaults, and a `render` that returns React Email primitives with explicit inline styles — and that one config feeds both sides:

```
                        Puck Data (JSON document)
                                 │
                 ┌───────────────┴────────────────┐
                 ▼                                ▼
         <Puck config>                    EmailTree(data)             src/email/render-tree.tsx
     canvas · drag/drop · fields     hook-free walker calling the
     inline editing · history        same block render functions
                                                  │
                                       <Html><Head/><Body><Preview/>…   src/email/render.tsx
                                                  │
                                    @react-email/render → juice (inline CSS)
                                                  │
                                       { html, text, subject }
                                          │              │
                                POST /api/email/render   POST /api/email/send · Temporal activity
                                (Review & send preview)  (Resend)
```

- **The document is plain JSON** (`EmailData`, Puck's `Data` shape). It's what autosaves to localStorage, what templates are, what the API validates, and what the Temporal workflow carries. Nothing else is persisted; there is no database.
- **Root = the email body.** Page background, content width, font stack, link color, subject and preview text live on Puck's root. The root render also emits the email's `<style>` block, so the same CSS is live in the canvas and in the output.
- **Preview and send share one function.** `renderEmail()` is called by the preview route, the send route, and the Temporal activity. Parity isn't tested for — it's structural.
- **Puck is an editing dependency, not a rendering one.** The send pipeline (`src/email/**`, API routes, worker) imports only Puck _types_. The editor could be swapped without touching how emails are produced.

### Directory map

```
src/email/            the email model — isomorphic, no Puck runtime imports
  config.tsx          the one Puck Config; exports EmailData
  root.tsx            email-level settings + the <style> emitter
  blocks/             one file per block (fields · defaults · React Email render)
  fields/             color, image, shared field helpers
  render-tree.tsx     Data → React (walker)
  render.tsx          React → HTML/text (react-email + juice)
  inline-images.ts    data-URL images → CID attachments
  styles.ts           shared email CSS (rich text, fonts, mobile stacking)
  templates/          Welcome · Monthly report · Upgrade promo · Blank
src/components/       editor shell (header, dialogs, preview frame), ui primitives, theme
src/app/api/          render · send · schedule (list/create) · schedule/[id] (cancel)
src/lib/              send-email (Resend), scheduler (Temporal), schemas (zod), env, client api
src/temporal/         workflow · activity · worker · client
```

### Decisions and their reasons

1. **Puck's `<Render>` is not used for output.** It was the obvious first choice and it works standalone. Inside Next's server layers it throws `Invalid hook call`: those layers resolve `react` to the `react-server` build while `react-dom/server` (which React Email uses) installs its hook dispatcher on a different copy. `serverExternalPackages` fixed the API route but then broke SSR of the editor page for the same reason. `render-tree.tsx` is ~60 lines, has no hooks, and removed both bundler workarounds. The tradeoff is re-implementing two things Puck's renderer does (slot components, rich-text injection); both are trivial and the decoupling is worth more.

2. **Padding lives on `<td>`, never on `<table>`.** React Email's `<Section style={{ padding }}>` puts it on the table element. Outlook ignores that, and so does any table with `border-collapse: collapse` — which Tailwind's preflight applies, and which Puck copies into the canvas iframe with no opt-out. Layout blocks use `Row`/`Column` for padding, and the root stylesheet resets `border-collapse` inside the email. This was caught because the canvas and the output disagreed; the fix made both correct.

3. **The root emits a stylesheet, and `juice` inlines it at send time.** Rich text from TipTap arrives as bare `<p>/<a>/<ul>` markup; Outlook needs `font-family` on every element; the web font and page background must match between canvas and output. All of that lives in one CSS string emitted by the root render, so it's identical in both places. At send, `juice` inlines it onto elements (for clients that strip `<style>`) and preserves `@font-face` and `@media`. Rules are unlayered on purpose so they beat Tailwind's `@layer base` in the canvas.

4. **Rich text is Puck's native TipTap field.** It gives inline bold/italic/underline/strike/links/lists and editing directly on the canvas. Headings, blockquotes, code and rules are disabled in it because dedicated blocks own those. Puck stores the value as an HTML string and its read-only renderer uses `class="rich-text"`, which is what the stylesheet targets. Injecting the user's own markup into the user's own email is the intended behavior; the preview iframe is sandboxed.

5. **Uploaded images become inline (CID) attachments.** Uploads are downscaled in the browser (max 1200px, JPEG unless the PNG has transparency) and stored in the document as data URLs, which the canvas and preview render directly. Gmail and Outlook refuse `data:` URIs in email, so `inline-images.ts` swaps them for `cid:` references and attaches the bytes. Zero storage infrastructure, works locally and on Vercel, and CID is the most widely supported way to embed an image. Production would upload to object storage and reference URLs; the swap is one function.

6. **Temporal is the database.** Each scheduled email is a workflow execution: `sleep(until)` then one retried `sendEmail` activity. The scheduled list is a visibility query (`WorkflowType = 'scheduledEmail'`) with subject/recipients/time carried in the workflow memo; cancellation is `handle.cancel()`. No table, no poller, no status flags to keep consistent. The activity renders at send time from the stored document with the same `renderEmail()`.

7. **Explicit inline styles on every block, no Tailwind in emails.** Email clients share no defaults, so blocks state font size, weight, line height, margins and colors outright. It also makes the canvas immune to the host page's reset leaking through Puck's iframe.

8. **Client-only editor.** The editor is `dynamic(..., { ssr: false })` with a skeleton. Drag and drop, `contentEditable`, and localStorage drafts have no server-rendered value, and it keeps hook-using field UI out of server-compiled module graphs.

9. **Shortcuts listen on the canvas iframe too.** Keydowns inside Puck's iframe never reach the parent document, so the shortcut hook attaches to both. Modifier combos fire anywhere (they don't type characters); `?` only fires outside text fields.

### Alternatives considered

**Editor.** _Craft.js_ gives a node tree and drag/drop but every UI surface (fields, layers, toolbar) is yours to build — days of work to reach where Puck starts. _GrapesJS_ has a mature newsletter preset, but its model is HTML/CSS strings; React Email would have been decorative and the bridge a non-story. _dnd-kit_ alone was the credible option: email is mostly a single column, so a sortable block list plus a hand-rolled property panel fits in a few hours and every line is yours. It loses on nesting (columns, cards), rich text, and history, all of which Puck provides.

**Scheduler.** _Inngest_ is the strongest alternative — durable `step.sleepUntil` inside a Next route, first-class Vercel support; it would have made the deployed demo's scheduling work. It's less transparent than Temporal's visibility API and would want a small store for the list view. _Trigger.dev_ is similar with a heavier deploy step. _BullMQ_ needs Redis and a worker just like Temporal without the durability semantics or UI. _Resend's native `scheduledAt`_ is zero-infra and would make a good fallback adapter for serverless, but has a capped window and no list endpoint. _Vercel Cron + a table_ is the boring production answer and showcases nothing about durability. Temporal was chosen because it matches the recommended stack, has the clearest durability story, and its visibility API removed the need for any database.

## Email rendering notes

- Output is table-based, inline-styled HTML with a plain-text alternative derived from the same render.
- `<style>` is inlined by `juice`; `@font-face` (Inter for the modern stack) and the mobile stacking `@media` rule are preserved for clients that honor them. Everything degrades to the font stack and side-by-side columns elsewhere.
- Columns get `width`/`valign` attributes as well as styles (juice adds them) for Outlook.
- Font family names are unquoted on purpose: React escapes quotes in style attributes to entities, which the CSS inliner rejects.

## Scheduling notes

- The worker bundles `src/temporal/workflows.ts` in Temporal's deterministic sandbox; the workflow imports only `@temporalio/workflow` and types. All I/O is in the activity.
- Retries: 5 attempts, 10s initial backoff, ×2. Resend rate-limit and 5xx responses are retried; validation errors surface as failed workflows.
- In production without `TEMPORAL_ADDRESS`, the scheduler reports itself unavailable immediately rather than timing out. A live deploy would use Temporal Cloud plus a worker on a long-running host; the app needs only the address and namespace.
- Workflow input carries the full document, including any inline images. Temporal's per-payload limit is 2 MB; the uploader caps images at 1.5 MB after compression and the UI shows sizes.

## Assumptions

- Single operator, no authentication. The deployed demo is public; the Resend key never leaves the server, and recipients are unrestricted per the brief.
- A verified Resend domain is configured (`RESEND_FROM_EMAIL`). With the default `onboarding@resend.dev` sender, Resend only delivers to the account owner.
- Schedules are entered in the operator's local time and stored as UTC ISO strings.
- Drafts live in `localStorage`; there is one working draft at a time. Templates replace it (undo restores).
- The design language mirrors nautilus.co (Inter / Cal Sans / Geist Mono, cyan `#01b2de`, navy `#033148`, hairline dividers, Lucide icons, Motion for dialogs with reduced-motion respected). Dark mode applies to the shell only; the canvas always shows the email as it will render.

## Not done, deliberately

- No recurring schedules, audiences, or send history beyond what Temporal's visibility shows.
- No per-client rendering tests (Litmus-style). Table markup, inline styles, CID images and `td` padding follow well-known compatibility practice, but real-client verification is the next step before production.
- Rich-text link colors are set by stylesheet (inlined), not per link.
- Vercel deploy runs without Temporal; scheduling shows an explanatory state there. A `Scheduler` adapter using Resend's `scheduledAt` would make it functional serverless and is the first thing I'd add.

## Time spent

| Phase                                                                                                 | Time    |
| ----------------------------------------------------------------------------------------------------- | ------- |
| Reading the brief, scraping nautilus.co for design tokens, architecture and tooling discussion        | ~1h     |
| Bridge spike: Puck config + React Email blocks, render pipeline, parity fixes (padding, fonts, hooks) | ~1.5h   |
| Send, review dialog, Nautilus-styled shell, dark mode, templates, upload, shortcuts                   | ~2h     |
| Temporal workflow/worker/client, scheduling UI                                                        | ~1h     |
| README, production build check, commit history                                                        | ~0.5h   |
| **Total**                                                                                             | **~6h** |

## Resources

- [Puck](https://puckeditor.com) · [React Email](https://react.email) · [Resend](https://resend.com) · [Temporal](https://temporal.io) · [Next.js](https://nextjs.org/docs)
