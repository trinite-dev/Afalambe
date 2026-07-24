# feat-0012: Tech Spec — Resend webhook

## Handler

[`apps/api/src/index.ts`](../../apps/api/src/index.ts) `handleResendWebhook`, `mapWebhookEventToDeliveryStatus`.

## Env

`RESEND_WEBHOOK_SIGNING_SECRET` — required for production hardening.

## Prisma

`ResendWebhookEvent.eventId` unique; `EmailDelivery` updated by `providerMessageId`.

## Tests

[`apps/api/src/index.test.ts`](../../apps/api/src/index.test.ts) — `mapWebhookEventToDeliveryStatus`.

## Related

- [feat-0011 TECH](../feat-0011/TECH.md)
