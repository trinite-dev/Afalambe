# feat-0028: Admin UI and reviewer workspace

## Summary

**Planned** web surface for **admins and reviewers** to work the human verification queue: list claims, open detail, assign, resolve, add notes. Today only **`admin.queueCount`** exists with **no UI** ([`web.md`](../web.md) FR-W-3).

Complements [feat-0020](../feat-0020/PRODUCT.md) (API stub).

## Problem

[`program.md`](../program.md) SC-3 requires reviewers to resolve unmatched claims without SQL. Marketing promises human review when AI is uncertain.

## Non-goals (MVP admin UI)

- Impersonation.
- Bulk export for legal discovery.
- In-app user management (create admin).

## Actors

| Actor | Role | Access |
|-------|------|--------|
| **Reviewer** | `ADMIN` (future `REVIEWER`) | Queue list + resolve |
| **End user** | `USER` | No admin routes |

## Use case catalog (target)

### Queue list

| ID | Use case | Success |
|----|----------|---------|
| **UC-AD10** | Open `/admin/queue` | Table: id, created, status, factCheckStatus, language, snippet |
| **UC-AD11** | Filter by status / topic | Query params → API |
| **UC-AD12** | Search by text | Debounced search |

### Detail and resolve

| ID | Use case | Success |
|----|----------|---------|
| **UC-AD20** | Open claim detail | Full thread + metadata + AI runs (when `ClaimAiRun` exists) |
| **UC-AD21** | Set verdict + resolution note | `admin.claim.updateStatus` |
| **UC-AD22** | Assign to reviewer | Optional `assignedTo` field |
| **UC-AD23** | User notified on resolve | `claim-resolved` email ([feat-0011](../feat-0011/PRODUCT.md)) |

### Access control

| ID | Use case | Success |
|----|----------|---------|
| **UC-AD30** | Non-admin visits `/admin` | 403 or redirect |
| **UC-AD31** | Admin cannot access other users' claims via user routes | Separate procedures |

## Current state

| Capability | Status |
|------------|--------|
| `/admin/*` routes in web | **Missing** |
| `admin.queueCount` | Implemented (total count only) |
| `admin.claim.listQueue` | **Missing** |
| `admin.claim.updateStatus` | **Missing** |

## Acceptance criteria (when built)

1. Reviewer completes UC-AD20–AD23 without database tools.
2. All admin mutations append `AdminAuditLog` ([`api.md`](../api.md)).
3. WCAG 2.2 AA on admin tables (feat accessibility notes in [feat-0029](../feat-0029/PRODUCT.md) for shared patterns).

## Related

- [feat-0028 TECH](./TECH.md)
- [feat-0030](../feat-0030/PRODUCT.md) — claim status machine
