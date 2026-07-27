# feat-0047: Tech Spec — Single Vercel deploy

## Status

**Implemented (Phases 1–3a).** Dual-run rollback via `NEXT_PUBLIC_API_URL` remains. Phase 3b Supabase Realtime and Phase 4 API retirement are follow-ups. See [feat-0047 PRODUCT](./PRODUCT.md).

## Current vs target

| Concern | Today (`apps/api`) | Target (`apps/web` on Vercel) |
|---------|--------------------|--------------------------------|
| tRPC | `createHTTPHandler` on `/trpc` | App Router `fetchRequestHandler` on `/api/trpc/[trpc]` |
| Context | Built in `apps/api/src/index.ts` | `apps/web/server/trpc-context.ts` (same deps) |
| Session cookies | `Set-Cookie` on Node `res` | Next.js `cookies()` / response headers in route handler |
| Resend webhook | `POST /webhooks/resend` | `POST /api/webhooks/resend` |
| Orphan cleanup | `setInterval` ~60m | Vercel Cron → `/api/cron/cleanup-orphans` |
| Realtime | `ws` upgrade on same HTTP server | Phase 3a polling; **recommended Phase 3b** Supabase Realtime |
| Client API URL | `NEXT_PUBLIC_API_URL` → `:4000` | Same-origin `/api/trpc` (optional override for rollback) |
| Health | `GET /` HTML on API | **Recommended** `/api/health` + `/api/ready` |
| CORS | `CORS_ALLOWED_ORIGINS` | Same-origin default; optional preview allowlist only if dual-run |

## Package boundaries

Keep ADR-0001 spirit:

| Package | Role after cutover |
|---------|-------------------|
| `@afalambe/trpc` | Routers + procedures (unchanged contracts preferred) |
| `@afalambe/prisma` | DB client |
| `@afalambe/emails` | Resend sends |
| `@afalambe/ai` | Corpus + generation helpers |
| `apps/web/server/*` | Next-specific context, cookie helpers, cron auth, health |
| `apps/api` | Deprecated after Phase 4 (or thin re-export for local dual-run) |

Avoid putting Prisma/service-role usage in Client Components.

**Recommended extraction:** Prefer `packages/` shared factories (`createEmailSender`, AI provider, upload helpers) over duplicating logic in both `apps/api` and `apps/web` during dual-run.

## Route map (new)

| Method | Path | Replaces | Priority |
|--------|------|----------|----------|
| `*` | `/api/trpc/[trpc]` | `apps/api` `/trpc/*` | Required |
| `POST` | `/api/webhooks/resend` | `/webhooks/resend` | Required |
| `GET` or `POST` | `/api/cron/cleanup-orphans` | in-process `setInterval` | Required |
| `GET` | `/api/health` | API root health HTML | **Recommended** |
| `GET` | `/api/ready` | DB connectivity check | **Recommended** |

### Example tRPC adapter (illustrative)

```ts
// apps/web/app/api/trpc/[trpc]/route.ts
import { fetchRequestHandler } from '@trpc/server/adapters/fetch'
import { appRouter } from '@afalambe/trpc'
import { createTrpcContext } from '@/server/trpc-context'

export const runtime = 'nodejs'
export const maxDuration = 60 // raise on Pro if needed (AI)

const handler = (req: Request) =>
  fetchRequestHandler({
    endpoint: '/api/trpc',
    req,
    router: appRouter,
    createContext: () => createTrpcContext(req),
  })

export { handler as GET, handler as POST }
```

`createTrpcContext` must provide the same `TrpcContext` shape as today: `prisma`, session user, `hashPassword`, `sendVerifyEmail`, `generateAssistantText`, `createSignedUploadUrl`, `broadcastToClaimSubscribers` (no-op or Realtime bump in Phase 3), etc.

### Recommended health handlers

| Route | Behaviour |
|-------|-----------|
| `/api/health` | `200 { ok: true, service: "afalambe-web" }` — no DB |
| `/api/ready` | `200` if `prisma.$queryRaw\`SELECT 1\`` succeeds; else `503` |

## Client changes

| File | Change | Priority |
|------|--------|----------|
| `apps/web/components/trpc-provider.tsx` | Default URL → `/api/trpc` (relative). If `NEXT_PUBLIC_API_URL` set, keep dual-run. | Required |
| `apps/web/hooks/use-realtime.ts` | Phase 3a: gate WS; invalidate + poll. Phase 3b: Supabase channel. | Required / Recommended |
| `apps/web/lib/api-toast.ts` | Unchanged contracts preferred | — |
| Env examples + `docs/env/README.md` | Single-deploy vs dual-run | Required |

