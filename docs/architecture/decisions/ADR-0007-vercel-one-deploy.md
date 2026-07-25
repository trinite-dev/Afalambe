# ADR-0007: Single Vercel deploy (backend inside Next.js)

- Status: accepted
- Date: 2026-07-25
- Owners: project maintainer
- Spec: [feat-0047](../../../specs/feat-0047/PRODUCT.md)

## Context

Afalambe currently splits hosting: Next.js UI (`apps/web`) and a standalone Node API (`apps/api`) with tRPC, Resend webhooks, orphan cleanup, AI, and WebSockets. Operators expect one production deploy. Maintaining two hosts adds CORS, dual env, and dual secrets. Vercel is the preferred UI host but does not support long-lived WebSockets the way the current API process does.

## Decision

1. **Host the backend inside `apps/web`** on a single Vercel project using App Router Route Handlers:
   - `/api/trpc/[trpc]` — tRPC (`fetchRequestHandler`)
   - `/api/webhooks/resend` — Resend webhooks
   - `/api/cron/cleanup-orphans` — Vercel Cron
   - `/api/health` and `/api/ready` — recommended ops probes
2. **Keep tRPC** as the API boundary ([ADR-0002](./ADR-0002-api-boundary-trpc.md)); only the transport host changes.
3. **Keep Supabase** for Postgres + Storage ([ADR-0004](./ADR-0004-data-access-conventions.md)); do not require Vercel Postgres for this decision.
4. **Replace WebSockets** for MVP with polling / query invalidation; **recommend** Supabase Realtime as a follow-up (feat-0047 Phase 3b).
5. **Retire `apps/api` as a production deployable** after cutover (dual-run allowed during migration).
6. **Prefer Vercel Pro** for production (function duration + Cron).

This supersedes the **production** split-deploy guidance in feat-0033 once feat-0047 is complete. Local dual-run remains optional for rollback/debug.

## Consequences

- One production URL and one secrets surface (Vercel + Supabase + Resend + AI).
- Same-origin cookies simplify auth vs cross-origin CORS.
- Serverless timeouts and cold starts become first-class constraints for AI.
- In-memory rate limits and WS fan-out no longer work across isolates without external infra.
- feat-0009 realtime UX degrades until polling/Realtime ships.
- Monorepo Vercel config must include workspace packages and corpus assets in the function bundle.

## Alternatives considered

| Alternative | Outcome |
|-------------|---------|
| Keep dual deploy (Vercel + Railway/Fly) | Rejected as default — fails “one deploy” goal; remains temporary rollback |
| Separate WS-only microservice | Rejected for MVP — breaks single-deploy story |
| Move API to Edge Runtime | Rejected — Prisma/AI/Resend fit Node serverless better |
| Rewrite to REST / drop tRPC | Rejected — unnecessary churn vs ADR-0002 |
| BFF only for some routes, keep `apps/api` | Rejected as permanent architecture — dual complexity |

## Follow-ups

- Implement [feat-0047](../../../specs/feat-0047/TECH.md) phases 1–4.
- Update feat-0033 ops docs after cutover.
- Mark this ADR `accepted` when Phase 1 lands in staging; revisit if Pro limits still block AI.
