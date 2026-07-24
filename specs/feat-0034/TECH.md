# feat-0034: Tech Spec — Full English translation

## Architecture

### Message layer (extend feat-0029)

Keep **`apps/web/lib/ui-locale.ts`** as the primary bundle for product chrome until string count justifies extraction to JSON or `next-intl`.

Add namespaces:

| Export | Covers |
|--------|--------|
| `LANDING_UI` | Hero, steps, bullets, FAQ, header/footer CTA labels |
| `AUTH_PAGES` | Shell titles, descriptions, footer prompts (per route) |
| `CHAT_TOASTS` | Image, send, regenerate, clear-selection errors |
| `ADMIN_UI` | Queue, detail, guard, audit section |
| `LEGAL_UI` | Section titles and body paragraphs (MVP legal copy) |
| `COMMON_UI` | Loading, generic errors, image read failure |
| `REQUEST_RESET_MESSAGES` | Move inline strings from `request-password-reset-form.tsx` |

Existing: `AUTH_MESSAGES`, `VERIFY_MESSAGES`, `RESET_PASSWORD_MESSAGES`, `CHAT_UI`.

Helper pattern:

```ts
export function tUi(locale: UiLocale, bundle: Record<UiLocale, T>, key: keyof T): string
```

Client components: `const { locale } = useUiLocale()` then `CHAT_UI[locale].placeholder`.

### Marketing page (server → client split)

`(marketing)/page.tsx` is a **Server Component** with French constants today. Options:

| Option | Recommendation |
|--------|----------------|
| **A. `LandingPageClient` wrapper** | Read locale from `useUiLocale`, pass translated props to landing kit | **Default for phase 1** |
| **B. Cookie + server `headers()`** | Set `afalambe_locale` cookie on toggle; server reads for metadata | Phase 2 for UC-EN08/09 on `/` |
| **C. `next-intl`** | Full framework | Defer unless routing requirements grow |

Phase 1 implementation sketch:

1. `apps/web/lib/landing-content.ts` — `getLandingContent(locale: UiLocale)` returns steps, bullets, faq, hero strings.
2. `apps/web/components/landing-page-client.tsx` — `'use client'`, calls hook, renders existing landing kit.
3. `page.tsx` — thin server shell exporting metadata (French default until cookie work).

### Landing UI kit (`packages/ui`)

Prefer **props over hooks** in shared UI package (no `useUiLocale` in `@afalambe/ui`).

| Component | Change |
|-----------|--------|
| `landing-site-header.tsx` | Accept `signInLabel`, `chatLabel`, `primaryCtaLabel` (defaults remain French for backward compat until callers pass EN) |
| `landing-site-footer.tsx` | Accept localized link labels if not already prop-driven |
| `landing-hero-chat-preview.tsx` | Accept optional `messages: { user: string; assistant: string }[]` |
| `chat-composer.tsx` | Already accepts `placeholder`; remove French default or set `placeholder` required at call site |

### Auth pages

Each auth `page.tsx` exports static `metadata` (French). For UC-EN08:

| Approach | Notes |
|----------|-------|
| **`generateMetadata` + cookie** | Read `afalambe_locale` cookie; return EN titles when `en` |
| **Client-only document title** | `useEffect` sets `document.title` — weaker for SEO; avoid for auth indexable pages |

Target: `generateMetadata` with cookie set in `persistUiLocale` (phase 2).

Shell copy (`AuthPageShell` `title`, `description`, footer) moves to `AUTH_PAGES.signIn`, etc., consumed by a small client wrapper or duplicated server/client bundles keyed by cookie.

### Chat

| File | Work |
|------|------|
| `chat-page-client.tsx` | Replace hardcoded toasts with `CHAT_TOASTS[locale]`; `buildHomeColumns` reads from `LANDING_UI` or new `CHAT_HOME_UI` |
| `use-copy-to-clipboard.ts` | Accept `copyFailedMessage` or import `CHAT_UI[locale].copyFailed` via hook |
| `image-validation.ts` | Return error **codes** (`IMAGE_UNREADABLE`) mapped to localized strings at call site |

### Admin

New `ADMIN_UI` in `ui-locale.ts`. Wire `admin-queue-client.tsx`, `admin-claim-detail-client.tsx`, `admin-guard.tsx`.

