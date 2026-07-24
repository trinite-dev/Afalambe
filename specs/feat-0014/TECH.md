# feat-0014: Tech Spec — Multilingual

## Modules

- [`apps/web/lib/language-detection.ts`](../../apps/web/lib/language-detection.ts) — `franc`, browser lang
- [`apps/web/lib/languages.ts`](../../apps/web/lib/languages.ts) — prompts, labels, suggestions (mostly unused in UI)

## Claim integration

[`chat-page-client.tsx`](../../apps/web/components/chat-page-client.tsx):

```ts
const detectedLang = text ? detectLanguageFromText(text) : 'fr';
metadata: { claimLanguage: detectedLang, ... }
```

## API

Claim metadata in system prompt — [`apps/api/src/index.ts`](../../apps/api/src/index.ts).

## Prisma

`Claim.claimLanguage` — default `"fr"`.

## Gaps

| Item | Location |
|------|----------|
| UI labels French only | chat-page-client, auth forms |
| FAQ claims EN UI | marketing page vs reality |
| No `User.preferredLanguage` | schema |

## Related

- [feat-0015](../feat-0015/PRODUCT.md) — voice hardcoded `fr`
