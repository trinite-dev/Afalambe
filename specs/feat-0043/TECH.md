# feat-0043: Tech Spec — Message intent detection

## Files

```text
specs/feat-0043/PRODUCT.md
specs/feat-0043/TECH.md
packages/ai/src/classify-message-intent.ts
packages/ai/src/classify-message-intent.test.ts
packages/ai/src/index.ts
packages/trpc/src/types.ts                 # generateAssistantText({ intent })
packages/trpc/src/routers/claim.ts         # gate lifecycle by intent
apps/api/src/index.ts                      # prompt/retrieval by intent
apps/web/lib/demo-scenarios.ts             # use classifier for unmatched/meta
apps/web/hooks/use-demo-session.ts         # pass hasPriorAssistant
```

## Classifier API

```ts
type ChatMessageIntent = 'FACT_CHECK' | 'FOLLOW_UP' | 'META' | 'OFF_TOPIC'

classifyMessageIntent(input: {
  text: string
  hasPriorAssistant: boolean
}): { intent: ChatMessageIntent; confidence: 'high' | 'medium' | 'low' }
```

### Priority (first strong match wins)

1. **META** — product / process keywords (afalambe, fact-?check(ing)?, comment ca marche, how does, qu'est-ce que la verification, …)
2. **FOLLOW_UP** — only if `hasPriorAssistant` and clarification patterns (pourquoi, why, explain, sources?, preciser, what does that mean, …) **or** short interrogative without new claim markers
3. **FACT_CHECK** — verify / est-ce vrai / dementi / claim-like length with assertion cues
4. **OFF_TOPIC** — greetings-only, weather, jokes, or low-signal text with no claim cues
5. Default: **FACT_CHECK** when text is substantial; **OFF_TOPIC** when tiny/empty

## API generation

`generateAssistantText({ claim, thread, intent })`:

| Intent | Retrieval | System prompt | Notes |
|--------|-----------|---------------|-------|
| FACT_CHECK | Yes | Existing fact-check prompt | Unchanged |
| FOLLOW_UP | No | Answer about prior thread analysis; do not issue a new verdict label | Use thread history |
| META | No | Explain Afalambe / fact-checking; invite a claim | Short |
| OFF_TOPIC | No | Redirect to paste a claim to verify | Short |

## Claim router lifecycle

Capture `previousStatus` / `previousFactCheckStatus` / `previousFactCheckDate` before `PROCESSING`.

| Intent | parseVerdict | Update factCheckStatus | Footer | Resolved email | Final status |
|--------|--------------|------------------------|--------|----------------|--------------|
| FACT_CHECK | Yes | Yes if verdict | Yes | Yes on success | RESOLVED / FAILED |
| FOLLOW_UP | No | Keep previous | Optional reuse previous fields only | No | Restore previous (or RESOLVED if had verdict) |
| META / OFF_TOPIC | No | Keep previous | No | No | Restore previous (OPEN if new thread) |

## Demo

`matchDemoScenario(locale, text, { hasPriorAssistant })`:

1. Existing D1–D5 / example-line matching first (claims)
2. Else `classifyMessageIntent` → scripted META / FOLLOW_UP / OFF_TOPIC replies (FR/EN)
3. Else UNMATCHED guidance

## Testing

| Case | Expect |
|------|--------|
| “Est-ce vrai que le FMI…” | FACT_CHECK |
| After assistant: “Pourquoi ce verdict ?” | FOLLOW_UP |
| “Comment fonctionne Afalambe ?” | META |
| “Hello” / “What’s the weather?” | OFF_TOPIC |

## Verification

```bash
pnpm --filter @afalambe/ai test
pnpm --filter @afalambe/trpc typecheck
pnpm --filter @afalambe/web typecheck
```
