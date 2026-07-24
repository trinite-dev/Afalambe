# feat-0029: UI internationalisation (FR/EN chrome)

## Summary

**Product chrome** (navigation, buttons, labels, toasts) should support **French and English** per [`web.md`](../web.md) FR-W-4. **Claim text** is not auto-translated. This is **separate** from [feat-0014](../feat-0014/PRODUCT.md) (claim language detection for AI).

## Problem

The app is **French-hardcoded** while FAQ claims FR+EN UI. Users cannot switch interface language.

## Non-goals

- Machine translation of user claims.
- RTL layout (unless later required).
- Localizing email templates to English in MVP (can remain French).

## First-time user (target)

1. Browser `Accept-Language` or explicit picker on first visit.
2. Choice stored in `localStorage` key `afalambe_locale` and optionally `User.preferredLocale` after login.
3. `<html lang>` updates to `fr` or `en`.

## Returning user (target)

1. Stored preference applied on load.
2. Language switcher in chat sidebar or account settings.
3. Auth pages respect same locale.

## Use case catalog

| ID | Use case | Status |
|----|----------|--------|
| **UC-I18N01** | Switch UI to English | **Not implemented** |
| **UC-I18N02** | French default when no preference | **De facto** (hardcoded) |
| **UC-I18N03** | Use `getUILabel(lang, key)` for chat strings | **Not wired** ([`languages.ts`](../../apps/web/lib/languages.ts)) |
| **UC-I18N04** | E2E in French and English | **Not implemented** |
| **UC-I18N05** | Persist locale on User profile | **Not implemented** |

## Implementation options

| Option | Pros | Cons |
|--------|------|------|
| **A. `next-intl`** | App Router idiomatic | New dependency |
| **B. Wire `languages.ts` UI_LABELS** | Already have ff/fr/en labels | No routing/ICU |
| **C. JSON resource files** | Standard i18n | Extraction effort |

**Default:** Option A or C for FR/EN chrome; keep feat-0014 for claim/AI language.

## Acceptance criteria

1. Sign-in, sign-up, chat composer placeholder available in FR and EN.
2. Language switch does not change `claimLanguage` on existing claims.
3. `layout.tsx` `lang` attribute matches active locale.
4. Full EN coverage tracked in [feat-0034](../feat-0034/PRODUCT.md).

## Related

- [feat-0029 TECH](./TECH.md)
- [feat-0014](../feat-0014/PRODUCT.md) — claim language
