# feat-0036: Localized landing navigation links

## Summary

All **in-app navigation links** on the marketing landing page must preserve the user's **URL locale**. A visitor on `/en` who clicks **Chat** must land on `/en/chat`, not `/chat`. French visitors on `/` continue to use unprefixed paths (`/chat`).

Depends on [I18N_ROUTED_SPEC](../I18N_ROUTED_SPEC.md) and [feat-0016](../feat-0016/PRODUCT.md).

## Problem

The landing header hardcodes `href="/chat"` in the shared UI kit while sign-in and sign-up CTAs already use locale-aware paths from the web app. English users lose their locale when opening chat from the landing nav, which breaks shareable URLs and mixes French routing with English chrome expectations.

## Goals

| Goal | Detail |
|------|--------|
| **Locale-preserving chat** | `/en` → Chat → `/en/chat`; `/` → Chat → `/chat` |
| **Consistent landing chrome** | Brand home, chat, sign-in, and sign-up links all follow the same locale rules |
| **Kit stays locale-agnostic** | `@afalambe/ui` landing components accept `href` props; web app supplies localized paths |

## Non-goals

- Localizing hash anchor links (`#how`, `#faq`) — same on both locales
- Changing claim-language detection ([feat-0014](../feat-0014/PRODUCT.md))
- Adding `/fr` prefix routes

## Actors

| Actor | Action |
|-------|--------|
| **Visitor (FR)** | Opens `/`, clicks Chat → `/chat` |
| **Visitor (EN)** | Opens `/en`, clicks Chat → `/en/chat` |
| **Visitor (EN)** | Clicks brand logo on `/en` → stays on `/en` |

## Use cases

### UC-LN01 — English chat from landing

**Given** the user is on `/en`  
**When** they click **Chat** in the header nav  
**Then** the browser navigates to `/en/chat`

### UC-LN02 — French chat from landing

**Given** the user is on `/`  
**When** they click **Chat** in the header nav  
**Then** the browser navigates to `/chat`

### UC-LN03 — English brand home

**Given** the user is on `/en`  
**When** they click the brand logo  
**Then** the browser navigates to `/en` (not `/`)

### UC-LN04 — Existing localized CTAs unchanged

**Given** the user is on `/en`  
**When** they click **Sign in** or **Get started**  
**Then** they navigate to `/en/sign-in` or `/en/sign-up` respectively (already implemented)

## Acceptance criteria

- [ ] `LandingSiteHeader` does not hardcode `/chat`
- [ ] `LandingPageClient` passes `chatNavHref={href('/chat')}` and `brandHref={href('/')}` to header and footer
- [ ] E2E: `/en` chat link `href` is `/en/chat`
- [ ] E2E: `/` chat link `href` is `/chat`
- [ ] Typecheck passes for `@afalambe/ui` and `@afalambe/web`

## Related

- [feat-0036 TECH](./TECH.md)
- [I18N_ROUTED_SPEC](../I18N_ROUTED_SPEC.md) §4.1, §5.1
- [feat-0029](../feat-0029/PRODUCT.md) — UI locale chrome
