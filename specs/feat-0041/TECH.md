# feat-0041: Tech Spec — Durable chat history

## Architecture

```text
Auth truth:  Claim + ClaimMessage (Postgres)
Client hint: localStorage afalambe_active_claim:{userId}
Deep link:   /chat/{claimId}  |  /en/chat/{claimId}
Demo truth:  localStorage afalambe_demo_chat_v1
Outbox:      afalambe_message_outbox:{userId}  |  afalambe_demo_message_outbox
```

Logout deletes **Session** only (existing `auth.logout`). Claims are never cascaded by logout.

## Files

```text
specs/feat-0041/PRODUCT.md
specs/feat-0041/TECH.md
apps/web/lib/chat-history-storage.ts
apps/web/lib/chat-history-storage.test.ts
apps/web/components/chat-page-client.tsx
apps/web/hooks/use-demo-session.ts
apps/web/hooks/use-message-outbox.ts
apps/web/app/chat/[claimId]/page.tsx
apps/web/app/en/chat/[claimId]/page.tsx
apps/web/lib/localized-path.ts          # CanonicalPath includes /chat/${string}
```

## Storage API

```ts
activeClaimStorageKey(userId: string): string
getActiveClaimId(userId: string): string | null
setActiveClaimId(userId: string, claimId: string | null): void

messageOutboxStorageKey(userId: string): string
clearAuthChatClientState(userId: string): void  // active claim + outbox

DEMO_CHAT_STORAGE_KEY = 'afalambe_demo_chat_v1'
loadDemoChatHistory(): { activeThreadId: string | null; threads: DemoThreadSnapshot[] } | null
saveDemoChatHistory(state): void
clearDemoChatHistory(): void
```

Demo snapshot stores serializable threads (no `isTyping: true` after load). Schema `version: 1`.

## Auth UI flow

1. `ChatPageClient({ initialClaimId?: string })`.
2. After `session.me` success:
   - Prefer `initialClaimId` from route.
   - Else `getActiveClaimId(userId)`.
   - Set `activeThreadId` + `started` when present.
3. On select / create claim: `setActiveClaimId` + `replace(/chat/{id})` (locale-aware).
4. On “new chat” / clear selection: `setActiveClaimId(null)` + `replace(/chat)`.
5. `claim.byId` error (NOT_FOUND / FORBIDDEN): clear active id, toast optional, home state.
6. Logout `onSuccess`: `clearAuthChatClientState(userId)` (outbox only) → `trpcUtils.invalidate()` → `push('/sign-in')`. Last-active claim id is retained for the same `userId`.

## Demo UI flow

1. `useDemoSession` hydrates once from `loadDemoChatHistory`.
2. Persist on every `threads` / `activeThreadId` change (debounce optional; sync write OK for demo size).
3. When scheduling assistant reply, never persist `isTyping: true` (normalize on save).

## Outbox

- `useMessageOutbox` reloads when `storageKey` changes (user login).
- Auth chat passes `messageOutboxStorageKey(userId)` once session known; disable flush until keyed.

## Routes

| Path | Page |
|------|------|
| `/chat` | Existing; restore from storage |
| `/chat/[claimId]` | Same client with `initialClaimId` |
| `/en/chat`, `/en/chat/[claimId]` | EN mirrors |

`localizedHref` / `CanonicalPath` treat `/chat/{id}` as canonical so locale switcher keeps the claim id.

## Testing

| Test | Assert |
|------|--------|
| Active claim round-trip | set/get/clear per userId |
| Keys differ by user | A and B isolated |
| Demo save/load | messages + active id restored; version guard |
| Corrupt JSON | returns null; no throw |

## Verification

```bash
pnpm --filter @afalambe/web exec node --import tsx --test lib/chat-history-storage.test.ts
pnpm --filter @afalambe/web typecheck
```

## Security

- Never trust client storage for authorization — always `claim.byId` with session.
- Do not store passwords or session tokens in these keys.
- Cap demo payload size (e.g. drop oldest threads if JSON > 1.5MB) to avoid quota errors.
