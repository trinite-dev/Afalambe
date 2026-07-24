# feat-0002: Tech Spec — Authentication

## Context

Router: [`packages/trpc/src/routers/auth.ts`](../../packages/trpc/src/routers/auth.ts). Schemas: [`packages/trpc/src/schemas.ts`](../../packages/trpc/src/schemas.ts). UI: [`apps/web/components/auth/sign-in-form.tsx`](../../apps/web/components/auth/sign-in-form.tsx), [`sign-up-form.tsx`](../../apps/web/components/auth/sign-up-form.tsx).

## Procedures

| Procedure | Auth | Input | Output |
|-----------|------|-------|--------|
| `auth.register` | public | `email`, `password` | `{ userId }` |
| `auth.login` | public | `email`, `password` | `{ userId, email }` |
| `auth.logout` | protected | — | `{ ok: true }` |

## Prisma

| Model | Operation |
|-------|-----------|
| `User` | create (register), read (login) |
| `Session` | create on register/login |
| `EmailVerificationToken` | create on register (see feat-0003) |
| `EmailDelivery` | log verify email send |

## Crypto (API context)

[`apps/api/src/index.ts`](../../apps/api/src/index.ts):

- `hashPassword` / `verifyPassword` — scrypt + salt
- `hashToken` — SHA-256 for session and OTP storage
- `buildCookie` — HttpOnly, SameSite=Lax, 7-day Max-Age

## Rate limits

[`packages/trpc/src/rate-limit.ts`](../../packages/trpc/src/rate-limit.ts):

- `register:{email}` — 3 / hour
- `login:{email}` — 10 / minute

## Env

| Variable | Purpose |
|----------|---------|
| `AUTH_COOKIE_NAME` | Default `afalambe_session` |
| `AUTH_COOKIE_SECURE` | `true` in production HTTPS |
| `DATABASE_URL` | User/session persistence |
| `RESEND_API_KEY`, `EMAIL_FROM` | Register sends verify email |

## Known gaps

| Gap | PRODUCT ref |
|-----|-------------|
| Logout does not delete `Session` row | UC-O02 |
| No Next.js middleware | Client redirects only |
| `AUTH_SECRET` unused | — |

## Testing

```bash
pnpm --filter @afalambe/trpc test
# Manual: sign-up → verify → chat
```

## Related

- [feat-0005 TECH](../feat-0005/TECH.md) — session.me