### Recommended polling defaults (Phase 3a)

| Setting | Value |
|---------|--------|
| Active-thread poll while `PROCESSING` / mutation pending | 2–3s |
| Idle tab | No poll; refetch on `visibilitychange` → visible |
| After mutation settle | Immediate `invalidate` |

### Recommended Supabase Realtime (Phase 3b)

| Topic | Guidance |
|-------|----------|
| Channel | Filter by `claimId` / user-owned rows only |
| Auth | Use user session JWT or server-issued channel token; never expose service role |
| Fallback | If subscribe fails, keep Phase 3a polling |
| Enable | Supabase Dashboard → Realtime for relevant tables |

## Vercel config

Suggested `apps/web/vercel.json`:

```json
{
  "crons": [
    {
      "path": "/api/cron/cleanup-orphans",
      "schedule": "0 3 * * *"
    }
  ]
}
```

Cron handler must verify `Authorization: Bearer ${CRON_SECRET}` (and/or Vercel Cron auth headers per current Vercel docs). Reject anonymous invokes with `401`.

### Project settings (operator) — recommended

| Setting | Value |
|---------|--------|
| Framework | Next.js |
| Root Directory | `apps/web` |
| Include files outside root | **Yes** (workspace packages) |
| Install Command | `cd ../.. && pnpm install` (adjust to monorepo root from `apps/web`) |
| Build Command | `cd ../.. && pnpm --filter @afalambe/web build` |
| Output | Next default |
| Node | **20.x** |
| Region | Prefer closest to Supabase project region |
| Plan | **Pro** for production Cron + longer functions |
| Preview protection | Password or Vercel Authentication **on** |
| Fluid / max duration | Enable extended duration for `/api/trpc` if AI timeouts |

### Recommended monorepo build notes

1. Ensure `pnpm-workspace.yaml` packages resolve during Vercel install.
2. Run `prisma generate` in build (existing web `postinstall` / build script path).
3. Do **not** run `migrate deploy` on every request — CI or release job only.
4. Verify `_data/fact-checks` (or whatever corpus path `@afalambe/ai` uses) is **traced into the serverless function** (import static path; avoid cwd-relative reads that break on Vercel).

## Env consolidation (production on Vercel)

All former `apps/api` secrets move to the **Vercel project** (server env). Browser only needs public URLs.

### Server (Vercel — secret) — required unless noted

| Variable | Notes | Priority |
|----------|--------|----------|
| `DATABASE_URL` | Supabase **pooler** (transaction mode preferred for serverless) | Required |
| `DIRECT_URL` | Migrations (CI / one-off) | Required for migrate |
| `SUPABASE_URL` | | Required |
| `SUPABASE_ANON_KEY` | Prefer server-only unless already public by design | Required |
| `SUPABASE_SERVICE_ROLE_KEY` | **Never** `NEXT_PUBLIC_*` | Required |
| `SUPABASE_STORAGE_BUCKET_CHAT_UPLOADS` | | Required |
| `CHAT_IMAGE_MAX_BYTES` | | Required |
| `CHAT_ALLOWED_IMAGE_MIME_TYPES` | | Required |
| `AUTH_COOKIE_NAME` | | Required |
| `AUTH_COOKIE_SECURE` | `true` in production | Required |
| `RESEND_API_KEY` | | Required |
| `EMAIL_FROM` | Verified domain (not `onboarding@resend.dev` in prod) | Required |
| `RESEND_WEBHOOK_SIGNING_SECRET` | | Required |
| `AI_PROVIDER` / `AI_MODEL` / `AI_API_KEY` | Gemini or OpenAI | Required for AI |
| `CRON_SECRET` | Protect cron route | Required |
| `BACKEND_MODE` | Optional `next` \| `standalone` during migration | Recommended |
| `ORPHAN_CLEANUP_DISABLED` | Escape hatch only | Optional |
| `EMAIL_DEV_LOG_OTP` | Local/dev only | Dev only |
| `EMAIL_DEV_EXPOSE_OTP` | **Must be off** in production | Forbidden in prod |

### Public (Vercel)

