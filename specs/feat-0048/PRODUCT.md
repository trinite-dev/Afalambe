# feat-0048: Language experience for primary users (FR/EN chrome + claim languages)

## Summary

Close the remaining **trust and accessibility** gaps for Afalambe’s primary audience: people who use **French or English product chrome** (`/` vs `/en/*`) and submit claims in **French, English, or Fula**.

Much of feat-0029 / feat-0034 / feat-0014 / feat-0015 is already in the codebase but **incomplete or mis-documented**. This feat is the completion slice: wire real per-language AI prompts, stop forcing French on voice when the UI is English, keep API keys server-only, and stop French UI-kit defaults from leaking into EN routes.

**Status:** Implemented — see [TECH](./TECH.md).

## Assumptions

1. Product chrome locales remain **`fr` | `en`** via URL (`/` FR, `/en/*` EN). Claim content languages remain **`fr` | `ff` | `en`**.
2. Legal pages already have EN bodies in code; we treat “legal still French” as **stale** unless a route still renders FR on `/en/legal/*`.
3. Browser Whisper + `NEXT_PUBLIC_OPENAI_API_KEY` is **already removed**; we document that and lock it with acceptance tests / env contract.
4. OpenAI Whisper does **not** reliably accept ISO code `ff` (Fula) — Fula voice uses **auto-detect** (omit language) rather than forcing French.
5. Full lawyer-reviewed legal copy (feat-0017) and `User.preferredLocale` remain **out of scope**.
6. Localizing **every** tRPC French error string is phased: this feat **must** fix voice + high-traffic claim errors used in chat; remaining auth/admin FR messages can follow.

→ Correct any assumption before treating acceptance criteria as closed.

## Problem

| Gap | User impact |
|-----|-------------|
| Per-language system prompts defined in web (`LANGUAGE_SYSTEM_PROMPTS`) but **never used** by the API | EN/Fula users get a generic English system prompt; response language is only a soft instruction |
| Empty composer → Whisper always `fr` | On `/en/chat`, dictation biases French |
| Specs still warn about browser OpenAI keys | Operators may reintroduce `NEXT_PUBLIC_OPENAI_*` |
| `@afalambe/ui` chat defaults are French | Any missed prop on EN chrome shows FR strings (trust/accessibility) |
| Transcription tRPC errors always French | EN users see “Impossible de transcrire…” |
| feat-0029/0034 PRODUCT checkboxes stale | Planning noise; real gaps unclear |

## Goals

1. **Wire claim-language system prompts** into every assistant generation path (FACT_CHECK, FOLLOW_UP, META, OFF_TOPIC) using shared `@afalambe/ai` helpers — not web-only constants.
2. **Voice follows UI + claim context** — empty composer uses **UI locale** (`en` on `/en/*`, `fr` on `/`); Fula maps to Whisper auto-detect; never require a browser AI key.
3. **No public OpenAI key** — env examples and docs forbid `NEXT_PUBLIC_OPENAI_*`; transcription stays on server `AI_API_KEY`.
4. **UI-kit defaults are language-neutral** (English fallback or empty) so omitted props do not French-leak EN chrome; chat continues to pass localized props.
5. **Voice/chat error copy** respects EN when the Whisper language hint / UI locale is English.
6. **Specs truth** — update feat-0015 / 0029 / 0034 statuses; index feat-0048.

## Non-goals

- Translating transactional emails (feat-0011).
- Adding Arabic or next-intl.
- Lawyer sign-off of legal copy (feat-0017).
- Persisting `User.preferredLocale` (I18N UC-I18N13).
- Full audit of every French tRPC string outside chat/voice (follow-up).
- Changing Fula **claim** support or franc detection thresholds beyond voice hint mapping.

## Actors

| Actor | Change |
|-------|--------|
| Claimant (FR chrome) | Unchanged FR chrome; prompts reinforce French replies when claim is FR |
| Claimant (EN chrome) | EN chrome stays EN; voice defaults to English; EN failure/voice errors |
| Claimant (Fula claim text) | Assistant system prompt uses Fula instructions; Whisper auto-detect |
| Operator | Clear env: never put OpenAI keys in `NEXT_PUBLIC_*` |

## Use cases

### A. AI language fidelity

| ID | Use case | Main flow | Postcondition |
|----|----------|-----------|---------------|
| **UC-L01** | FR claim fact-check | `claimLanguage=fr` | System prompt includes French language block; reply expected in FR |
| **UC-L02** | EN claim fact-check | `claimLanguage=en` | English language block wired |
| **UC-L03** | Fula claim | `claimLanguage=ff` | Fula language block wired |
| **UC-L04** | META / OFF_TOPIC / FOLLOW_UP | Same claim language | Language block still prepended / embedded |

### B. Voice

| ID | Use case | Main flow | Postcondition |
|----|----------|-----------|---------------|
| **UC-V01** | Mic on `/en/chat` with empty composer | Transcribe | Whisper language hint `en` (not `fr`) |
| **UC-V02** | Mic on `/chat` with empty composer | Transcribe | Hint `fr` |
| **UC-V03** | Composer has English text | Transcribe | Hint `en` via detection |
| **UC-V04** | Detected/claimed Fula | Transcribe | No forced `ff`/`fr`; provider auto-detect |
| **UC-V05** | Transcription failure on EN UI | Error toast/message | English copy |
| **UC-V06** | No browser OpenAI key | Inspect env + client bundle contract | Transcription uses server only |

### C. Chrome leakage

| ID | Use case | Main flow | Postcondition |
|----|----------|-----------|---------------|
| **UC-C01** | EN chat with all props | `/en/chat` | No FR composer/sidebar defaults visible |
| **UC-C02** | UI kit without labels | Story/default render | Defaults are EN or empty — not FR |
| **UC-C03** | `/en/legal/terms` | Open page | English legal body (regression) |

## Acceptance criteria

1. `getSystemPrompt` / language blocks live in `@afalambe/ai` and are used by `create-trpc-context` for assistant generation.
2. Empty-composer Whisper on EN routes sends `en`; FR routes send `fr`; Fula never sends invalid `ff` to OpenAI as a hard language code.
3. `apps/web/.env.example` and `docs/env/README.md` state transcription is server-only; no `NEXT_PUBLIC_OPENAI_API_KEY` template.
4. Chat composer/sidebar UI-kit default strings are not French.
5. `claim.transcribeAudio` unavailable/failure messages are English when the request language hint is `en`.
6. Unit tests cover language prompt resolution + Whisper hint mapping.
7. Specs README lists feat-0048; related feat statuses no longer claim “browser OpenAI key” as current code.

## Related

- [feat-0014](../feat-0014/PRODUCT.md) claim language detection
- [feat-0015](../feat-0015/PRODUCT.md) voice (refresh)
- [feat-0029](../feat-0029/PRODUCT.md) / [feat-0034](../feat-0034/PRODUCT.md) UI i18n
- [I18N_SPEC](../I18N_SPEC.md) / [I18N_ROUTED_SPEC](../I18N_ROUTED_SPEC.md)
- [feat-0031](../feat-0031/PRODUCT.md) AI phases (prompt wiring)
- [feat-0027](../feat-0027/PRODUCT.md) secrets
