# feat-0005: Session and identity (`session.me`)

## Summary

Authenticated requests carry an **HTTP-only session cookie**. The server resolves the cookie to a **User** row and exposes identity via **`session.me`**. Protected procedures require `ctx.sessionUser`.

## Problem

The web app and WebSocket layer need a consistent notion of "who is logged in" without trusting client-supplied user IDs.

## Use case catalog

| ID | Use case | Preconditions | Main flow | Postcondition |
|----|----------|---------------|-----------|---------------|
| **UC-S01** | Load session | Valid cookie | `session.me` | `{ id, email, role, emailVerifiedAt }` |
| **UC-S02** | Expired session | Cookie past `Session.expiresAt` | Any protected call | UNAUTHORIZED |
| **UC-S03** | Missing cookie | Anonymous | Protected call | UNAUTHORIZED |
| **UC-S04** | Web credentials | tRPC from browser | `credentials: 'include'` | Cookie sent cross-origin to API |

## Behavior

- Session lifetime: **7 days** from create.
- Roles: `USER`, `ADMIN` (`UserRole` enum).
- `adminProcedure` requires `role === 'ADMIN'`.

## Related

- [feat-0005 TECH](./TECH.md)
