# feat-0014: Multilingual claims and language detection

## Summary

Afalambe supports claim text in **French**, **Fula/Peul** (`ff`), and **English**. On **new claim create**, text is analyzed with **`franc`** and stored as **`claimLanguage`**. The AI is instructed to respond in the claim language. **App UI** remains largely **French-hardcoded**; there is **no language switcher** today.

## Supported languages

| Code | Label |
|------|-------|
| `fr` | Francais |
| `ff` | Pulaar / Fulfulde |
| `en` | English |

Config: [`apps/web/lib/languages.ts`](../../apps/web/lib/languages.ts).

## First-time user

1. Lands on French marketing and auth UI.
2. Submits first claim in any supported script.
3. `detectLanguageFromText` sets `claimLanguage` on the claim.
4. AI reply follows claim language via API system prompt context.

## Returning user

1. Same French UI on return.
2. **Each new thread** re-detects language from first message.
3. **Existing threads** show `Langue: {code}` in metadata header.
4. No account-level `preferredLanguage` persisted.

## Detection hierarchy (implemented, partially used)

[`detectUserLanguage`](../../apps/web/lib/language-detection.ts): audio > text > browser > default (`fr`).

**Actually wired:** only `detectLanguageFromText` on `claim.create` in chat.

## Planned (not wired)

- `getUILabel` / `getPromptSuggestions` for localized chat chrome.
- `getSystemPrompt` per language in API (generic multilingual prompt used instead).
- Browser language fallback on empty text.
- Whisper language from `WHISPER_LANGUAGE_CODES`.

## Use case catalog

| ID | Use case | Status |
|----|----------|--------|
| **UC-LG01** | Detect from claim text | Implemented |
| **UC-LG02** | Default `fr` for image-only new claim | Implemented |
| **UC-LG03** | User selects UI language | **Not implemented** |
| **UC-LG04** | Persist language preference on User | **Not implemented** |

## Related

- [feat-0014 TECH](./TECH.md)
- [`web.md`](../web.md) — locale requirements
