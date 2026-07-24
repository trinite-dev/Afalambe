# feat-0005: Tech Spec — Session

## Procedure

`session.me` — protected query; returns user id, email, role, `emailVerifiedAt`.

## Context resolution

[`apps/api/src/index.ts`](../../apps/api/src/index.ts) `createContext`:

1. Parse `AUTH_COOKIE_NAME` from `Cookie` header.
2. `hashToken(raw)` → lookup `Session` where `expiresAt > now`.
3. Attach `sessionUser` or `null`.

## Prisma

`Session`: `tokenHash` unique, `userId`, `expiresAt`.

## Web client

[`apps/web/components/trpc-provider.tsx`](../../apps/web/components/trpc-provider.tsx) — `httpBatchLink` + `credentials: 'include'`.

## Middleware

[`packages/trpc/src/core.ts`](../../packages/trpc/src/core.ts):

- `protectedProcedure` — requires `sessionUser`
- `adminProcedure` — requires `ADMIN`

## Known gaps

- Logout does not invalidate server session row.
- No refresh-token rotation.

## Related

- [feat-0002 TECH](../feat-0002/TECH.md)
