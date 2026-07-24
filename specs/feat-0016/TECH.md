# feat-0016: Tech Spec — Marketing

## Layout

[`apps/web/app/(marketing)/layout.tsx`](../../apps/web/app/(marketing)/layout.tsx) — shared chrome, theme toggle.

## Site config

[`apps/web/lib/site.ts`](../../apps/web/lib/site.ts) — name, description, logo paths, JSON-LD `inLanguage: ['fr', 'en']`.

## Env

`NEXT_PUBLIC_APP_URL`, `VERCEL_ENV` (indexing).

## Auth links

Standard Next `Link` to `/sign-up`, `/sign-in`.

## Related

- [feat-0018 TECH](../feat-0018/TECH.md) — SEO
- [feat-0019 TECH](../feat-0019/TECH.md) — theme
