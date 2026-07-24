# feat-0012: Resend delivery webhook

## Summary

**POST /webhooks/resend** receives Resend delivery events and updates **`EmailDelivery.status`** (delivered, bounced, failed, etc.). Events are deduplicated in **`ResendWebhookEvent`**.

## Use case catalog

| ID | Use case | Success |
|----|----------|---------|
| **UC-W01** | Valid signature | 200; delivery updated |
| **UC-W02** | Invalid/missing signature | 401 |
| **UC-W03** | Duplicate event id | 200 no-op |

## Security note

Current check compares header to `RESEND_WEBHOOK_SIGNING_SECRET` as shared secret (not HMAC body verification).

## Related

- [feat-0012 TECH](./TECH.md)
