# feat-0006: Claims and chat (fact-check threads)

## Summary

The **chat experience** is backed by **Claim** threads: each verification request is a claim with messages, metadata (source, platform, language, verdict), and optional **image attachments**. Users **list**, **create**, **read**, and **append** messages; the UI uses the shared **chat kit** from `@afalambe/ui`.

Complements [feat-0007](../feat-0007/PRODUCT.md) (AI replies), [feat-0008](../feat-0008/PRODUCT.md) (uploads), [feat-0009](../feat-0009/PRODUCT.md) (realtime).

## Problem

Users need a persistent, account-bound place to submit claims in their language, see AI analysis, and return to past verifications—without dummy/seed data in production.

## Non-goals

- Public anonymous claims (all require verified user).
- Collaborative/multi-user claims.
- Full admin review UI (see feat-0018).

## Actors

| Actor | Description |
|-------|-------------|
| **Verified user** | Creates and manages own claims. |
| **Admin** | Count-only API today; no claim UI. |

## Claim metadata (product)

| Field | Purpose |
|-------|---------|
| `claimText` | Primary claim content |
| `claimLanguage` | `fr` / `ff` / `en` (auto-detected on create) |
| `factCheckStatus` | PENDING, VERIFIED, DEBUNKED, MISLEADING, PARTIALLY_TRUE |
| `sourceName`, `sourceType`, `sourceUrl` | Who said it |
| `platform`, `location`, `topicCategory` | Context |
| `mediaType` | TEXT, TEXT_IMAGE, etc. |

## Use case catalog

### Read

| ID | Use case | Trigger | Success |
|----|----------|---------|---------|
| **UC-C01** | List my claims | Open chat sidebar | `claim.listMine` paginated threads — see [feat-0037](../feat-0037/PRODUCT.md) for sidebar UX completion |
| **UC-C02** | Search threads | Sidebar search | `search` query param |
| **UC-C03** | Open thread | Select thread | `claim.byId` + messages |
| **UC-C04** | View metadata tags | Thread loaded | Header shows source, platform, language, verdict |

### Create

| ID | Use case | Trigger | Success |
|----|----------|---------|---------|
| **UC-C10** | New claim (first message) | Submit composer with no active thread | `claim.create` + `generateAssistantReply` |
| **UC-C11** | Attach images | Image picker on new claim | Upload then create with `attachments` JSON |
| **UC-C12** | Empty state examples | Click home column line | Fills composer (no send) |

### Update

| ID | Use case | Trigger | Success |
|----|----------|---------|---------|
| **UC-C20** | Follow-up message | Submit in active thread | `claim.appendUserMessage` + AI reply |
| **UC-C21** | Update metadata | — | `claim.updateMetadata` exists; **no UI** |

### Filters (API only)

| ID | Use case | Status |
|----|----------|--------|
| **UC-C30** | Filter by `factCheckStatus` | API supports; UI does not |
| **UC-C31** | Filter by `topicCategory` | API supports; UI does not |

## Behavior (product rules)

1. `requireVerifiedEmail` on all `claim.*` procedures.
2. Rate limit: 5 creates/minute/user; 10 upload requests/minute/user (production).
3. First message in new thread triggers synchronous AI generation.
4. Follow-up messages use **outbox** for retry (feat-0010).
5. Verdict badges use French labels in UI (`VERDICT_LABELS`).

## Acceptance criteria

1. Verified user sees only their claims in sidebar.
2. New claim appears in list after create + AI reply.
3. Images appear in message attachments when uploaded.
4. Unverified user cannot create claims (redirect to verify).

## Related

- [feat-0006 TECH](./TECH.md)
- Legacy [`chat.md`](../chat.md), [`claims-ai-pipeline.md`](../claims-ai-pipeline.md)
