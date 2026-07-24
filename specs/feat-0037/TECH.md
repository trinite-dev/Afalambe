# feat-0037: Tech Spec — Multiple chats in sidebar

## Architecture

```text
claim.listMine (paginated) ──► chat-page-client ──► ChatSidebar threads[]
claim.byId (active)          ──► ChatMessageList
claim.create                 ──► invalidate listMine + set activeThreadId
claim.updateTitle (new)      ──► optimistic sidebar update
claim.delete (new)           ──► remove row + clear active if needed
```

Each **sidebar row** = one `Claim` (`packages/prisma/schema.prisma`). Messages = `ClaimMessage[]`.

## Current implementation (baseline)

| Layer | File | Notes |
|-------|------|-------|
| API list | `packages/trpc/src/routers/claim.ts` → `listMine` | `take: 50`, search, filters; no cursor |
| API read | `claim.byId` | Full thread + signed attachment URLs |
| API create | `claim.create` | Sets `title` from input or `content.slice(0, 80)` |
| Web | `apps/web/components/chat-page-client.tsx` | Maps `listMine` → `ChatThread[]`; `onThreadSelect`, `onNewChat` |
| UI kit | `packages/ui/src/components/chat/chat-sidebar.tsx` | Renders list; **no `activeThreadId`** |

**Misleading UI:** `handleClearConversations` only resets local state; label uses `clearConversations` ([`CHAT_UI`](../../apps/web/lib/ui-locale.ts)).

## API changes

### 1. Paginated `claim.listMine`

Extend input:

```ts
z.object({
  search: z.string().trim().max(200).optional(),
  factCheckStatus: z.enum(factCheckStatusValues).optional(),
  topicCategory: z.enum(topicCategoryValues).optional(),
  cursor: z.object({ updatedAt: z.date(), id: z.string().cuid() }).optional(),
  limit: z.number().int().min(1).max(50).default(30),
})
```

Extend output:

```ts
z.object({
  items: z.array(/* existing row shape */),
  nextCursor: z.object({ updatedAt: z.date(), id: z.string().cuid() }).nullable(),
})
```

Query: `orderBy: [{ updatedAt: 'desc' }, { id: 'desc' }]`, cursor `where` on tuple comparison.

### 2. `claim.updateTitle` (new mutation)

```ts
input: z.object({ claimId: z.string().cuid(), title: z.string().trim().min(1).max(120) })
```

- `requireVerifiedEmail`
- Ownership check (`createdByUserId`)
- `prisma.claim.update({ title })`

### 3. `claim.delete` (new mutation)

```ts
input: z.object({ claimId: z.string().cuid() })
```

- Ownership check
- Delete storage objects for attachment `uploadPath` values (reuse orphan cleanup patterns from [feat-0010](../feat-0010/TECH.md))
- `prisma.claim.delete` (cascade messages per schema)

Rate limit: 10 deletes/minute/user (production).

### 4. Schemas

Add Zod input/output types in `packages/trpc/src/schemas.ts`; export from router.

## UI kit changes (`@afalambe/ui/chat`)

### `ChatSidebar` (`chat-sidebar.tsx`)

| Prop | Type | Purpose |
|------|------|---------|
| `activeThreadId` | `string \| null` | Highlight current row |
| `groupedThreads` | `Array<{ label: string; threads: ChatThread[] }>` | Optional; web computes groups |
| `onThreadRename` | `(threadId: string) => void` | Phase 1: callback; web opens dialog |
| `onThreadDelete` | `(threadId: string) => void` | Phase 1: callback |
| `emptyState` | `ReactNode` | Zero threads |
| `loading` | `boolean` | List loading |
| `loadMore` | `() => void` | Pagination |
| `hasMore` | `boolean` | Show load-more control |

**Active row styles:** `bg-[var(--chat-sidebar-item-active)]` (add CSS variable in `chat-gpt-kit.css` if missing) + `aria-current="page"`.

**Row actions:** overflow menu (⋯) on hover/focus with Rename / Delete — use existing `Button` + `DropdownMenu` from UI kit.

**Collapsed mode:** Phase 2 — show stacked avatars or recent-3 popover; MVP unchanged.

### `ChatThread` type extension (optional phase 2)

```ts
export type ChatThread = {
  id: string
  title: string
  updatedLabel?: string
  factCheckStatus?: string
}
```

## Web app changes

### `chat-page-client.tsx`

