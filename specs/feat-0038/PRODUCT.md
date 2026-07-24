# feat-0038: Fact-check grounding corpus (`_data`)

## Summary

Afalambe fact-checks user claims using two complementary knowledge sources:

1. **Static curated corpus** in repo folder **`_data/fact-checks/`** — imported from the Afalambe chatbot datasets (`Données Chatbot AFALAMABE.docx` + `Donnees_Chatbot_AFALAMABE_enrichi.xlsx`).
2. **Live database claims** — previously resolved user threads (`Claim` with `factCheckText` / `factCheckStatus`) that accumulate as the product runs.

Both are retrieved by keyword similarity and injected into the AI system prompt before `generateAssistantText` runs. This is Phase C (RAG) of [feat-0031](../feat-0031/PRODUCT.md), scoped as a first lightweight retrieval step (no embeddings yet).

## Problem

Today the model only sees conversation history and claim metadata. It has no access to Afalambe’s approved Guinean / West African fact-checks, so replies can invent sources or miss known debunks. The client provided a ready corpus of **65** labeled cases that should ground answers.

## Goals

| Goal | Detail |
|------|--------|
| **Curated `_data`** | Versioned JSON corpus under `_data/fact-checks/` |
| **Retrieve on reply** | Top matching static entries injected into the AI prompt |
| **Also use DB** | Top matching resolved `Claim` rows injected alongside static hits |
| **Cite when used** | Assistant prompt instructs citing corpus/DB source ids or URLs when relevant |
| **Deterministic load** | Corpus loads from disk at process start (no network) |

## Non-goals

- Vector / embedding search (future)
- Admin UI to edit corpus entries
- Seeding all `_data` rows into Prisma as user claims
- Open-web crawl as a source
- Changing verdict enum beyond existing `FactCheckStatus`

## Actors

| Actor | Description |
|-------|-------------|
| **Verified user** | Submits claim; receives grounded reply |
| **Engineer** | Updates `_data/fact-checks/corpus.json` via PR |
| **System** | Retrieves corpus + DB evidence before AI call |

## Data model (product)

Each **corpus entry** represents one known claim and its editorial verdict:

| Field | Meaning |
|-------|---------|
| `id` | Stable id (`AFA-001` … `AFA-065`) |
| `claimText` | Misinformation / claim statement |
| `language` | `fr` / `en` / `ff` |
| `factCheckText` | Approved explanation |
| `verdict` | `VERIFIED` \| `DEBUNKED` \| `MISLEADING` \| `PARTIALLY_TRUE` \| `UNVERIFIABLE` |
| `topicCategory` | Optional mapped topic |
| `country` / `platform` / `sourceUrl` | Context |

**DB evidence** uses existing `Claim` fields: `claimText`, `factCheckText`, `factCheckStatus`, `topicCategory`, `location`.

## Use cases

| ID | Use case | Success |
|----|----------|---------|
| **UC-FC01** | Load corpus | API starts; `_data` corpus available |
| **UC-FC02** | Retrieve static hits | User claim text matches known AFA-* entries |
| **UC-FC03** | Retrieve DB hits | Similar resolved claims included |
| **UC-FC04** | Grounded reply | System prompt contains evidence block; model uses it |
| **UC-FC05** | No hits | Reply still works (metadata + thread only) |
| **UC-FC06** | Update corpus | Engineer edits JSON; restart / hot-reload picks up |

## Behavior rules

1. Retrieval runs on every `generateAssistantReply` (and regenerate).
2. Query text = latest USER message, else `Claim.claimText`.
3. Static limit default **5**; DB limit default **3**.
4. Exclude the **current claim id** from DB hits.
5. Prefer higher token-overlap score; break ties by id.
6. Never invent corpus ids that were not retrieved.
7. `UNVERIFIABLE` corpus rows may still be shown as context (“cannot verify”).

## Acceptance criteria

1. `_data/fact-checks/corpus.json` contains all **65** AFA entries from the provided DOCX + XLSX (merged).
2. Asking about a claim close to `AFA-004` (FMI / banques) surfaces that entry in the evidence block used by the model.
3. A previously resolved DB claim with similar text can appear in the evidence block.
4. Unit tests cover scoring / ranking for French claim text.
5. Typecheck passes for `@afalambe/ai`, `@afalambe/api`, `@afalambe/trpc`.

## Related

- [feat-0038 TECH](./TECH.md)
- [feat-0007](../feat-0007/PRODUCT.md) — generateAssistantReply
- [feat-0031](../feat-0031/PRODUCT.md) — AI roadmap Phase C
- [claims-ai-pipeline.md](../claims-ai-pipeline.md) — long-term retrieve → score
