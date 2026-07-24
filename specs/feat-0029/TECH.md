# feat-0029: Tech Spec — UI i18n

## Files to internationalise (priority)

| Area | Files |
|------|-------|
| Auth | `sign-in-form.tsx`, `sign-up-form.tsx`, `verify-email-form.tsx`, password reset forms |
| Chat | `chat-page-client.tsx` (VERDICT_LABELS, homeColumns, toasts) |
| Marketing | `(marketing)/page.tsx` FAQ (optional phase 2) |
| API toasts | `api-toast.ts` callers pass localized strings |

## Existing assets

[`apps/web/lib/languages.ts`](../../apps/web/lib/languages.ts) — `UI_LABELS`, `PROMPT_SUGGESTIONS` for `fr` | `ff` | `en` (Fula labels exist for future).

## Schema (target)

```prisma
// User.preferredLocale String?  // 'fr' | 'en'
```

## SEO

[`apps/web/lib/site.ts`](../../apps/web/lib/site.ts) `inLanguage: ['fr', 'en']` — align with implemented locales.

## Related

- [feat-0026 TECH](../feat-0026/TECH.md) — E2E per locale
- [feat-0018 TECH](../feat-0018/TECH.md) — `html lang`
- [feat-0034 TECH](../feat-0034/TECH.md) — full EN translation scope
