---
name: resend
description: >-
    Implements and debugs email using Resend (Node SDK, domains, webhooks,
    idempotency, batch, templates) and React Email. Use when the user mentions
    Resend, RESEND_API_KEY, transactional email, email delivery, bounces,
    react-email, @react-email/components, or sending HTML email from this
    monorepo.
---

# Resend and React Email

## Documentation discovery

Resend publishes a machine-readable index of all doc pages. Prefer it over guessing URLs.

- Doc index: [https://resend.com/docs/llms.txt](https://resend.com/docs/llms.txt)
- Long-form bundle: [https://resend.com/docs/llms-full.txt](https://resend.com/docs/llms-full.txt)
- Human overview: [https://resend.com/docs/introduction](https://resend.com/docs/introduction)

Resend also documents agent-oriented material (search the index for `resend-skill`, `react-email-skill`, `email-best-practices-skill`).

For API shape, rate limits, errors, and pagination, start from [API introduction](https://resend.com/docs/api-reference/introduction) and [Errors](https://resend.com/docs/api-reference/errors).

## Node.js SDK (this repo’s default path)

- Package name is `resend`; default export class is `Resend`.
- Initialize with `new Resend(process.env.RESEND_API_KEY)` (never hardcode keys; see `docs/env/README.md` for `packages/emails`).
- `resend.emails.send` returns `{ data, error }`. Check `error` before using `data`; the SDK does not throw for API-level failures.
- Parameter names are **camelCase** (`replyTo`, `scheduledAt`, `idempotencyKey`), not snake_case.
- Required: `from`, `to` (string or array, max 50 recipients), `subject`.
- Body: supply at least one of `html`, `text`, or `react`. If using **`template`**, do not send `html`, `text`, or `react` (mutually exclusive).

### Idempotency

Use `idempotencyKey` on sends that can retry (webhooks, queues, user double-clicks). Keys expire after 24 hours and are max 256 characters. See [Idempotency keys](https://resend.com/docs/dashboard/emails/idempotency-keys).

### Rate limiting

Default is about **5 requests per second** per team; overages return **429**. Back off and retry; request higher limits via Resend if needed. See [Usage limits](https://resend.com/docs/api-reference/rate-limit).

### React Email with Resend

- Official pattern: pass a React Email root component via the `react` field (Node-only in the SDK docs).
- Resend’s Node guide specifies passing the **element produced by calling the component as a function** (for example `WelcomeEmail({ name: 'Ada' })`), not JSX (`<WelcomeEmail />`), in the documented examples.
- Site and tooling: [https://react.email](https://react.email)
- Upstream docs source tree (components, CLI, deployment, utilities): [https://github.com/resend/react-email/tree/canary/apps/docs](https://github.com/resend/react-email/tree/canary/apps/docs)

Prefer `@react-email/components` primitives, table-based layout, and inline styles for client compatibility; preview with the React Email dev server / CLI per their docs.

### Testing without harming reputation

Use Resend’s **test recipient** addresses (documented in [Send with Node.js](https://resend.com/docs/send-with-nodejs)) such as `delivered@resend.dev` to simulate outcomes. Do not invent random addresses for load tests.

### `from` address and domains

- Production sends must use a **verified domain** and a `from` aligned with that domain. Misaligned or unverified domains produce errors (see knowledge base articles in `llms.txt`, e.g. domain mismatch / `resend.dev` restrictions).
- DNS, DMARC, regions, and tracking are covered under dashboard **Domains** and related guides in the index.

### Optional send features

| Concern                                 | Where to read                                   |
| --------------------------------------- | ----------------------------------------------- |
| Attachments, inline images, size limits | Index: attachments, embed inline images         |
| Schedule / cancel / update scheduled    | `scheduledAt`, update/cancel email API          |
| Batch (up to 100)                       | Send batch emails API + dashboard batch sending |
| Tags                                    | Tags doc (metadata on sends)                    |
| Hosted templates                        | Templates API + dashboard templates             |
| Open/click tracking                     | Domain tracking doc                             |

## Webhooks

- Subscribe to delivery, bounce, complaint, open, click, failure, suppression, inbound, etc. Event list: [Event types](https://resend.com/docs/webhooks/event-types).
- **Verify** webhook signatures using the signing secret: [Verify webhooks](https://resend.com/docs/webhooks/verify-webhooks-requests).
- Handlers must be **idempotent** (retries/replays): [Retries and replays](https://resend.com/docs/webhooks/retries-and-replays).

## Audiences, broadcasts, contacts

Marketing-style features (contacts, segments, broadcasts, topics) are fully documented in the index. Treat them as separate from transactional product email unless the task explicitly requires them.

## Project-specific rules

High-level product and safety expectations for this monorepo live in:

- `docs/rules/email-rules.md`
- `docs/architecture/decisions/ADR-0005-email-delivery-resend.md`

Keep transactional vs campaign boundaries, PII minimization, and idempotent send policy aligned with those documents.
