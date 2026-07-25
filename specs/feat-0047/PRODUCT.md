# feat-0047: Single Vercel deploy (“one deploy”)

## Summary

Rebuild Afalambe so **one Vercel project** runs the full product: marketing, auth, chat, admin, email webhooks, AI, and storage orchestration. Today the browser talks to a **separate Node API** (`apps/api` on port 4000). This feature **folds that backend into `apps/web`** (Next.js Route Handlers + Cron), so operators no longer need Railway/Fly for day-one production.

**Status:** Implemented (Phases 1–3a) — same-origin `/api/trpc`, webhooks, cron, health/ready, polling realtime. Phase 3b (Supabase Realtime) and Phase 4 (`apps/api` retirement) remain optional follow-ups. Dual-run via `NEXT_PUBLIC_API_URL` still supported.

## Assumptions (confirm or correct)

1. **Primary host is Vercel** (Hobby or Pro); Node 20+.
2. **Supabase Postgres + Storage** remain system of record (no move to Vercel Postgres required for MVP of this feat).
3. **Long-lived WebSockets are not available** on standard Vercel serverless/edge the way `apps/api` uses `ws` today — realtime must be **replaced or deferred**.
4. **tRPC stays** as the typed RPC layer; only the **transport host** changes (`/api/trpc` on Next.js instead of standalone `/trpc`).
5. **FR/EN URL locales** and client `/demo` remain unchanged.
6. **`apps/api` is retired** after cutover (or kept as a temporary dual-run shim), not maintained as a second production deploy.
7. **Max AI/request duration** fits Vercel serverless limits (with Pro fluid/extended duration where needed) — sync `generateAssistantReply` stays acceptable for MVP; heavy async jobs are a later phase.
8. **Recommended plan tier:** Vercel **Pro** (or higher) for production — longer `maxDuration`, Cron reliability, and preview protections (Hobby may work for demos only).

→ Correct any of these before Phase 1 coding.

## Problem

| Today | Pain |
|-------|------|
| `apps/web` on Vercel | UI only |
| `apps/api` on separate host | Secrets, CORS, two URLs, two deploys |
| Operators expect “deploy web = whole app” | Sign-up/chat/AI fail without API |
| Spec [feat-0033](../feat-0033/PRODUCT.md) documents split | Correct for current code; blocks simplest hosting story |

## Goals

1. **One production URL** — e.g. `https://afalambe.vercel.app` serves UI **and** backend.
2. **No `NEXT_PUBLIC_API_URL` pointing at a second origin** in production (same-origin `/api/trpc`).
3. **All current product flows work** after cutover: auth, verify email, chat, uploads, admin resolve, Resend webhook, demo.
4. **Secrets stay server-only** — never ship `DATABASE_URL` / `AI_API_KEY` / `RESEND_*` / service role to the browser.
5. **Phased cutover** with rollback to dual-deploy until Phase N is signed off.
6. **Operator runbook** — single env checklist, health endpoint, cron, and webhook URLs documented.

## Non-goals

- Rewriting routers into REST or dropping `@afalambe/trpc`.
- Moving DB off Supabase.
- Perfect realtime parity with the current `ws` server in Phase 1 (explicit trade-off).
- Native WhatsApp bot / campaigns ([feat-0025](../feat-0025/PRODUCT.md)).
- Embedding-based RAG (beyond [feat-0038](../feat-0038/PRODUCT.md) keyword grounding).
- Keeping `apps/api` as a permanent second production service.
- Edge Runtime for tRPC/Prisma (Node serverless only unless proven later).

## Actors

| Actor | Need |
|-------|------|
| **Operator** | Single Vercel project + Supabase + Resend + AI key |
| **End user** | Same UX; no awareness of backend move |
| **Engineer** | Clear migration phases, env map, deprecation of standalone API |
| **Reviewer / admin** | Queue + resolve still works without WS |

## Target architecture (product view)

```text
Browser ──same origin──► apps/web (Next.js on Vercel)
                           ├── App Router pages (/, /en/*, /chat, /demo, /admin)
                           ├── /api/trpc/[trpc]     ← tRPC (was apps/api /trpc)
                           ├── /api/webhooks/resend ← Resend (was /webhooks/resend)
                           ├── /api/cron/cleanup-orphans ← was setInterval in API
                           ├── /api/health           ← readiness (recommended)
                           └── packages: trpc, prisma, emails, ai, ui
```

## Recommended product decisions (locked for this feat)

These are the **recommended defaults** for Afalambe one-deploy. Change only with an explicit PRODUCT amendment.

