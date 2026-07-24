# feat-0011: Transactional email (Resend)

## Summary

Afalambe sends email via **Resend** for **verify OTP**, **password reset**, and **claim lifecycle** (queued, resolved). Each send logs an **`EmailDelivery`** row with idempotency keys.

## Templates

| Template key | Trigger | Audience |
|--------------|---------|----------|
| `verify-email` | Register, resend verification | Registrant |
| `password-reset` | Forgot password | User |
| `claim-queued` | AI processing starts | See [feat-0030](../feat-0030/PRODUCT.md) |
| `claim-resolved` | After AI reply (every run) | See [feat-0030](../feat-0030/PRODUCT.md) |

Package: [`packages/emails`](../../packages/emails).

## Use case catalog

| ID | Use case | Success |
|----|----------|---------|
| **UC-E01** | Send verify email | Resend returns message id; `EmailDelivery.status=sent` |
| **UC-E02** | Send fails | `status=failed`, `errorCode` stored |
| **UC-E03** | Idempotent resend | Same `idempotencyKey` dedupes at Resend |

## Acceptance criteria

1. Emails from `EMAIL_FROM` domain verified in Resend.
2. French HTML + plain text bodies.
3. No secrets in logs.

## Related

- [feat-0011 TECH](./TECH.md)
- [feat-0012](../feat-0012/PRODUCT.md) — webhooks
- [`resend-email-implementation.md`](../resend-email-implementation.md)
