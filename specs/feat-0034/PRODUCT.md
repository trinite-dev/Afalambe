# feat-0034: Full English translation (product chrome)

## Summary

When the user selects **English** via the global locale toggle ([feat-0029](../feat-0029/PRODUCT.md)), **every user-facing product string** in the web app should render in English: marketing copy, auth shells, chat chrome, admin workspace, legal pages, toasts, validation messages, page metadata, and shared UI kit defaults.

**French remains the default** when no preference is stored or when the user selects French.

This spec completes what [feat-0029](../feat-0029/PRODUCT.md) started. It does **not** translate user-authored claim text or change claim/AI language detection ([feat-0014](../feat-0014/PRODUCT.md)).

## Problem

Partial i18n creates a broken experience:

1. Auth **forms** switch to English, but **page titles**, footers, and marketing remain French.
2. Chat **sidebar labels** localize, but **toasts**, **image errors**, and **home empty-state columns** stay French.
3. **Admin** and **legal** surfaces are French-only.
4. **SEO metadata** (`siteDefaultDescription`, `openGraph`) is French-only regardless of locale.
5. FAQ JSON-LD on `/` is always French, which misleads search engines when the user chose English.

Users who pick English still see French on the landing page and in system messages, which undermines trust and contradicts marketing copy about bilingual support.

## Non-goals

- Machine translation of **claim bodies**, AI replies, or reviewer resolution notes.
- **Fula (ff)** product chrome — only `fr` and `en` for UI.
- **RTL** layout.
- Localizing **transactional email** HTML in this feature (track under [feat-0011](../feat-0011/PRODUCT.md); optional phase 4).
- Localizing **tRPC/API error codes** returned as raw English from the server (acceptable if stable; user-visible wrappers must localize).
- URL locale prefixes (`/en/...`) — single URL space with client preference is sufficient for MVP.

## Actors

| Actor | Need |
|-------|------|
| **English-preferring visitor** | Landing, FAQ, and CTAs in English before sign-up. |
| **English-preferring signed-in user** | Auth shells, chat, admin (if role), and legal pages in English. |
| **French-preferring user** | No regression; French copy remains authoritative default. |
| **Reviewer (ADMIN)** | Queue and claim detail UI in English when locale is `en`. |

## Relationship to feat-0029

| feat-0029 | feat-0034 |
|-----------|-----------|
| Locale switcher, `afalambe_locale`, `document.documentElement.lang` | Complete string coverage for `en` |
| `AUTH_MESSAGES`, `CHAT_UI`, verify/reset bundles in `ui-locale.ts` | Extend bundles + extract remaining hardcoded strings |
| Use case UC-I18N01–05 | Use cases UC-EN01–12 below |

Update [feat-0029 PRODUCT](../feat-0029/PRODUCT.md) status to **Partial** when this spec lands; close UC-I18N01/03 when feat-0034 phases 1–3 ship.

## Use case catalog

### Locale behaviour

| ID | Use case | Success criteria | Phase | Status |
|----|----------|------------------|-------|--------|
| **UC-EN01** | Toggle to EN on landing | Hero, features, steps, FAQ, header/footer CTAs render in English | 1 | Not implemented |
| **UC-EN02** | Toggle to EN on auth pages | Page `title`, shell heading, description, footer links in English | 2 | Partial (forms only) |
| **UC-EN03** | Toggle to EN in chat | All chrome, toasts, empty states, verdict labels, composer placeholder in English | 2 | Partial |
| **UC-EN04** | Toggle to EN in admin | Queue list, claim detail, guard loading text in English | 3 | Not implemented |
| **UC-EN05** | Toggle to EN on legal pages | Privacy and terms headings and body in English | 3 | Not implemented |
| **UC-EN06** | Reload preserves English | `localStorage` `afalambe_locale` === `en` restores English on any route | 1 | Implemented |
| **UC-EN07** | `<html lang="en">` when EN active | Matches active locale on client navigations | 1 | Implemented |

### Content and metadata

| ID | Use case | Success criteria | Phase | Status |
|----|----------|------------------|-------|--------|
| **UC-EN08** | English page metadata | `metadata.title` / `description` for auth, chat, admin, legal reflect EN when locale is `en` | 2 | Not implemented |
| **UC-EN09** | English default site description | `siteDefaultDescription` and keywords have EN variants used for OG/Twitter when locale is `en` | 2 | Not implemented |
| **UC-EN10** | FAQ JSON-LD matches visible FAQ | Structured data language aligns with rendered FAQ locale on `/` | 1 | Not implemented |

### Quality

| ID | Use case | Success criteria | Phase | Status |
|----|----------|------------------|-------|--------|
| **UC-EN11** | No French chrome when EN selected | Grep audit: zero hardcoded French strings in `apps/web` client surfaces (allowlist for brand name "Afalambè") | 3 | Not implemented |
| **UC-EN12** | E2E smoke in English | Playwright path: landing toggle → sign-in labels → chat placeholder ([feat-0026](../feat-0026/PRODUCT.md)) | 3 | Not implemented |

