# feat-0032: Tech Spec — Chat UX

## Hooks (`apps/web/hooks/`)

| Hook | Purpose | Wired in chat? |
|------|---------|----------------|
| `use-auto-scroll.ts` | Scroll container to bottom | **No** |
| `use-autosize-textarea.ts` | Dynamic textarea height | **No** |
| `use-copy-to-clipboard.ts` | Clipboard + toast | **No** |
| `use-online-status.ts` | `navigator.onLine` | Yes (composer) |
| `use-message-outbox.ts` | Offline queue | Yes |
| `use-realtime.ts` | WebSocket | Yes |
| `use-audio-recording.ts` | Mic | Yes |

## UI kit

[`chat-message-row.tsx`](../../packages/ui/src/components/chat/chat-message-row.tsx) — renders `ChatMessageActions` when `showAssistantActions` true.

[`chat-message-actions.tsx`](../../packages/ui/src/components/chat/chat-message-actions.tsx) — `onCopy`, `onRegenerate` optional; thumbs buttons have no handlers.

[`chat-page-client.tsx`](../../apps/web/components/chat-page-client.tsx) line ~519: `showAssistantActions={message.role === 'ASSISTANT'}` without callbacks.

## Wiring sketch

```tsx
const { copy } = useCopyToClipboard({ onSuccess: () => notifyApiInfo(...) });

<ChatMessageRow
  showAssistantActions={message.role === 'ASSISTANT'}
  // Pass via extended row props or wrap actions in page:
/>
```

Extend `ChatMessageRow` to accept `onCopy` / `onRegenerate` props forwarding to `ChatMessageActions`.

## Global error

[`apps/web/app/global-error.tsx`](../../apps/web/app/global-error.tsx) — client boundary with `reset()`; English copy.

## API limits

[`chatMessageInput`](../../packages/trpc/src/schemas.ts) — content max 4000 chars.

## Related

- [feat-0026 TECH](../feat-0026/TECH.md) — E2E for copy/regenerate
- [feat-0013 TECH](../feat-0013/TECH.md) — outbox
