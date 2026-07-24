# feat-0027: Tech Spec — Security and environment

## Environment matrix

### apps/web (client-safe only)

| Variable | Required | Notes |
|----------|----------|-------|
| `NEXT_PUBLIC_APP_URL` | Yes | Metadata, links |
| `NEXT_PUBLIC_API_URL` | Yes | tRPC + WS |
| `NEXT_PUBLIC_CHAT_IMAGE_MAX_BYTES` | No | Client validation |
| `VERCEL_ENV` | No | SEO indexing |
| `NEXT_PUBLIC_OPENAI_API_KEY` | **Avoid** | Used today for Whisper — **SEC-G01** |

### apps/api (server secrets)

| Variable | Required | Feature |
|----------|----------|---------|
| `DATABASE_URL` | Yes | Prisma runtime (pooler :6543) |
| `DIRECT_URL` | Migrations | `db.*.supabase.co:5432` |
| `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY` | Uploads | feat-0008 |
| `RESEND_API_KEY`, `EMAIL_FROM` | Email | feat-0011 |
| `RESEND_WEBHOOK_SIGNING_SECRET` | Prod | feat-0012 |
| `AI_API_KEY`, `AI_MODEL` | AI | feat-0007 |
| `AUTH_COOKIE_NAME`, `AUTH_COOKIE_SECURE` | Session | feat-0005 |
| `NEXT_PUBLIC_APP_URL` | Yes | CORS + reset links |
| `NODE_ENV`, `RATE_LIMIT_DISABLED` | No | feat-0021 |

### Documented but unused

- `AUTH_SECRET` — no code reference
- `SUPABASE_ANON_KEY` — not in API TS
- `AI_PROVIDER` — not in API TS

## CORS

[`apps/api/src/index.ts`](../../apps/api/src/index.ts) — `Access-Control-Allow-Origin: NEXT_PUBLIC_APP_URL`, `Allow-Credentials: true`.

## Session

Scrypt passwords; session token SHA-256 in DB. See feat-0005.

## Checklist: new developer setup

1. Copy `apps/api/.env.example` → `apps/api/.env`
2. Copy `apps/web/.env.example` → `apps/web/.env`
3. Paste Supabase **Transaction** URI → `DATABASE_URL`
4. Paste Supabase **Direct** URI → `DIRECT_URL`
5. Set Resend keys and verified `EMAIL_FROM`
6. Run `pnpm --filter @afalambe/prisma exec prisma migrate deploy`
7. Start `pnpm dev:all`

## Related

- [`docs/env/README.md`](../../docs/env/README.md) — keep in sync with this spec
