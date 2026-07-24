# feat-0039: Tech Spec — Demo scenario matching

## Status

**Implement now.** Depends on [feat-0035](../feat-0035/TECH.md) demo route (already in repo) and [feat-0038](../feat-0038/PRODUCT.md) home examples.

## Root cause

| File | Issue |
|------|-------|
| [`demo-page-client.tsx`](../../apps/web/components/demo-page-client.tsx) | Home examples from `getPromptSuggestions` / `HOME_EXAMPLE_CLAIMS` |
| [`demo-scenarios.ts`](../../apps/web/lib/demo-scenarios.ts) | Scenarios S1–S3 unrelated to those claims; `matchDemoScenario` falls back to S3 |

## Design

### `demo-scenarios.ts`

Replace S1–S3 with **D1–D4** (+ optional **D5**, + **UNMATCHED**):

```ts
type DemoScenarioId = 'D1' | 'D2' | 'D3' | 'D4' | 'D5' | 'UNMATCHED';

type DemoScenario = {
  id: DemoScenarioId;
  corpusId?: 'AFA-001' | 'AFA-002' | 'AFA-004' | 'AFA-008';
  exampleLine: string; // shown in home; empty for UNMATCHED
  triggers: string[];
  assistantReply: string;
  factCheckStatus?: DemoFactCheckStatus; // omit for UNMATCHED
  claimMetadata: DemoScenarioClaimMetadata;
};
```

**Matching order:**

1. Normalize (lowercase; strip combining accents).
2. Exact / containment match against each scenario `exampleLine` (skip UNMATCHED / empty).
3. Score = count of trigger tokens found in normalized user text; pick highest score if `score >= 1` (prefer longer triggers when ties).
4. Else return **UNMATCHED** guidance scenario for the active locale.

**Do not** use broad triggers like bare `verify` / `source` / `verifier` for D5; use distinctive phrases (`rumeur sans source`, `no clear source`, `unverifiable`).

### `demo-page-client.tsx`

- Build examples column from `getDemoScenarios(locale).filter(s => s.exampleLine)` — not `getPromptSuggestions`.
- Show verdict badge only when `factCheckStatus` is set.
- Keep capabilities / limitations columns from `CHAT_HOME_UI`.

### Copy source

Paraphrase `_data/fact-checks/corpus.json` entries AFA-001, 002, 004, 008. Example lines must stay in sync with [`home-examples.ts`](../../apps/web/lib/home-examples.ts) FR/EN strings (or import those strings as `exampleLine` to avoid drift).

Preferred: import `HOME_EXAMPLE_CLAIMS` and map by `corpusId` so one source owns the prompt text.

### Tests

[`demo-scenarios.test.ts`](../../apps/web/lib/demo-scenarios.test.ts):

- Each `HOME_EXAMPLE_CLAIMS` FR/EN line → expected D* id and non-UNMATCHED
- Keyword packs for D1–D4
- Unrelated text → `UNMATCHED` and reply **does not** contain “human review queue” / “file de verification humaine”
- FR/EN id parity

### Files

| Path | Change |
|------|--------|
| `apps/web/lib/demo-scenarios.ts` | Rewrite scenarios + matcher |
| `apps/web/lib/demo-scenarios.test.ts` | Rewrite cases |
| `apps/web/components/demo-page-client.tsx` | Examples from scenarios; optional verdict |
| `specs/README.md` | Add feat-0039 row |

## Verification

```bash
pnpm --filter @afalambe/web exec tsc --noEmit
pnpm --filter @afalambe/web exec tsx --test lib/demo-scenarios.test.ts
```

Manual: `/demo` → click each example → distinct DEBUNKED replies; type “bonjour” → guidance, not queue message.
