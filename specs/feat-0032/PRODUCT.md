# feat-0032: Chat UX utilities (scroll, composer, message actions)

## Summary

Polish behaviors for the **chat thread**: auto-scroll, autosizing composer, copy-to-clipboard, message actions (copy, regenerate, feedback), character limits, and offline banner. Several hooks exist but are **not fully wired** in [`chat-page-client.tsx`](../../apps/web/components/chat-page-client.tsx).

Complements [feat-0006](../feat-0006/PRODUCT.md), [feat-0024](../feat-0024/PRODUCT.md).

## Problem

[`web.md`](../web.md) FR-W-2 requires scrollable threads, character limits, and distinct message styling. Users expect copy/regenerate on assistant messages.

## Use case catalog

| ID | Use case | Status |
|----|----------|--------|
| **UC-UX01** | Auto-scroll to newest message | Hook exists; **not wired** in chat page |
| **UC-UX02** | Stop auto-scroll when user scrolls up | In `use-auto-scroll.ts` |
| **UC-UX03** | Composer grows with text | `use-autosize-textarea.ts` — wire to composer |
| **UC-UX04** | Copy assistant message | `use-copy-to-clipboard.ts` + toast — **actions not wired** |
| **UC-UX05** | Regenerate last reply | Button in UI — **no handler** |
| **UC-UX06** | Thumbs up/down feedback | Rendered — **no backend** |
| **UC-UX07** | Character limit 4000 | API enforces; **no counter in UI** |
| **UC-UX08** | Offline banner in composer | Implemented in `ChatComposer` |
| **UC-UX09** | Distinct USER vs ASSISTANT styling | Implemented in `ChatMessageBubble` |
| **UC-UX10** | Global error boundary | [`global-error.tsx`](../../apps/web/app/global-error.tsx) — minimal |

## Accessibility (target)

| ID | Requirement |
|----|-------------|
| **A11Y-01** | Message actions reachable by keyboard |
| **A11Y-02** | `aria-label` on icon buttons (partially English in UI kit) |
| **A11Y-03** | Focus visible on composer and thread |

See [feat-0029](../feat-0029/PRODUCT.md) for localized aria-labels.

## Acceptance criteria

1. UC-UX01–04 wired for MVP chat polish.
2. Regenerate calls `generateAssistantReply` with idempotency guard (no duplicate spam).
3. Character counter visible above 3500 chars.

## Related

- [feat-0032 TECH](./TECH.md)
