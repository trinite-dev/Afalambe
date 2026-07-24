# feat-0001: Tech Spec — API platform

## Context

See [`PRODUCT.md`](./PRODUCT.md). Entry: [`apps/api/src/index.ts`](../../apps/api/src/index.ts). Env bootstrap: [`apps/api/src/load-env.ts`](../../apps/api/src/load-env.ts).

## HTTP route map

| Method | Path | Handler | Auth |
|--------|------|---------|------|
| GET | `/` | `buildHealthHtml()` | Public |
| POST | `/webhooks/resend` | `handleResendWebhook` | `x-resend-signature` header |
| OPTIONS | `*` | CORS preflight | Public |
| * | `/trpc/*` | `createHTTPHandler(appRouter)` | Per procedure |
| WS | upgrade | `WebSocketServer` | Session cookie |

tRPC mount: strip `/trpc` prefix from `req.url` before `trpcHandler(req, res)`.

## tRPC router merge

[`packages/trpc/src/index.ts`](../../packages/trpc/src/index.ts):

```text
appRouter
├── health
├── auth
├── session
├── claim
└── admin
```

Context factory: [`apps/api/src/index.ts`](../../apps/api/src/index.ts) `createContext` — Prisma, session user, cookie setters, email senders, AI hooks, Supabase signed URLs, WS broadcast.

## Environment variables

| Variable | Required | Purpose |
|----------|----------|---------|
| `API_PORT` | No (4000) | Listen port |
| `NODE_ENV` | No | Health label; rate limits |
| `NEXT_PUBLIC_APP_URL` | Yes | CORS origin |
| `DATABASE_URL` | Yes | Prisma (via `@afalambe/prisma`) |

Feature-specific env documented in child feature TECH specs.

## Known gaps

| Gap | Notes |
|-----|-------|
| Health does not probe DB/AI/Resend | Liveness only |
| `AUTH_SECRET` in `.env.example` | Unused in code |
| WebSocket path | Client may use `/ws`; server accepts any upgrade with valid cookie |

## Testing

```bash
pnpm --filter @afalambe/api test   # webhook mapper unit test
curl -s http://localhost:4000/ | head
```

## Related

- [feat-0008 TECH](../feat-0008/TECH.md) — Resend webhook detail
- [feat-0009 TECH](../feat-0009/TECH.md) — WebSocket detail
