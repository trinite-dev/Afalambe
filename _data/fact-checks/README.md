# Fact-check corpus (`_data/fact-checks`)

Curated Afalambe grounding data used by `@afalambe/ai` during `generateAssistantReply`.

## Contents

| File | Purpose |
|------|---------|
| `corpus.json` | Normalized AFA-001…AFA-065 entries |

## Provenance

Merged from client deliverables:

1. `Données Chatbot AFALAMABE.docx` (AFA-001…AFA-020)
2. `Donnees_Chatbot_AFALAMABE_enrichi.xlsx` (AFA-021…AFA-065 + enrichments)

French editorial labels are mapped to product verdicts (`VERIFIED`, `DEBUNKED`, `MISLEADING`, `PARTIALLY_TRUE`, `UNVERIFIABLE`).

## Updating

1. Edit or re-import into `corpus.json` (keep stable `id` values).
2. Bump `count` to match `entries.length`.
3. Run `pnpm --filter @afalambe/ai test`.
4. Restart the API so the in-memory cache reloads (or rely on process restart in `pnpm dev:all`).

## Runtime use

Static corpus hits are combined with similar **resolved** claims from the database and injected into the AI system prompt. See [feat-0038](../../specs/feat-0038/PRODUCT.md).
