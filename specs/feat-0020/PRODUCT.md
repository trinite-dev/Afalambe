# feat-0020: Admin API and human review queue

## Summary

**Admin** users (`User.role === ADMIN`) can call **`admin.queueCount`** today. **Human review queue** is described in marketing and legacy specs but **not implemented** as a workflow (no reviewer UI, no claim assignment, `FAILED` status unused).

## Problem

When AI confidence is low, product promises human verification. Engineering needs a spec boundary between current stub and future queue.

## Implemented today

| Capability | Status |
|------------|--------|
| `admin.queueCount` | Returns count of claims (not a filtered queue) |
| `adminProcedure` middleware | Implemented |
| Admin web UI | **None** |
| Reviewer role | **None** |
| `admin.claim.updateStatus` | **Not implemented** |
| `AdminAuditLog` model | **Not in schema** |

## Target product (roadmap)

1. Claims with ambiguous AI verdict → `ClaimStatus` PROCESSING or FAILED.
2. Reviewer dashboard lists queue.
3. Reviewer sets `factCheckStatus` + resolution message.
4. User notified via `claim-resolved` email.
5. Append-only audit log.

## Use case catalog (planned)

| ID | Use case | Status |
|----|----------|--------|
| **UC-AD01** | Admin views queue | Planned |
| **UC-AD02** | Admin resolves claim | Planned |
| **UC-AD03** | User receives resolution email | Partial (email template exists) |

## Related

- [feat-0020 TECH](./TECH.md)
- [`api.md`](../api.md) — permission matrix
- [`claims-ai-pipeline.md`](../claims-ai-pipeline.md)
