# feat-0048: Tech Spec — Language experience

## Files

```text
specs/feat-0048/PRODUCT.md
specs/feat-0048/TECH.md
packages/ai/src/claim-language.ts          # NEW: prompts + whisper hint + resolve
packages/ai/src/claim-language.test.ts     # NEW
packages/ai/src/index.ts                   # export
apps/web/lib/languages.ts                  # re-export prompts from @afalambe/ai/claim-language
packages/api-runtime/src/create-trpc-context.ts
packages/api-runtime/src/ai-provider.ts    # optional language (omit for auto)
packages/trpc/src/routers/claim.ts         # transcribe errors + optional language
apps/web/components/chat-page-client.tsx   # whisper hint from UI locale
packages/ui/.../chat-composer.tsx          # EN defaults
packages/ui/.../chat-sidebar.tsx           # EN defaults
packages/ui/.../chat-top-bar.tsx           # EN defaults
docs/env/README.md
apps/web/.env.example
specs/README.md
```

## 1. Shared claim-language module (`@afalambe/ai`)

```ts
export type ClaimLanguage = 'fr' | 'ff' | 'en';

export function resolveClaimLanguage(raw?: string | null): ClaimLanguage
// unknown → 'fr'

export function getLanguageSystemPrompt(language: ClaimLanguage): string
// fr / ff / en blocks (moved from apps/web/lib/languages.ts)

export function whisperLanguageHint(input: {
  composerText: string;
  uiLocale: 'fr' | 'en';
  detect: (text: string) => ClaimLanguage; // inject franc wrapper from web
}): string | undefined
// empty composer → uiLocale
// detected ff → undefined (auto)
// else ISO whisper code fr|en
```

Web `languages.ts` keeps `LANGUAGES`, `PROMPT_SUGGESTIONS`, `UI_LABELS`, `detect` helpers, and re-exports `getSystemPrompt` → `getLanguageSystemPrompt`.

## 2. API prompt wiring

In `generateAssistantText`, for every intent:

```ts
const lang = resolveClaimLanguage(claim.claimLanguage);
const languageBlock = getLanguageSystemPrompt(lang);

const systemPrompt = `${languageBlock}

You are Afalambe's … (intent-specific rules)
Claim metadata:
${claimContext}
…`;
```

Keep evidence block for FACT_CHECK. Soft “respond in user’s language” lines stay as reinforcement, not the only mechanism.

## 3. Voice

### Client (`chat-page-client`)

```ts
function whisperLanguageCode(text: string, uiLocale: UiLocale): string | undefined {
  return whisperLanguageHint({
    composerText: text,
    uiLocale,
    detect: detectLanguageFromText,
  });
}
// mutateAsync({ …, language: hint })  // omit or pass only when defined
```

### tRPC

- `language: z.string().min(2).max(10).optional()` (no default `fr`)
- Error messages:

```ts
const en = input.language === 'en';
message: en ? 'Voice transcription is unavailable.' : 'La transcription vocale est indisponible.';
```

### Provider

- OpenAI: append `language` only when provided and not `auto`
- Gemini: if no language, prompt “Transcribe this audio. Return only the transcript.”

## 4. UI-kit defaults

Replace French default strings in composer / sidebar / top-bar with **English** fallbacks (chrome apps must still pass localized props). Document in TECH that FR product chrome always passes `CHAT_UI.fr`.

## 5. Secrets / docs

- Confirm no `NEXT_PUBLIC_OPENAI` in examples
- `docs/env/README.md`: transcription = server `AI_API_KEY` only; do not add browser keys

## 6. Verification

```bash
pnpm --filter @afalambe/ai test
pnpm --filter @afalambe/ai typecheck
pnpm --filter @afalambe/api-runtime typecheck
pnpm --filter @afalambe/trpc typecheck
pnpm --filter @afalambe/web typecheck
pnpm --filter @afalambe/ui typecheck
```

Manual: `/en/chat` empty mic → network payload language `en`; `/en/legal/terms` English body.

## Out of scope here

- Mass rewrite of auth/admin TRPC French messages
- Email localization
- User.preferredLocale column