| Variable | Notes | Priority |
|----------|--------|----------|
| `NEXT_PUBLIC_APP_URL` | Canonical production URL (emails, links) | Required |
| `NEXT_PUBLIC_API_URL` | **Omit** for same-origin; set only for dual-run rollback | Dual-run only |
| `NEXT_PUBLIC_DEMO_ENABLED` | | Optional |
| `NEXT_PUBLIC_CHAT_IMAGE_MAX_BYTES` | Client validation mirror | Recommended |
| `NEXT_PUBLIC_SUPABASE_URL` / anon | Only if client Realtime (Phase 3b) needs them | Phase 3b |

### Preview environment — recommended

| Practice | Why |
|----------|-----|
| Separate Resend “preview” from-address or shared sandbox with care | Avoid prod email pollution |
| Distinct `NEXT_PUBLIC_APP_URL` per preview **or** use `VERCEL_URL` with HTTPS | Correct absolute links |
| Do not share prod `CRON_SECRET` with public docs | Leak risk |
| Password-protect previews | Open signup abuse |

### Removed from production story

| Variable | Why |
|----------|-----|
| Separate API host `API_PORT` | Not used on Vercel |
| Cross-origin `CORS_ALLOWED_ORIGINS` for main app | Same-origin; dual-run only if needed |
| `EMAIL_DEV_EXPOSE_OTP` in prod | Security |

## Serverless constraints

| Topic | Guidance | Priority |
|-------|----------|----------|
| **Duration** | `export const maxDuration = 60` (or Pro max) on `/api/trpc` | Required |
| **Runtime** | `runtime = 'nodejs'` — not Edge for Prisma/AI | Required |
| **Body size** | Signed PUT to Supabase; do not proxy large files through Vercel | Required |
| **Prisma** | Pooler URL; singleton client pattern safe for serverless | Required |
| **Corpus `_data`** | Bundle via static import / package asset; CI smoke load | Required |
| **WebSockets** | Not used on Vercel MVP | Required |
| **Rate limit maps** | Document process-local limits; Phase 5 Upstash | Recommended |
| **Concurrency** | Expect multiple isolates; no in-memory WS fan-out | Required |

## Cookie / session mapping (recommended)

| Standalone API | Next Route Handler |
|----------------|--------------------|
| Parse `Cookie` header manually | `cookies()` from `next/headers` and/or `req.headers` |
| `Set-Cookie` on Node `res` | Return `Set-Cookie` on `Response` from tRPC adapter / cookie helper |
| Cross-origin CORS credentials | Same-origin → simpler; ensure `Path=/` and `Secure` + `HttpOnly` + `SameSite=Lax` (or existing policy) |

## Security checklist (required for cutover)

- [ ] No `SUPABASE_SERVICE_ROLE_KEY`, `AI_API_KEY`, `RESEND_API_KEY`, `DATABASE_URL`, `CRON_SECRET` in client bundles or `NEXT_PUBLIC_*`
- [ ] Cron route rejects missing/invalid bearer
- [ ] Resend webhook verifies signing secret
- [ ] `AUTH_COOKIE_SECURE=true` on production HTTPS
- [ ] Preview deployments protected
- [ ] `EMAIL_DEV_EXPOSE_OTP` unset in production
- [ ] Upload MIME/size validation still enforced server-side
- [ ] Admin procedures still role-gated
- [ ] Secrets rotated if ever pasted into chat/logs (ops hygiene)

## Observability (recommended)

| Signal | Approach |
|--------|----------|
| Function logs | Vercel Runtime Logs for `/api/trpc`, webhook, cron |
| Health | Uptime monitor on `/api/health` and `/api/ready` |
| AI failures | Structured log with `claimId` (no PII dump); soft fail to queue |
| Optional | Sentry DSN server + client (Phase 5) |

## CI / CD (recommended)

| Job | Notes |
|-----|--------|
| Lint / typecheck / unit | Unchanged monorepo filters |
| E2E against local Next (no API process) | After Phase 1 |
| `prisma migrate deploy` | Release pipeline with `DIRECT_URL`, not Vercel build necessarily |
| Deploy | Single Vercel project from `main` |
| Dual-run staging | Optional temporary second service until Phase 4 |

## Migration plan (engineering tasks)

### Phase 0

1. Approve PRODUCT + TECH.
2. Accept ADR-0007.
3. Fill Vercel project settings + env checklist (staging first).

### Phase 1