Optional: `formatStatusLabel(locale, status)` for human-readable status/verdict labels alongside raw enum display.

### Legal

`LegalDocument` already accepts structured sections. Add `getLegalPrivacyContent(locale)` / `getLegalTermsContent(locale)` in `apps/web/lib/legal-content.ts` (or nested under `ui-locale.ts` if small).

English copy is **provisional** same as French until legal review ([feat-0017](../feat-0017/PRODUCT.md)).

### SEO and site config

[`apps/web/lib/site.ts`](../../apps/web/lib/site.ts):

```ts
export const siteDescriptions: Record<UiLocale, string> = { fr: '...', en: '...' }
export const siteKeywords: Record<UiLocale, string[]> = { ... }
export function getSiteDescription(locale: UiLocale): string
```

JSON-LD on landing: build `faqJsonLd` from the same `getLandingContent(locale)` as visible FAQ (UC-EN10).

[`site.ts`](../../apps/web/lib/site.ts) `buildJsonLd()` — add `inLanguage: locale` when cookie-aware.

### Locale persistence enhancement (phase 2)

Extend `persistUiLocale`:

```ts
document.cookie = `afalambe_locale=${locale};path=/;max-age=31536000;SameSite=Lax`
```

Server `generateMetadata` reads cookie via `cookies()` from `next/headers`.

### Grep audit (UC-EN11)

Script or CI step:

```bash
# Example: flag common French words in apps/web (tune allowlist)
rg -n "Connexion|Dossier|Verifiez|Effacer|Chargement" apps/web --glob '*.tsx'
```

Exclude: `ui-locale.ts`, `legal-content.ts`, `landing-content.ts`, comments, tests.

### Testing

| Test | Location |
|------|----------|
| Bundle parity | `ui-locale.test.ts` — every `en` key exists in `fr` for each export |
| Landing content | `landing-content.test.ts` — FAQ count matches between locales |
| E2E UC-EN12 | `apps/web/e2e/locale-en.spec.ts` — set `localStorage` `afalambe_locale=en`, assert EN strings |

Reference [feat-0026 TECH](../feat-0026/TECH.md).

## File map (implementation order)

### Phase 1

| Action | File |
|--------|------|
| Add | `apps/web/lib/landing-content.ts` |
| Add | `apps/web/components/landing-page-client.tsx` |
| Edit | `apps/web/app/(marketing)/page.tsx` |
| Edit | `packages/ui/src/components/landing/landing-site-header.tsx` |
| Edit | `packages/ui/src/components/landing/landing-hero-chat-preview.tsx` |

### Phase 2

| Action | File |
|--------|------|
| Edit | `apps/web/lib/ui-locale.ts` — `AUTH_PAGES`, `CHAT_TOASTS`, `REQUEST_RESET_MESSAGES`, `COMMON_UI` |
| Edit | Auth `page.tsx` files + optional `generateMetadata` |
| Edit | `apps/web/lib/site.ts` |
| Edit | `apps/web/components/chat-page-client.tsx` |
| Edit | `apps/web/hooks/use-copy-to-clipboard.ts` |
| Edit | `apps/web/lib/image-validation.ts` + callers |
| Edit | `apps/web/hooks/use-ui-locale.ts` — cookie sync |

### Phase 3

| Action | File |
|--------|------|
| Edit | `apps/web/lib/ui-locale.ts` — `ADMIN_UI` |
| Edit | `admin-*.tsx` components |
| Add | `apps/web/lib/legal-content.ts` |
| Edit | `legal/privacy/page.tsx`, `legal/terms/page.tsx` |
| Add | `apps/web/e2e/locale-en.spec.ts` |

## Known gaps after feat-0034

| Gap | Spec |
|-----|------|
| Email templates EN | feat-0011 |
| `User.preferredLocale` | feat-0029 UC-I18N05 |
| Shareable `/en` URLs | Future |
| ICU plurals (`{count} dossier(s)`) | Use `Intl.PluralRules` or simple EN/FR branches in bundles |

## Related

- [feat-0034 PRODUCT](./PRODUCT.md)
- [feat-0029 TECH](../feat-0029/TECH.md)
- [feat-0018 TECH](../feat-0018/TECH.md) — `html lang`, metadata
