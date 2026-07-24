# feat-0013: Offline message outbox

## Summary

Follow-up messages in an **existing thread** are queued in **localStorage** when send fails or the user is offline, then **retried** on reconnect and on a flush interval.

## Problem

Unstable networks should not lose user messages after the first claim message was already created.

## Non-goals

- Outboxing the **first** message of a new thread (handled synchronously only).
- Cross-device sync of outbox.

## Use case catalog

| ID | Use case | Success |
|----|----------|---------|
| **UC-OX01** | Enqueue on failure | Entry in localStorage |
| **UC-OX02** | Flush on online | `appendUserMessage` + `generateAssistantReply` |
| **UC-OX03** | Composer offline banner | Shown when `useOnlineStatus` false |

## Related

- [feat-0013 TECH](./TECH.md)