| Topic | Recommendation | Rationale |
|-------|----------------|-----------|
| **Hosting** | One Vercel project; root `apps/web` | Matches operator expectation |
| **Plan** | **Vercel Pro** for production | Longer functions, Cron, better previews |
| **RPC** | Keep tRPC; host via App Router fetch adapter | Preserves [ADR-0002](../../docs/architecture/decisions/ADR-0002-api-boundary-trpc.md) |
| **Runtime** | Node.js serverless (not Edge) for `/api/trpc` | Prisma + Resend + AI SDKs |
| **Realtime MVP** | **Option A — polling / query invalidate** | No second host; good enough for claim threads |
| **Realtime Phase 3b** | **Option B — Supabase Realtime** (recommended follow-up) | Near-WS UX without a custom WS server |
| **Typing indicator** | Local `isPending` during mutations; no server typing | Honest UX without WS |
| **Orphan cleanup** | **Vercel Cron** hourly + `CRON_SECRET` | Replaces in-process interval |
| **Health** | Ship `/api/health` (process) + recommended `/api/ready` (DB ping) | Ops / uptime monitors |
| **Uploads** | Keep **signed PUT to Supabase** (never proxy file bytes through Vercel) | Avoid body-size and timeout traps |
| **AI** | Sync `generateAssistantReply` with elevated `maxDuration`; on timeout → soft fail / human queue | Matches [feat-0030](../feat-0030/PRODUCT.md) |
| **Async AI jobs** | Recommended **later** (queue table + cron worker), not blocking one-deploy MVP | [feat-0031](../feat-0031/PRODUCT.md) Phase B |
| **Cookies** | Same-origin session cookie; `AUTH_COOKIE_SECURE=true` in prod | Simpler than cross-site |
| **Previews** | Protect Vercel Preview with password or SSO; optional `VERCEL_URL`-aware `NEXT_PUBLIC_APP_URL` | Avoid open auth on previews |
| **Dual-run** | Support `NEXT_PUBLIC_API_URL` override until Phase 4 | Safe rollback |
| **ADR** | Accept [ADR-0007](../../docs/architecture/decisions/ADR-0007-vercel-one-deploy.md) | Formalize superseding split-deploy prod story |
| **Local dev** | Prefer `pnpm --filter @afalambe/web dev` (single process) as default; `dev:all` optional for dual-run | Matches one-deploy mental model |
| **Demo** | `/demo` stays client-only; no API required | Unchanged |
| **Observability** | Recommended: Vercel logs + structured `console` for claim/AI failures; optional Sentry later | Minimum viable ops |
| **Rate limits** | Keep in-memory limits for MVP; recommended Redis/Upstash later if multi-instance | [feat-0021](../feat-0021/PRODUCT.md) |

## Realtime decision (product)

Current chat uses a **persistent WebSocket** for typing / new messages / status ([feat-0009](../feat-0009/PRODUCT.md)).

| Option | Product impact | Recommendation for this feat |
|--------|----------------|------------------------------|
| **A. Polling / refetch** | Slight delay; invalidate tRPC queries on focus/interval | **MVP default (required)** |
| **B. Supabase Realtime** | Near-WS UX; subscribe to claim/message changes | **Recommended Phase 3b** after polling ships |
| **C. Keep separate WS host** | Breaks “one deploy” | **Rejected** |

### Recommended polling behaviour (MVP)

| Event | Client behaviour |
|-------|------------------|
| User sends message | Optimistic UI + invalidate thread on mutation settle |
| Assistant generating | Show typing from mutation `isPending`; poll `claim.byId` every 2–3s while pending |
| Tab focused | Refetch active thread once |
| Admin resolves | Invalidate on mutation; other tabs catch up on next poll/focus |

**Acceptance:** After Phase 1–3a, chat remains usable without WS. Typing indicator may be local-only. Phase 3b restores multi-tab near-realtime via Supabase if needed.

## Orphan cleanup decision (product)

Today: hourly `setInterval` in `apps/api` ([feat-0010](../feat-0010/PRODUCT.md)).

| Option | Notes |
|--------|--------|
| **Vercel Cron** → `/api/cron/cleanup-orphans` | **Chosen (required)** — secured with `CRON_SECRET` |
| Defer cleanup | Only with explicit `ORPHAN_CLEANUP_DISABLED=true` and operator acknowledgement |

**Recommended schedule:** `0 * * * *` (hourly), same intent as current interval.

## Use case catalog

| ID | Use case | Success |
|----|----------|---------|
| **UC-VD01** | Deploy only `apps/web` to Vercel | Auth + chat + email + AI work against same host |
| **UC-VD02** | Sign up / verify OTP | Emails send; no CORS to second API origin |
| **UC-VD03** | Create claim + AI reply | Completes within platform timeout or graceful failure |
| **UC-VD04** | Upload chat image | Signed upload via server context (service role never in browser) |
| **UC-VD05** | Resend webhook | `POST /api/webhooks/resend` updates `EmailDelivery` |
| **UC-VD06** | Cron orphan cleanup | Scheduled run deletes unreferenced uploads |
| **UC-VD07** | Local `pnpm` web-only | Single Next process serves UI + `/api/*` |
| **UC-VD08** | Rollback | Dual-deploy (`NEXT_PUBLIC_API_URL`) still possible until `apps/api` removed |
| **UC-VD09** | Health / ready probes | `/api/health` 200; `/api/ready` 200 only if DB reachable |
| **UC-VD10** | Vercel Preview | Preview deploy works with preview env; not world-writable without protection |
| **UC-VD11** | Admin resolve | Queue resolve updates thread without relying on WS |
| **UC-VD12** | Locale parity | `/` and `/en/*` auth + chat still same-origin |