| Task | Detail |
|------|--------|
| Pass `activeThreadId` | To `ChatSidebar` |
| Paginated query | `useInfiniteQuery` or manual cursor state with `listMine` |
| Group threads | Client helper `groupThreadsByDate(threads, locale)` using `updatedAt` |
| Rename flow | Modal / inline edit → `updateTitle.mutate` → invalidate `listMine` |
| Delete flow | Confirm dialog → `delete.mutate` → if `activeThreadId === id`, call `onNewChat` logic |
| Rename footer button | `clearConversations` → `deselectChat` in `CHAT_UI` |
| List invalidation | After `create`, `appendUserMessage`, `generateAssistantReply`, `delete` |
| Realtime | On `onStatusChange` / `onMessage`, invalidate `listMine` (partially done) |

### Date grouping helper

New file: `apps/web/lib/chat-thread-groups.ts`

```ts
export function groupThreadsByRecency(
  threads: Array<{ id: string; updatedAt: Date; ... }>,
  labels: { today: string; yesterday: string; previous7Days: string; older: string },
): Array<{ label: string; threads: ChatThread[] }>
```

Unit tests in `chat-thread-groups.test.ts`.

### i18n (`apps/web/lib/ui-locale.ts`)

Add to `CHAT_UI.fr` / `CHAT_UI.en`:

- `deselectChat`, `emptyThreadList`, `emptyThreadListHint`, `noSearchResults`
- `renameThread`, `deleteThread`, `deleteThreadConfirmTitle`, `deleteThreadConfirmBody`
- `loadMoreChats`, `threadGroupToday`, `threadGroupYesterday`, `threadGroupPrevious7Days`, `threadGroupOlder`
- `threadRenamed`, `threadDeleted`, `threadDeleteFailed`

## Optional phase 2: deep-linked threads

| Route | File |
|-------|------|
| `/chat/[claimId]` | `apps/web/app/chat/[claimId]/page.tsx` |
| `/en/chat/[claimId]` | `apps/web/app/en/chat/[claimId]/page.tsx` |

`ChatPageClient` accepts optional `initialClaimId` prop; validate ownership via `byId` (404 → redirect `/chat`).

Update [I18N_ROUTED_SPEC](../I18N_ROUTED_SPEC.md) URL map if implemented.

## CSS

In `packages/ui/src/chat-gpt-kit.css`:

```css
--chat-sidebar-item-active: /* subtle fill distinct from hover */
```

## Testing

| Layer | Tests |
|-------|-------|
| API | `claim.updateTitle` ownership + length; `claim.delete` cascade; pagination cursor stability |
| Unit | `groupThreadsByRecency`, localized labels |
| E2E | Create 2 chats → both in sidebar → switch → search → delete one |
| a11y | Active row `aria-current`; keyboard navigate list |

Suggested E2E file: `tests/e2e/chat-sidebar-threads.spec.ts` (requires test user + DB seed or signup flow).

## Implementation phases

### Phase 1 — MVP (sidebar feels multi-chat)

1. `activeThreadId` highlight in `ChatSidebar`
2. Empty + loading states
3. Rename footer to "Deselect chat"
4. Ensure `listMine` invalidates on create (verify existing)
5. FR/EN strings

### Phase 2 — Management + scale

1. `claim.updateTitle`, `claim.delete`
2. Row actions UI + confirm dialog
3. Paginated `listMine` + load more
4. Date grouping

### Phase 3 — Polish

1. Deep link routes
2. Verdict chips on rows
3. Collapsed sidebar thread access
4. Unsaved composer warning on switch

## Security

- All mutations: `protectedProcedure` + `requireVerifiedEmail` + `createdByUserId` match
- Delete must remove storage blobs to avoid orphans
- Search input already capped at 200 chars

## Dependencies

| Feature | Dependency |
|---------|------------|
| Thread list | feat-0006 `listMine` |
| Create thread | feat-0006 `create` |
| Sidebar shell | feat-0024 `ChatSidebar` |
| i18n | feat-0029 `CHAT_UI` |
| Storage cleanup on delete | feat-0010 patterns |
| Realtime refresh | feat-0009 `listMine` invalidation |

## Known gaps after delivery

| Gap | Owner spec |
|-----|------------|
| Filter by verdict in sidebar | feat-0006 UC-C30 |
| Admin view of user threads | feat-0020 |
| Public demo threads | feat-0035 |

## Verification

```bash
pnpm --filter @afalambe/trpc exec tsc --noEmit
pnpm --filter @afalambe/ui exec tsc --noEmit
pnpm --filter @afalambe/web exec tsc --noEmit
pnpm --filter @afalambe/web test
# manual: create 3 claims, switch, refresh, search, rename, delete
```

## Related

- [feat-0037 PRODUCT](./PRODUCT.md)
- [feat-0006 TECH](../feat-0006/TECH.md)