## Surface inventory (must translate)

### Phase 1 — Marketing and public chrome

| Surface | Current state | Key files |
|---------|---------------|-----------|
| Landing hero, CTAs | French hardcoded | `(marketing)/page.tsx` |
| Feature grid | French hardcoded | `landing-features.tsx` |
| Steps, bullets, FAQ | French hardcoded | `(marketing)/page.tsx` |
| Site header nav ("Chat", "Connexion", "Commencer") | French in UI kit | `landing-site-header.tsx` (props or i18n) |
| Site footer links | French defaults in UI kit | `landing-site-footer.tsx` |
| Hero chat preview sample messages | French | `landing-hero-chat-preview.tsx` |

### Phase 2 — Auth shells, chat, shared errors

| Surface | Current state | Key files |
|---------|---------------|-----------|
| Auth page metadata + shell copy | French | `sign-in/page.tsx`, `sign-up/page.tsx`, `verify/page.tsx`, `forgot-password/page.tsx`, `reset-password/page.tsx` |
| Password-reset toasts | Inline FR/EN ternary | `request-password-reset-form.tsx` → move to `ui-locale.ts` |
| Chat toasts (image, send, regenerate, clear) | French hardcoded | `chat-page-client.tsx` |
| Chat home empty-state columns | French in `buildHomeColumns` | `chat-page-client.tsx` |
| Image validation errors | French | `image-validation.ts`, `use-copy-to-clipboard.ts` |
| Composer default placeholder / aria | French default | `chat-composer.tsx` (pass from parent or i18n) |
| `languages.ts` prompt suggestions | EN exists; ensure wired | `languages.ts`, chat home |

### Phase 3 — Admin, legal, system pages

| Surface | Current state | Key files |
|---------|---------------|-----------|
| Admin queue + audit log | French | `admin-queue-client.tsx` |
| Admin claim detail + resolve form | French | `admin-claim-detail-client.tsx` |
| Admin guard loading | French | `admin-guard.tsx` |
| Legal privacy / terms | French MVP body | `legal/privacy/page.tsx`, `legal/terms/page.tsx`, `legal-document.tsx` |
| `error.tsx`, `global-error.tsx` | Mixed / English partial | `app/error.tsx`, `app/global-error.tsx` |
| `not-found.tsx` | English (OK) | — |

### Phase 4 — Optional follow-up (out of MVP for this spec)

| Surface | Notes |
|---------|-------|
| Resend email templates | [resend-email-implementation.md](../resend-email-implementation.md) locale policy |
| `User.preferredLocale` sync | UC-I18N05 from feat-0029 |
| `next-intl` route segments | Only if product later needs shareable `/en` URLs |

## Copy principles

1. **Tone:** Plain, professional English; mirror French information density, not word-for-word calques.
2. **Product terms:** Use consistent glossary (claim → claim, dossier → claim/file, file d'attente → review queue, verification des faits → fact-checking).
3. **Brand:** Keep **Afalambè** / **Afalambe** as proper nouns; do not translate.
4. **Accents:** French strings may use ASCII fallbacks where legacy code omitted accents; new EN copy uses standard English spelling.
5. **Enums:** Status codes (`OPEN`, `VERIFIED`) stay as-is in tables; add localized **labels** where shown to end users (admin phase 3).

## Acceptance criteria

1. With `afalambe_locale=en`, a user can complete: landing browse → sign-in → chat submit → (admin) queue review without seeing French product chrome.
2. With `afalambe_locale=fr`, behaviour matches current French experience (no English leakage in chrome).
3. Toggling locale does **not** change `claimLanguage` on existing claims or re-run AI.
4. All strings added for EN have a French counterpart in the same message bundle (parity).
5. UC-EN11 audit passes with documented allowlist (brand name, user content, enum raw values).
6. UC-EN12 Playwright spec passes in CI.

## Delivery phases

| Phase | Scope | Outcome |
|-------|-------|---------|
| **1** | Marketing + JSON-LD + landing kit props | UC-EN01, UC-EN10 |
| **2** | Auth shells, metadata, chat toasts, validation, composer | UC-EN02, UC-EN03, UC-EN08, UC-EN09 |
| **3** | Admin, legal, audit grep, E2E | UC-EN04, UC-EN05, UC-EN11, UC-EN12 |

## Related

- [feat-0034 TECH](./TECH.md)
- [feat-0029](../feat-0029/PRODUCT.md) — locale switcher and partial chrome
- [feat-0014](../feat-0014/PRODUCT.md) — claim language (separate concern)
- [feat-0016](../feat-0016/PRODUCT.md) — marketing landing
- [feat-0017](../feat-0017/PRODUCT.md) — legal pages
- [feat-0028](../feat-0028/PRODUCT.md) — admin UI
- [feat-0026](../feat-0026/PRODUCT.md) — E2E per locale
- [`web.md`](../web.md) FR-W-4
