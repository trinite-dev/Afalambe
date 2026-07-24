# feat-0038: Tech Spec — Fact-check grounding corpus (`_data`)

## Layout

```text
_data/
  fact-checks/
    corpus.json          # normalized AFA-* entries
    README.md            # provenance + update process
packages/ai/
  package.json           # @afalambe/ai exports
  src/
    index.ts
    types.ts
    load-corpus.ts
    retrieve.ts
    format-evidence.ts
    retrieve.test.ts
apps/api/src/index.ts    # inject retrieve into generateAssistantText
```

## Corpus schema (`corpus.json`)

```ts
type FactCheckCorpusFile = {
  version: 1
  name: string
  description: string
  importedFrom: string[]
  count: number
  entries: FactCheckCorpusEntry[]
}

type FactCheckCorpusEntry = {
  id: string                 // AFA-001
  claimText: string
  language: 'fr' | 'en' | 'ff'
  languageRaw?: string | null
  publishedAt?: string | null
  author?: string | null
  sourceType?: string | null
  sourceUrl?: string | null
  mediaType?: string | null
  factCheckText: string
  factCheckStatusRaw?: string | null
  verdict: 'VERIFIED' | 'DEBUNKED' | 'MISLEADING' | 'PARTIALLY_TRUE' | 'UNVERIFIABLE'
  topicCategory?: 'POLITICS' | 'HEALTH' | 'FINANCE' | 'TECH' | 'SECURITY' | 'EDUCATION' | 'ENVIRONMENT' | null
  topicCategoryRaw?: string | null
  country?: string | null
  platform?: string | null
  sources: Array<'docx' | 'xlsx'>
}
```

Status mapping from French labels:

| Raw | `verdict` |
|-----|-----------|
| Vérifié Faux | `DEBUNKED` |
| Vérifié Vrai | `VERIFIED` |
| Trompeur / Partiellement faux | `MISLEADING` |
| Sorti de contexte / Satire | `MISLEADING` |
| Non vérifiable | `UNVERIFIABLE` |

## Retrieval algorithm (MVP)

1. Normalize query: lowercase, strip accents, tokenize on non-letters, drop stopwords (FR+EN short list), length ≥ 3.
2. Score entry = count of query tokens present in `claimText + factCheckText + country + topicCategoryRaw`.
3. Optional boost +1 if `topicCategory` matches claim metadata topic.
4. Sort by score desc, then id asc; keep `score > 0`.
5. Return top `limit`.

Same scorer applies to DB rows mapped to a lightweight `EvidenceHit` shape.

## `@afalambe/ai` API

```ts
export function loadFactCheckCorpus(path?: string): FactCheckCorpusEntry[]
export function retrieveFromCorpus(query: string, opts?: { limit?: number; topicCategory?: string | null }): EvidenceHit[]
export function formatEvidenceBlock(hits: EvidenceHit[]): string
export type EvidenceHit = {
  id: string
  source: 'corpus' | 'database'
  claimText: string
  factCheckText: string
  verdict: string
  sourceUrl?: string | null
  score: number
}
```

Default corpus path: resolve from monorepo root `_data/fact-checks/corpus.json` via `import.meta.url` / `process.cwd()` fallbacks.

## API wiring (`apps/api`)

In `generateAssistantText`:

1. Build `query` from last user message / `claim.claimText`.
2. `corpusHits = retrieveFromCorpus(query, { limit: 5, topicCategory: claim.topicCategory })`.
3. `dbHits = await findSimilarResolvedClaims({ query, excludeClaimId, limit: 3 })` using Prisma:
   - `status: 'RESOLVED'`
   - `factCheckText: { not: null }`
   - OR on token `contains` for up to 5 significant tokens (insensitive)
4. Merge, dedupe by text fingerprint, format with `formatEvidenceBlock`.
5. Append to system prompt:

```text
Approved evidence (use when relevant; cite id or URL; do not invent ids):
...
```

## Dependencies

| Package | Change |
|---------|--------|
| `@afalambe/ai` | New src + depend on nothing heavy |
| `@afalambe/api` | `workspace:*` dep on `@afalambe/ai` |
| Root `_data/` | New (git-tracked JSON) |

## Testing

| Test | Assertion |
|------|-----------|
| `retrieve.test.ts` | Query about FMI / banques ranks `AFA-004` in top results |
| `retrieve.test.ts` | Empty query → no hits |
| `load-corpus` | Count === 65 |

## Verification

```bash
pnpm --filter @afalambe/ai test
pnpm --filter @afalambe/ai exec tsc --noEmit
pnpm --filter @afalambe/api exec tsc --noEmit
```

## Related

- [feat-0038 PRODUCT](./PRODUCT.md)
- [feat-0007 TECH](../feat-0007/TECH.md)
