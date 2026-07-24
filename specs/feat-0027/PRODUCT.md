# feat-0027: Security, secrets, and environment contract

## Summary

Cross-cutting **security requirements** for Afalambe: where secrets live, what must never reach the browser, session/cookie rules, CORS, rate limits, and webhook verification. Unifies [`docs/env/README.md`](../../docs/env/README.md) with product rules from [`program.md`](../program.md) SC-4.

## Problem

Env vars and security rules are scattered across `feat-*` TECH files. Operators and developers need one checklist to stand up a safe environment.

## Non-goals

- Full penetration test report.
- SOC2 compliance mapping.

## Rules (product)

| ID | Rule |
|----|------|
| **SEC-01** | No `DATABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`, `RESEND_API_KEY`, or `AI_API_KEY` in `apps/web` bundle |
| **SEC-02** | Session cookie: HttpOnly, SameSite=Lax, Secure in production |
| **SEC-03** | Never accept `userId` from client for authorization |
| **SEC-04** | Password reset must not leak account existence (`requestPasswordReset` always ok) |
| **SEC-05** | `RESEND_WEBHOOK_SIGNING_SECRET` required in production for `/webhooks/resend` |
| **SEC-06** | Rate limits enabled in production ([feat-0021](../feat-0021/PRODUCT.md)) |
| **SEC-07** | URL-encode special characters in Postgres connection strings (`@` → `%40`) |

## Known gaps (target)

| ID | Gap | Target |
|----|-----|--------|
| **SEC-G01** | `NEXT_PUBLIC_OPENAI_API_KEY` for Whisper in browser | Proxy via API ([feat-0015](../feat-0015/PRODUCT.md)) |
| **SEC-G02** | Logout does not revoke `Session` row | Delete session on logout |
| **SEC-G03** | `AUTH_SECRET` documented but unused | Remove or wire for signing |
| **SEC-G04** | Password change does not invalidate other sessions | Invalidate all sessions on reset |
| **SEC-G05** | Webhook uses header equality, not HMAC body | Align with Resend docs |

## Acceptance criteria

1. `apps/web/.env.example` lists only public vars (+ document forbidden vars).
2. `apps/api/.env` loaded via [`load-env.ts`](../../apps/api/src/load-env.ts) before Prisma.
3. CORS origin equals `NEXT_PUBLIC_APP_URL` on API.

## Related

- [feat-0027 TECH](./TECH.md)
- [feat-0022](../feat-0022/PRODUCT.md) — database URLs