1. Extract `createContext` + helpers from `apps/api/src/index.ts` into shared/`apps/web/server`.
2. Implement `/api/trpc/[trpc]` with `runtime` + `maxDuration`.
3. Implement `/api/health` and `/api/ready`.
4. Switch `TrpcProvider` default to `/api/trpc`.
5. Smoke-test auth + claims with `next dev` only.
6. Verify corpus loads in a Vercel preview function.

### Phase 2

1. Port Resend webhook; point Resend dashboard to `/api/webhooks/resend`.
2. Port orphan cleanup + `vercel.json` cron + `CRON_SECRET`.
3. Manual cron invoke test.

### Phase 3a

1. Gate/remove WS in `use-realtime`.
2. Invalidate + poll strategy; update feat-0009.

### Phase 3b (recommended)

1. Enable Supabase Realtime for needed tables.
2. Client subscribe with safe auth; keep polling fallback.

### Phase 4

1. Dual-run staging sign-off.
2. Production cutover: unset `NEXT_PUBLIC_API_URL`.
3. Retire `apps/api` deploy; update feat-0033 + env docs + CI.
4. Remove unused CORS dual-origin code paths.

### Phase 5 (recommended)

1. Upstash rate limits.
2. Optional Sentry.
3. Async AI jobs if timeouts persist.
4. Cold-start / bundle review.

## Testing

| Level | Cases | Priority |
|-------|--------|----------|
| Unit | Context cookie parse; cron auth reject; health/ready | Required |
| Integration | `auth.register` + `claim.create` against Next test server | Required |
| E2E | Sign-up → verify → chat send on **one origin** | Required |
| E2E | Admin resolve without WS | Recommended |
| Manual | Vercel preview: webhook, cron, AI timeout soft-fail | Required |
| Manual | Dual-run rollback drill once | Recommended |
| Load (optional) | Cold start + concurrent claim creates | Recommended before wide launch |

## Rollback

1. Redeploy previous web that points `NEXT_PUBLIC_API_URL` at standalone API.
2. Keep `apps/api` service warm until Phase 4 sign-off.
3. If `/api/trpc` error rate spikes, flip client back to standalone URL (env change, no code if override already supported).
4. Document who owns the flip (operator runbook).

## Operator cutover checklist (recommended)

1. Supabase: pooler URL, storage bucket, (Phase 3b) Realtime on.
2. Resend: verified domain, webhook URL → `https://<prod>/api/webhooks/resend`.
3. Vercel: all server env vars; Pro plan; Cron enabled; preview protection.
4. AI provider key in Vercel (not in git).
5. Deploy preview → smoke UC-VD01–06.
6. Production promote → unset dual-run API URL.
7. Monitor `/api/ready` + first 24h signups + AI replies.
8. Schedule Phase 4 API teardown after N days stable.

## Files likely touched (implementation)

| Path | Role | Priority |
|------|------|----------|
| `apps/web/app/api/trpc/[trpc]/route.ts` | tRPC | Required |
| `apps/web/app/api/webhooks/resend/route.ts` | Webhook | Required |
| `apps/web/app/api/cron/cleanup-orphans/route.ts` | Cron | Required |
| `apps/web/app/api/health/route.ts` | Health | Recommended |
| `apps/web/app/api/ready/route.ts` | Ready | Recommended |
| `apps/web/server/**` | Context + cookies | Required |
| `apps/web/components/trpc-provider.tsx` | Client URL | Required |
| `apps/web/hooks/use-realtime.ts` | Polling / Realtime | Required |
| `apps/web/vercel.json` | Crons / regions | Required |
| `apps/api/**` | Deprecate | Phase 4 |
| `docs/env/README.md` | Env map | Required |
| `docs/architecture/decisions/ADR-0007-vercel-one-deploy.md` | Decision | Required (Phase 0) |
| `specs/feat-0033/*` | Ops update | Phase 4 |
| `specs/feat-0009/*` | Realtime status | Phase 3 |

## Related

- [feat-0047 PRODUCT](./PRODUCT.md)
- [ADR-0007](../../docs/architecture/decisions/ADR-0007-vercel-one-deploy.md)
- [feat-0001](../feat-0001/TECH.md), [feat-0009](../feat-0009/TECH.md), [feat-0010](../feat-0010/TECH.md), [feat-0033](../feat-0033/TECH.md)
- [docs/env/README.md](../../docs/env/README.md)
