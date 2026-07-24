# feat-0044: Static chat sidebar, scrollable main content

## Summary

On `/chat`, `/en/chat`, `/demo`, and `/en/demo`, the **sidebar stays fixed in the viewport** while the **main column** (messages / home empty state) scrolls independently. Scrolling the conversation must not move the thread list, New chat control, or account footer out of view.

## Assumptions

1. Desktop and tablet use the two-column `ChatAppShell`; collapsed icon rail stays fixed the same way.
2. The sidebar’s **thread list** may still scroll internally when there are many chats; the sidebar chrome (new chat, search, nav footer) stays pinned within the sidebar.
3. Mobile/narrow layouts keep the same shell rules (no separate mobile drawer in this feat).
4. Marketing pages are unchanged.

## Problem

The shell uses `min-h-dvh`, so tall message threads grow the whole page. Sidebar and main scroll together with the document, which feels broken for a chat app.

## Goals

| Goal | Detail |
|------|--------|
| **Fixed shell height** | Chat/demo fill the viewport (`h-dvh`) without growing the document |
| **Static sidebar** | Sidebar column does not scroll with the main conversation |
| **Scrollable main** | Message list (and home empty) scrolls inside the main column |
| **Pinned chrome** | Top bar + composer stay outside the message scroller (existing pattern) |
| **Sidebar list scroll** | Thread history scrolls inside the sidebar if needed |
| **Demo parity** | Same layout behavior on demo |

## Non-goals

- Redesigning sidebar contents or grouping
- Sticky message headers inside the thread
- Changing composer behavior beyond staying pinned

## Actors

| Actor | Description |
|-------|-------------|
| **Verified user** | Uses `/chat` with long threads |
| **Demo visitor** | Uses `/demo` with the same shell |

## Use case catalog

| ID | Use case | Trigger | Success |
|----|----------|---------|---------|
| **UC-LS01** | Scroll long thread | Many messages | Only main pane scrolls; sidebar stays put |
| **UC-LS02** | Scroll thread list | Many sidebar rows | Only sidebar nav scrolls; main pane position unchanged |
| **UC-LS03** | Collapse sidebar | Toggle collapse | Icon rail remains full viewport height |
| **UC-LS04** | Demo | `/demo` long scripted chat | Same static sidebar behavior |

## Acceptance criteria

1. Spec PRODUCT + TECH exist and are indexed in `specs/README.md`.
2. `ChatAppShell` + `ChatKitRoot` (chat usage) lock to viewport height with `overflow-hidden`.
3. Sidebar `aside` is `h-full min-h-0`; thread `nav` keeps `overflow-y-auto`.
4. Main column is a flex column with `min-h-0` / `overflow-hidden`; `ChatMessageList` remains the scroll container.
5. Document/body does not scroll when messaging on chat/demo (aside from nested scrollers).
6. Applies to chat and demo clients using the shared kit.

## Related

- [feat-0044 TECH](./TECH.md)
- [feat-0024](../feat-0024/PRODUCT.md)
- [feat-0037](../feat-0037/PRODUCT.md)
