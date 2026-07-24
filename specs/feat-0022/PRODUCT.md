# feat-0022: Database and Prisma schema

## Summary

**PostgreSQL** on **Supabase** persists all application data via **Prisma 7** with the **`@prisma/adapter-pg`** driver. Migrations live in `packages/prisma/migrations`.

## Models (implemented)

| Model | Feature area |
|-------|----------------|
| `User` | Auth, claims, email |
| `Session` | Cookies |
| `Claim` | Chat + fact-check metadata |
| `ClaimMessage` | Thread messages + attachments |
| `EmailVerificationToken` | OTP verify |
| `PasswordResetToken` | Password reset |
| `EmailDelivery` | Resend logging |
| `ResendWebhookEvent` | Webhook dedup |

## Enums

`UserRole`, `ClaimStatus`, `FactCheckStatus`, `SourceType`, `MediaType`, `TopicCategory`, `MessageRole`.

## Models in api.md not implemented

`ClaimAiRun`, `AdminAuditLog`, `Campaign`, `UserAttribution`.

## Operations required for app to work

1. `pnpm --filter @afalambe/prisma exec prisma migrate deploy`
2. Valid `DATABASE_URL` (pooler, port 6543) for runtime API.
3. Valid `DIRECT_URL` (db host, port 5432) for migrations.

## Related

- [feat-0022 TECH](./TECH.md)
