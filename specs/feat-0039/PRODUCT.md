# feat-0039: Demo scenario matching (no generic fallback)

## Summary

`/demo` and `/en/demo` currently show the same **home example prompts** as `/chat` (corpus-backed questions from [feat-0038](../feat-0038/PRODUCT.md) / `HOME_EXAMPLE_CLAIMS`), but scripted matching only knows a tiny trigger set (election / vaccine / rumor). Almost every click therefore falls through to **S3**, which always replies:

> We cannot confirm this claim… human review queue…

That makes the demo look broken. This feature **aligns demo scripts with the visible examples**, improves matching, and **stops using the human-queue script as a silent default**.

**Status:** Specified — implement with this PRODUCT + [TECH](./TECH.md).

## Problem

| What users see | What matching does |
|----------------|--------------------|
| Alpha Condé protest video | No trigger → S3 PENDING |
| IMF bank WhatsApp rumor | No trigger → S3 PENDING |
| Malian miners images | No trigger → S3 PENDING |
| Mpox vaccine sterility | May hit “vaccin” → S2 (wrong script about generic vaccines) |
| Free-typed text | Always S3 |

## Goals

1. **Example–script parity** — Every home example line on `/demo` maps to a dedicated scripted reply with a real verdict (`DEBUNKED` / `MISLEADING` / `VERIFIED` / intentional `PENDING` only when chosen).
2. **Corpus-grounded copy** — Scripts for the four curated home claims (`AFA-001`, `AFA-002`, `AFA-004`, `AFA-008`) paraphrase the approved `_data` fact-check text (FR + EN).
3. **Robust matching** — Match by (a) exact/normalized example line, (b) keyword score on triggers, (c) optional corpus id aliases — not first-hit substring on vague words like `source` / `verify`.
4. **Honest unmatched path** — Free text that does not match any scenario gets a **demo-only guidance reply** (try an example / sign up), **not** the human-queue PENDING script.
5. **Still offline** — No `trpc.claim.*`, no Gemini/OpenAI on demo.

## Non-goals

- Calling live AI on `/demo`
- Loading full 65-row corpus into the browser bundle (only the four home examples + optional fifth PENDING demo)
- Changing authenticated `/chat` retrieval ([feat-0038](../feat-0038/PRODUCT.md))

## Scenarios (MVP)

| ID | Corpus | Example (EN summary) | Verdict |
|----|--------|----------------------|---------|
| **D1** | AFA-001 | Alpha Condé protest video | `DEBUNKED` |
| **D2** | AFA-002 | Malian miners / diamonds images | `DEBUNKED` |
| **D3** | AFA-004 | Fake IMF bank report (WhatsApp) | `DEBUNKED` |
| **D4** | AFA-008 | Mpox vaccine causes sterility | `DEBUNKED` |
| **D5** (optional) | — | Explicit “unverifiable rumor” example | `PENDING` (only when this line is chosen) |
| **UNMATCHED** | — | Any other free text | Guidance reply, **no** verdict badge |

Home empty **examples** column must list **D1–D4** (and D5 if shipped) example lines — **not** unrelated strings that lack scripts.

## Use cases

| ID | Use case | Success |
|----|----------|---------|
| **UC-DM01** | Click home example D1–D4 | Matching reply + correct verdict badge |
| **UC-DM02** | Paste same example line | Same as UC-DM01 |
| **UC-DM03** | Type keywords for D3 (FMI / IMF / banques) | D3 reply, not UNMATCHED / not old S3 |
| **UC-DM04** | Type “hello” / unrelated claim | Guidance reply; **not** human-queue copy |
| **UC-DM05** | Choose D5 (if present) | PENDING + human-queue style copy **only then** |
| **UC-DM06** | FR `/demo` and EN `/en/demo` | Locale-correct scripts and examples |

## Acceptance criteria

1. Clicking each demo home example yields a **non-generic** scripted fact-check (not the old S3 fallback text).
2. `matchDemoScenario` / successor never returns the human-queue PENDING script for unmatched input.
3. Unit tests cover D1–D4 example lines, keyword hits, and unmatched guidance.
4. Demo remains client-only (no claim API).

## Out of scope follow-ups

- Scoring against full corpus in the browser
- Multilingual Fula demo scripts
