# feat-0028: Tech Spec — Admin UI

## API (current)

[`packages/trpc/src/routers/admin.ts`](../../packages/trpc/src/routers/admin.ts):

```ts
admin.queueCount → { total: number }  // prisma.claim.count()
```

## API (target per api.md)

| Procedure | Auth | Purpose |
|-----------|------|---------|
| `admin.claim.listQueue` | admin | Paginated OPEN/PROCESSING/FAILED |
| `admin.claim.byId` | admin | Any claim + messages |
| `admin.claim.updateStatus` | admin | Verdict, note, RESOLVED/FAILED |
| `admin.audit.list` | admin | Audit log |

## Prisma (target)

- `AdminAuditLog` model — not in schema
- Optional `Claim.assignedToUserId`

## Web (target routes)

| Route | Component |
|-------|-----------|
| `/admin` | Redirect → queue |
| `/admin/queue` | Queue table |
| `/admin/claims/[id]` | Detail + actions |

Middleware: server or client guard using `session.me` → `role === 'ADMIN'`.

## Promoting admin users

Manual SQL: `UPDATE "User" SET role = 'ADMIN' WHERE email = '...';`

## Related

- [feat-0020 TECH](../feat-0020/TECH.md)
- [feat-0025 TECH](../feat-0025/TECH.md) — campaign attribution on signup (future)
