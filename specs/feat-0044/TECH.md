# feat-0044: Tech Spec — Static sidebar / scrollable main

## Layout model

```text
ChatKitRoot          h-dvh overflow-hidden
  ChatAppShell       h-full overflow-hidden flex
    ChatSidebar      h-full min-h-0 shrink-0 flex-col
      header/search  shrink-0
      nav            flex-1 min-h-0 overflow-y-auto   ← sidebar list scroll
      footer         shrink-0
    main             h-full min-h-0 flex-1 flex-col overflow-hidden
      ChatTopBar     shrink-0
      metadata       shrink-0 (optional)
      ChatMessageList flex-1 min-h-0 overflow-y-auto ← main scroll
      composer       shrink-0
```

## Files

```text
specs/feat-0044/PRODUCT.md
specs/feat-0044/TECH.md
packages/ui/src/components/chat/chat-kit-root.tsx
packages/ui/src/components/chat/chat-app-shell.tsx
packages/ui/src/components/chat/chat-sidebar.tsx
```

No web-app-specific layout forks unless a page wraps the kit incorrectly.

## Class changes

| Component | Before | After |
|-----------|--------|-------|
| `ChatKitRoot` | `min-h-dvh` | `h-dvh overflow-hidden` (chat fills viewport) |
| `ChatAppShell` root | `min-h-dvh` | `h-full max-h-full overflow-hidden` (fill kit root) |
| `ChatAppShell` main | `flex min-h-0 flex-1 flex-col` | add `h-full overflow-hidden` |
| `ChatSidebar` aside | width + flex-col | add `h-full min-h-0` (expanded + collapsed) |

`ChatMessageList` already uses `flex-1 min-h-0 overflow-y-auto` — keep as the main scroller.

## Verification

Manual:

1. Open `/chat` with a long thread → scroll messages → sidebar stays fixed.
2. Add many threads → scroll sidebar list → main stays put.
3. Repeat on `/demo`.
4. Collapse sidebar → rail full height.

```bash
pnpm --filter @afalambe/ui typecheck
pnpm --filter @afalambe/web typecheck
```
