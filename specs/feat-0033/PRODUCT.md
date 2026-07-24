# feat-0033: Platform operations (monorepo, dev, deploy, migrations)

## Summary

How to **run, build, and deploy** Afalambe: pnpm workspaces, Turborepo, local dev, database migrations, health vs readiness, and production checklist.

## Problem

Onboarding and ops steps were only in root `README.md`; feat specs assumed a running API/DB without a single runbook.

## Local development

| Command | Purpose |
|---------|---------|
| `pnpm install` | Install all workspaces |
| `pnpm dev:all` | Web (:3002) + API (:4000) via Turbo |
| `pnpm dev:web` / `pnpm dev:api` | Single app |
| `pnpm --filter @afalambe/prisma exec prisma migrate deploy` | Apply migrations |
| `pnpm db:studio` | Prisma Studio |

## Package graph (simplified)

```text
apps/web → @afalambe/ui, @afalambe/trpc (types)
apps/api → @afalambe/trpc, @afalambe/prisma, @afalambe/emails
packages/trpc → @afalambe/prisma (dev)
```

## Deployment (typical)

| App | Target | Notes |
|-----|--------|-------|
| `apps/web` | Vercel | `NEXT_PUBLIC_*` env |
| `apps/api` | Node host (Railway, Fly, VM) | Long-running WS + cron cleanup |
| Database | Supabase Postgres | Pooler for runtime, direct for migrate |

## Health vs readiness

| Endpoint | Probes | Today |
|----------|--------|-------|
| `GET /` | Process up | Yes (HTML) |
| `health.ping` | tRPC alive | Yes |
| Readiness (DB + Supabase) | **Not implemented** | Gap |

**Target:** `GET /ready` returns 200 only if Prisma `SELECT 1` succeeds.

## Migration runbook

1. Ensure `DIRECT_URL` in `apps/api/.env` ([feat-0027](../feat-0027/PRODUCT.md)).
2. `pnpm --filter @afalambe/prisma exec prisma migrate status`
3. `pnpm --filter @afalambe/prisma exec prisma migrate deploy`
4. Restart API.

## Pre-production checklist

- [ ] All env from [feat-0027](./TECH.md)
- [ ] Migrations applied
- [ ] Resend domain verified
- [ ] `AUTH_COOKIE_SECURE=true`
- [ ] Rate limits on (`NODE_ENV=production`)
- [ ] Webhook secret set
- [ ] Legal pages replaced ([feat-0017](../feat-0017/PRODUCT.md))

## Related

- [feat-0033 TECH](./TECH.md)
- [feat-0001](../feat-0001/PRODUCT.md) — health endpoint
