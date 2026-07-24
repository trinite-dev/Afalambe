# feat-0019: Theme (light / dark mode)

## Summary

Users toggle **light** and **dark** themes via `next-themes` (class on `html`). Toggle appears on marketing, auth, and chat surfaces.

## Behavior

- Default: **system** preference.
- Persistence: browser/local via `next-themes`.
- Chat and landing use CSS variables in `@afalambe/ui` kits.

## Components

- [`apps/web/components/theme-provider.tsx`](../../apps/web/components/theme-provider.tsx)
- [`apps/web/components/theme-toggle.tsx`](../../apps/web/components/theme-toggle.tsx)

## Related

- [feat-0019 TECH](./TECH.md)
