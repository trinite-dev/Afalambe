# feat-0031: Tech Spec — AI roadmap

## Current code paths

| Function | File |
|----------|------|
| `generateAssistantText` | `apps/api/src/index.ts` |
| `extractClaimMetadata` | `apps/api/src/index.ts` |
| `generateAssistantReply` | `packages/trpc/src/routers/claim.ts` |

## `@afalambe/ai`

[`packages/ai/package.json`](../../packages/ai/package.json) — **no `src/`**. Target exports:

```ts
export function buildFactCheckMessages(claim, thread, attachments?): ChatMessage[]
export function parseVerdict(text: string): FactCheckStatus | null
export async function runFactCheck(input): Promise<FactCheckResult>
```

## Vision integration (Phase A sketch)

1. `claim.byId` already returns attachment URLs.
2. In `generateAssistantReply`, map USER messages with `attachments` to OpenAI content parts `{ type: 'image_url', image_url: { url } }`.
3. Respect `CHAT_IMAGE_MAX_BYTES` and signed URL expiry — refresh before model call.

## Structured output (Phase B sketch)

Use JSON schema response for `{ verdict, confidence, reasoning, citations[] }` instead of regex `parseVerdict`.

## Env

Unchanged: `AI_API_KEY`, `AI_MODEL`.

## Testing

- Golden-file tests for `parseVerdict` (move from inline).
- Mock fetch integration test for `runFactCheck`.
- No live OpenAI in CI.

## Legacy spec index

| Document | Use for |
|----------|---------|
| `AI_CHATBOT_SPEC.md` | Full UI/hook inventory, historical design |
| `AI_CHAT_IMAGE_CONTEXT.md` | Image pipeline detail |
| `claims-ai-pipeline.md` | Semantic matching concepts |

Prefer **this feat-0031** for sprint planning; link to legacy for deep dives.

## Related

- [feat-0030 TECH](../feat-0030/TECH.md)
- [feat-0008 TECH](../feat-0008/TECH.md)
