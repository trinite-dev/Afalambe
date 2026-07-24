# feat-0009: Realtime WebSocket updates

## Summary

Authenticated clients connect via **WebSocket** to receive **message** and **claim status** events for subscribed claim IDs, reducing reliance on polling after AI replies.

## Problem

Synchronous AI can take seconds; realtime invalidation keeps the message list fresh if multiple tabs or delayed renders occur.

## Use case catalog

| ID | Event | Client action |
|----|-------|---------------|
| **UC-RT01** | Connect | Cookie auth on upgrade |
| **UC-RT02** | Subscribe | Send `{ type: 'subscribe', payload: { claimIds } }` |
| **UC-RT03** | `message.created` | Invalidate `claim.byId` |
| **UC-RT04** | `claim.statusChanged` | Invalidate list + byId |
| **UC-RT05** | Ping/pong | Keepalive every 30s server ping |
| **UC-RT06** | Gap detected | Client refetch |

## Non-goals

- Typing indicators from server (`typing.start` not emitted).
- Presence / online users list.

## Known limitations

- Typing UI uses `generateAssistantReply.isPending` instead of WS typing events.

## Related

- [feat-0009 TECH](./TECH.md)
