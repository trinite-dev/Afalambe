# feat-0003: Tech Spec — Email verification

## Procedures

| Procedure | Auth | Input |
|-----------|------|-------|
| `auth.verifyEmail` | public | `email`, `otpCode` (6 chars) |
| `auth.resendVerification` | protected | — |

Guard: [`packages/trpc/src/guards.ts`](../../packages/trpc/src/guards.ts) `requireVerifiedEmail`.

## Prisma

`EmailVerificationToken`: `tokenHash`, `userId`, `expiresAt`, `usedAt`.

`User.emailVerifiedAt` — nullable until verified.

## Email

`sendVerifyEmail({ to, otpCode, idempotencyKey })` — [`packages/emails/src/index.ts`](../../packages/emails/src/index.ts).

Idempotency keys: `verify:{userId}:{tokenHash}`, `verify-resend:{userId}:{tokenHash}`.

## Web routes

| Path | Component |
|------|-----------|
| `/sign-up/verify` | `VerifyEmailForm` |
| Chat gate | [`chat-page-client.tsx`](../../apps/web/components/chat-page-client.tsx) |

## Env

`RESEND_API_KEY`, `EMAIL_FROM`, `NEXT_PUBLIC_APP_URL` (links in other templates).

## Testing

Manual OTP flow; `packages/emails/src/index.test.ts` for template text.

## Related

- [feat-0002 TECH](../feat-0002/TECH.md)
