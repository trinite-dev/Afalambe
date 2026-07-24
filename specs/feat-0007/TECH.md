# feat-0007: Tech Spec — AI pipeline

## Procedure

`claim.generateAssistantReply` — input `{ claimId }`; loads claim + messages; calls `ctx.generateAssistantText`.

## Implementation location

**Inline in API** (not `@afalambe/ai` package — empty stub):

- `generateAssistantText` — POST `https://api.openai.com/v1/chat/completions`
- `extractClaimMetadata` — structured JSON extraction (10s timeout)

[`apps/api/src/index.ts`](../../apps/api/src/index.ts).

## Verdict parsing

[`packages/trpc/src/routers/claim.ts`](../../packages/trpc/src/routers/claim.ts) `parseVerdict` — regex on assistant text.

## Env

| Variable | Default | Purpose |
|----------|---------|---------|
| `AI_API_KEY` | — | Bearer token |
| `AI_MODEL` | `gpt-4.1-mini` | Model id |
| `AI_PROVIDER` | documented | **Unused** |

## Prisma updates

- New `ClaimMessage` row role ASSISTANT
- `Claim.factCheckStatus`, `Claim.status`, metadata fields

## Known gaps

| Gap | Spec reference |
|-----|----------------|
| Images not in model payload | AI_CHAT_IMAGE_CONTEXT |
| No `ClaimAiRun` audit rows | api.md |
| `FAILED` status never set | Human queue stub |
| Sync only — blocks HTTP | api.md async note |
| `@afalambe/ai` empty | Should extract logic |

## Testing

No integration tests for OpenAI; manual with valid `AI_API_KEY`.

## Related

- [feat-0006 TECH](../feat-0006/TECH.md)
- [feat-0008 TECH](../feat-0008/TECH.md) — emails on resolve
