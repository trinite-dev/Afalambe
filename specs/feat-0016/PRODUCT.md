# feat-0016: Marketing landing and public site

## Summary

The **public marketing site** at `/` explains Afalambe (fact-checking for Africa), features, steps, FAQ, and CTAs to **sign up**. Built with Next.js App Router and `@afalambe/ui` landing kit.

## Problem

Prospective users need trust, language positioning, and a path to registration before auth.

## Routes

| Path | Purpose |
|------|---------|
| `/` | Hero, features, steps, FAQ, CTA |
| `/demo` | Public scripted chat preview ([feat-0035](../feat-0035/PRODUCT.md)) — FR `/demo`, EN `/en/demo` |
| `/sign-in`, `/sign-up` | Auth entry (separate feature specs) |

## Key content claims

- Multilingual claim input (fr, ff, en).
- Human queue when AI uncertain — **product copy**; backend queue stub (feat-0020).
- Not legal advice disclaimer in FAQ.

## Components

- [`apps/web/app/(marketing)/page.tsx`](../../apps/web/app/(marketing)/page.tsx)
- [`apps/web/components/landing-features.tsx`](../../apps/web/components/landing-features.tsx)
- [`packages/ui/src/components/landing/**`](../../packages/ui/src/components/landing/)

## Related

- [feat-0016 TECH](./TECH.md)
- [`landing-page.md`](../landing-page.md)
- [`program.md`](../program.md)
