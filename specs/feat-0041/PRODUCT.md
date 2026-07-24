# feat-0041: Durable chat history (reload, login, logout)

## Summary

Chat history must **remain available** across browser reload, login, and logout for the same account. Authenticated threads stay in the database; the client must **restore** the last open conversation and never treat logout as deleting claims. The public **demo** keeps its guided threads in browser storage across reload (device-local, not account-bound).

Complements [feat-0006](../feat-0006/PRODUCT.md), [feat-0035](../feat-0035/PRODUCT.md), [feat-0037](../feat-0037/PRODUCT.md), [feat-0013](../feat-0013/PRODUCT.md).

## Assumptions

1. **Auth history source of truth** is Postgres (`Claim` + `ClaimMessage`), already written by feat-0006.
2. **Logout must not delete** claims or messages — only the auth session cookie/row.
3. **Demo history** is anonymous and lives in `localStorage` on that browser; it does **not** merge into an account on sign-up.
4. **“Clear conversations”** still means clear **local selection / home view** for auth chat (no mass delete), unless the user later deletes an individual thread (feat-0037).
5. Shared devices: client keys are **scoped by user id** so outbox / last-thread do not leak across accounts.

## Problem

| Scenario | Today | Expected |
|----------|-------|----------|
| Reload while logged in | Messages exist in DB, but active thread selection is lost; user lands on empty home | Sidebar + last (or deep-linked) thread reopen with full messages |
| Login again | `listMine` returns claims, but UI starts with no selection | History listed; last active thread restored when still owned |
| Logout | Claims remain in DB (good), but client cache / outbox / last-thread keys are messy | Session cleared; **server history untouched**; next login shows the same threads |
| Reload on `/demo` | All demo threads vanish (in-memory only) | Demo threads and messages restore from `localStorage` |

Users experience chat as ephemeral even when the backend already persisted it.

## Goals

| Goal | Detail |
|------|--------|
| **Survive reload (auth)** | Thread list + selected conversation messages return after refresh |
| **Survive login** | After sign-in, account history loads; last open claim restores when valid |
| **Survive logout** | Logging out does **not** erase account chat history; logging in again shows the same threads |
| **Deep link** | `/chat/{claimId}` and `/en/chat/{claimId}` open that thread when owned |
| **Demo reload** | `/demo` restores multi-thread demo history from local storage |
| **Client hygiene** | Logout clears React Query cache and user-scoped client keys (selection, outbox) without touching the DB |
| **No cross-user leak** | Active-thread and outbox keys include `userId` |

## Non-goals

- Syncing demo threads into a user account after registration
- End-to-end encrypted or offline-first full message store for auth chat (server remains authoritative)
- Export / import of history, or multi-device sync beyond the existing API
- Changing claim retention / GDPR purge policies (separate ops work)
- Completing rename/delete/pagination from feat-0037 (referenced, not required to close this feat)

## Actors

| Actor | Description |
|-------|-------------|
| **Verified user** | Expects permanent history tied to their account |
| **Anonymous demo visitor** | Expects guided demo chats to survive refresh on the same browser |
| **System** | Persists claims server-side; restores client selection safely |

## Behavior

### A. Authenticated chat

1. Creating / appending messages continues to write `Claim` / `ClaimMessage` (feat-0006).
2. Selecting a thread persists `activeClaimId` for that `userId` in `localStorage`.
3. Opening `/chat/{claimId}` (or EN equivalent) sets that claim as active when `claim.byId` succeeds.
4. On `/chat` with no id: restore last `activeClaimId` if `byId` (or list membership) succeeds; otherwise show home empty state.
5. If restored claim is missing / forbidden: clear stored id, show home, do not error-loop.
6. **Logout:** delete session (feat-0002); **do not** delete claims; clear React Query cache and user-scoped **outbox**; keep per-user last-active claim id for restore on next login; redirect to sign-in.
7. **Login:** `listMine` shows all prior threads; restore last active claim when still owned.

### B. Demo chat

8. Demo threads/messages persist under a versioned `localStorage` key.
9. Reload `/demo` restores threads, active selection, and messages (typing flags reset to idle).
10. Explicit “clear selection” does not wipe stored demo history; a dedicated wipe may clear storage only when product copy says so (default: keep history like auth).
11. Demo outbox remains separate from auth outbox keys.

### C. Copy / UX

12. FR + EN chrome unchanged except any toast clarifying that history is kept on the account after sign-out (optional).
13. Sidebar still lists newest-first; empty account still shows home examples.

## Use case catalog

| ID | Use case | Trigger | Success |
|----|----------|---------|---------|
| **UC-H01** | Reload open thread | Refresh on `/chat/{id}` while logged in | Same messages and metadata visible |
| **UC-H02** | Reload from `/chat` | Refresh with saved active id | Last thread reopens |
| **UC-H03** | Login restores history | Sign in after prior chats | Sidebar lists prior claims |
| **UC-H04** | Login restores selection | Sign in with saved active id | That thread opens when still owned |
| **UC-H05** | Logout keeps server history | Sign out then sign in | Same threads still listed |
| **UC-H06** | Logout clears volatile client data | Sign out | Cookie gone; RQ cache cleared; outbox cleared; **no** delete of account claims; last-active id may remain for same userId |
| **UC-H07** | Deep link other user’s claim | Open foreign `claimId` | Not found / unauthorized; home state; no crash |
| **UC-H08** | Demo survives reload | Refresh `/demo` mid-conversation | Threads + messages restored |
| **UC-H09** | Shared device two accounts | User A logout, User B login | B never sees A’s outbox or last-thread id |

## Acceptance criteria

1. Spec PRODUCT + TECH exist and are indexed in `specs/README.md`.
2. Authenticated messages remain in DB across logout/login (no delete on logout).
3. Reload restores the open auth thread (URL and/or per-user last-active storage).
4. Deep links `/chat/[claimId]` and `/en/chat/[claimId]` work for owned claims.
5. Demo history restores from `localStorage` after reload.
6. Logout clears client cache and user-scoped keys without deleting claims.
7. Unit tests cover storage helpers (load/save/clear, versioning, user scoping).
8. Typecheck passes for `@afalambe/web`.

## Related

- [feat-0041 TECH](./TECH.md)
- [feat-0006](../feat-0006/PRODUCT.md) — Claim as thread
- [feat-0037](../feat-0037/PRODUCT.md) — Multi-chat sidebar
- [feat-0035](../feat-0035/PRODUCT.md) — Public demo
- [feat-0013](../feat-0013/PRODUCT.md) — Message outbox
