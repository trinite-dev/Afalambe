# feat-0020: Tech Spec — Admin and human queue

## Procedure

[`packages/trpc/src/routers/admin.ts`](../../packages/trpc/src/routers/admin.ts):

- `admin.queueCount` — `adminProcedure`; `prisma.claim.count()`.

## Prisma

`User.role` — `USER` | `ADMIN`.

`Claim.status` — `OPEN`, `PROCESSING`, `RESOLVED`, `FAILED` (FAILED unused).

## Gaps vs api.md

| Planned | Status |
|---------|--------|
| `admin.claim.listQueue` | Missing |
| `admin.claim.updateStatus` | Missing |
| `AdminAuditLog` | Missing |
| `ClaimAiRun` | Missing |

## Setting admin role

Manual DB update on `User.role` — no admin promotion UI.

## Related

- [feat-0007 TECH](../feat-0007/TECH.md)
- [feat-0011 TECH](../feat-0011/TECH.md)
