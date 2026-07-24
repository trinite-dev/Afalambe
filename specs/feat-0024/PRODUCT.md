# feat-0024: Chat, auth, and landing UI kit

## Summary

**`@afalambe/ui`** provides shared **chat shell**, **auth cards**, **landing sections**, and **Base UI** primitives styled with Tailwind CSS variables. Consumed by `apps/web` via `transpilePackages`.

## Chat kit (`@afalambe/ui/chat`)

| Component | Purpose |
|-----------|---------|
| `ChatAppShell`, `ChatSidebar` | Layout |
| `ChatComposer` | Text, image, mic |
| `ChatMessageList`, `ChatMessageRow` | Thread display |
| `ChatHomeEmpty` | New chat suggestions |
| `ChatTopBar` | Brand header |
| `ChatTypingIndicator` | Loading state |

## Auth kit (`@afalambe/ui/auth`)

`AuthPageShell`, `AuthCardFooter` — used on sign-in/up/verify.

## Landing kit

Hero, feature grids — marketing page.

## What's needed for each surface to work

1. **Theme CSS** imported in web app (`chat-gpt-kit.css`, `landing-kit.css`).
2. **Props wired** in `chat-page-client.tsx` (callbacks, threads, composer state).
3. **No business logic** in UI package — stays presentational + light interaction.

## Related

- [feat-0024 TECH](./TECH.md)
- [feat-0006](../feat-0006/PRODUCT.md)
