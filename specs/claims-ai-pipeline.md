# Spec: Claims AI verification and human queue

## Problem

After a user submits a claim, the system must decide whether it can produce a **high-confidence** response (AI-assisted “verified” path) or must **defer to humans**. Poor decisions erode trust; false certainty is worse than admitting uncertainty.

## Goals

- Deterministic **pipeline stages** from submission through outcome recording.
- **Semantic matching** (embeddings and/or retrieval over approved knowledge) with explicit **confidence thresholds**.
- **Unmatched** or **below-threshold** items land in a **human review queue** with preserved context and model diagnostics (for debugging, not shown raw to end users unless product says otherwise).

## Non-goals (MVP)

- Fully automated legal determination or binding adjudication.
- Training or fine-tuning custom models inside this repo’s default deployment path (can ingest pre-built indexes only unless amended).
- Real-time streaming tokens to end users for internal model reasoning (optional product feature later).

## Scope

- Define pipeline states, inputs/outputs per stage, persistence fields, and failure behaviour.
- Define evaluation approach for tuning thresholds before production.

## Pipeline (logical)

```text
Submit → Normalise text → Retrieve evidence → Score / generate → Threshold gate → (Answer | Unable | Queue)
```

### Stage descriptions

1. **Normalise**: trim, Unicode NFC, max length enforcement, optional language hint from user profile.
2. **Retrieve**: query vector store / keyword index built from approved corpora (see “Training data” in roadmap).
3. **Score / generate**: model produces candidate answer + confidence + citations (citations strongly recommended when any answer is returned).
4. **Threshold gate**:
    - If `confidence >= T_high` and citations pass policy checks → `ai_answered`.
    - If `T_low <= confidence < T_high` → default MVP: `queued_human` (safer) unless product chooses “caveated answer” in amendment.
    - If `confidence < T_low` → `queued_human` or `ai_unable` with user-facing copy (product choice documented in `web.md`).

## Data to persist (minimum)

| Field                      | Purpose                                                   |
| -------------------------- | --------------------------------------------------------- |
| `claimId`                  | Foreign key to claim                                      |
| `modelId` / `modelVersion` | Reproducibility                                           |
| `retrievalContextIds`      | Which chunks informed the answer                          |
| `confidence`               | Numeric score in [0,1] or provider-native mapped to [0,1] |
| `rawModelOutput`           | Internal JSON; **encrypt or restrict** if sensitive       |
| `decision`                 | Enum aligned with `program.md` lifecycle                  |

## Success criteria

- **Repeatability**: same claim text + same index version yields same decision (modulo explicit temperature if any—prefer temperature 0 for gate decisions).
- **Auditability**: admin can answer “why was this queued?” from stored retrieval ids and scores.
- **Safety**: refusal path when content policy flags harassment, self-harm, or illegal instructions (provider policy + local blocklist if required).

## Functional requirements

### FR-AI-1 Provider abstraction

- Read `AI_PROVIDER`, `AI_MODEL`, `AI_API_KEY` from env (`docs/env/README.md`); no keys in specs or tests committed to git.

### FR-AI-2 Timeouts

- Hard deadline per invocation; on timeout mark claim as `queued_human` with reason code `AI_TIMEOUT`.

### FR-AI-3 PII

- Do not send unnecessary PII to the model; strip emails/phone from claim text if detected by simple heuristics (optional enhancement with spec amendment).

## Architecture impact

- Likely new package or module under `packages/ai` for “call provider + normalise response”.
- Workers: if async, use DB job table + separate worker process (Railway/Vercel cron or queue)—document in ADR when chosen.

## API and data impact

- May add tables: `ClaimAiRun`, `EvidenceChunk` (if managed in-app), or external vector DB only—decision recorded in ADR-0004 style.

## Implementation plan

1. Spike: prove retrieval + scoring with small fixed corpus on staging.
2. Persist `ClaimAiRun` rows on every attempt.
3. Wire admin UI to show run summary (`web.md`).
4. Add evaluation notebook or script (non-prod) for threshold tuning.

## Risks and mitigations

- **Risk**: Hallucinated citations.
    - **Mitigation**: require chunk ids; UI shows “sources” only from retrieval set.
- **Risk**: Cost blow-up.
    - **Mitigation**: per-user daily cap + monitoring alert.

## Test plan

- **Golden set**: curated claims with expected path (answer vs queue); run in CI when secrets available in CI vault.
- **Property tests** for normalisation (Unicode) where feasible.

## Open questions

- Single global threshold vs per-locale thresholds.
- Data retention for `rawModelOutput`.