## Phased delivery (recommended)

### Phase 0 — Spec + ADR (required before code)

- This PRODUCT + TECH approved.
- [ADR-0007](../../docs/architecture/decisions/ADR-0007-vercel-one-deploy.md) accepted.
- Operator env checklist signed off ([TECH](./TECH.md) env tables).

### Phase 1 — tRPC on Next.js (same-origin) **required**

- Add `apps/web/app/api/trpc/[trpc]/route.ts` using `@trpc/server` fetch adapter.
- Move context factories (session cookie, Prisma, Supabase, email, AI) from `apps/api/src/index.ts` into `apps/web/server/` (shared helpers preferred).
- Point web client to **relative** `/api/trpc` (drop cross-origin default).
- Keep `apps/api` runnable for rollback (`NEXT_PUBLIC_API_URL` override).
- Set `maxDuration` on tRPC route for AI procedures.
- Ship `/api/health` (recommended: also `/api/ready`).

### Phase 2 — Webhooks + Cron **required**

- Port Resend webhook to `/api/webhooks/resend`; update Resend dashboard URL.
- Port orphan cleanup to `/api/cron/cleanup-orphans` + `vercel.json` cron + `CRON_SECRET`.
- Document webhook HMAC/shared-secret behaviour (align with [feat-0012](../feat-0012/PRODUCT.md) / [feat-0045](../feat-0045/PRODUCT.md)).

### Phase 3a — Realtime polling **required**

- Remove/gate WS client; implement invalidate + poll strategy.
- Update [feat-0009](../feat-0009/PRODUCT.md) status to “polling on Vercel”.

### Phase 3b — Supabase Realtime **recommended**

- Subscribe to claim/message changes for active thread.
- Fall back to polling if Realtime unavailable.
- Document Supabase Realtime enablement in project settings.

### Phase 4 — Retire standalone API **required**

- Delete or archive `apps/api` production path.
- Update feat-0033, env docs, CI to single deployable.
- Remove dual CORS / dual URL complexity from defaults.

### Phase 5 — Hardening **recommended (post-cutover)**

- Upstash Redis rate limiting (replace process-local maps on multi-instance).
- Optional Sentry (or equivalent) for server + client errors.
- Async AI job table if timeouts remain painful ([feat-0031](../feat-0031/PRODUCT.md)).
- Bundle-size / cold-start review for corpus load path.

## Acceptance criteria (feat complete)

1. Production checklist uses **one** Vercel project for Afalambe app runtime.
2. Sign-up → verify → chat → AI reply works with **only** Vercel + Supabase + Resend + AI credentials.
3. No browser calls to a second API hostname in default production config.
4. Resend webhook and orphan cron documented and working.
5. WS server no longer required for MVP chat UX (documented degradation).
6. Secrets audit: no service role / AI / Resend keys in client bundles.
7. `/api/health` (and recommended `/api/ready`) documented for monitoring.
8. ADR-0007 accepted; feat-0033 updated to point at one-deploy as the production default.
9. Dual-run rollback path verified once before deleting standalone API.

## Risks

| Risk | Mitigation |
|------|------------|
| Serverless timeout on AI | Raise `maxDuration`; fail soft to human queue ([feat-0030](../feat-0030/PRODUCT.md)); later async jobs |
| Cold starts | Pooler DB URL; avoid creating many Prisma clients; keep `_data` corpus load cached |
| Cookie SameSite on same origin | Simplifies vs cross-site; set `AUTH_COOKIE_SECURE=true` |
| Dual-run confusion | Feature flag / `NEXT_PUBLIC_API_URL` override; document clearly |
| Preview env leaks | Password-protect previews; separate Resend/AI keys for preview if needed |
| In-memory rate limits ineffective across isolates | Document limitation; Phase 5 Upstash |
| Corpus missing from serverless bundle | Explicit include / import path in TECH; CI smoke that load works |
| Cron not firing on Hobby | Prefer Pro; document manual invoke for recovery |

## Related

- [feat-0047 TECH](./TECH.md)
- [ADR-0007](../../docs/architecture/decisions/ADR-0007-vercel-one-deploy.md)
- [feat-0001](../feat-0001/PRODUCT.md) — API platform (hosting superseded)
- [feat-0009](../feat-0009/PRODUCT.md) — Realtime
- [feat-0010](../feat-0010/PRODUCT.md) — Orphan cleanup
- [feat-0033](../feat-0033/PRODUCT.md) — Ops (update after cutover)
- [feat-0027](../feat-0027/PRODUCT.md) — Security / env
