# feat-0013: Tech Spec — Message outbox

## Hooks

- [`apps/web/hooks/use-message-outbox.ts`](../../apps/web/hooks/use-message-outbox.ts) — persist, flush, retry
- [`apps/web/hooks/use-online-status.ts`](../../apps/web/hooks/use-online-status.ts)

## Idempotency

`clientRequestId` on `claim.appendUserMessage` — unique per `(claimId, clientReqId)` in Prisma.

## Integration

[`chat-page-client.tsx`](../../apps/web/components/chat-page-client.tsx) — `outbox.enqueue` for follow-ups only.

## Related

- [feat-0006 TECH](../feat-0006/TECH.md)
