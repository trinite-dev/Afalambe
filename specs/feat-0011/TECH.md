# feat-0011: Tech Spec — Resend email

## API

[`packages/emails/src/index.ts`](../../packages/emails/src/index.ts):

- `sendVerifyEmail`, `sendPasswordResetEmail`, `sendClaimQueuedEmail`, `sendClaimResolvedEmail`
- `getEmailProvider()` → `'resend'`

## Call sites

- [`packages/trpc/src/routers/auth.ts`](../../packages/trpc/src/routers/auth.ts)
- [`packages/trpc/src/routers/claim.ts`](../../packages/trpc/src/routers/claim.ts)

## Prisma

`EmailDelivery` — `templateKey`, `idempotencyKey` unique, `providerMessageId`, `status`, `errorCode`.

## Env

`RESEND_API_KEY`, `EMAIL_FROM`.

## Tests

[`packages/emails/src/index.test.ts`](../../packages/emails/src/index.test.ts).

## Related

- [feat-0012 TECH](../feat-0012/TECH.md)
