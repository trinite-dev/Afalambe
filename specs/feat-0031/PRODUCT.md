# feat-0031: AI roadmap (vision, images, async, human handoff)

## Summary

Consolidates **planned AI capabilities** from [`AI_CHATBOT_SPEC.md`](../AI_CHATBOT_SPEC.md) and [`AI_CHAT_IMAGE_CONTEXT.md`](../AI_CHAT_IMAGE_CONTEXT.md) into a single roadmap spec. **Current implementation** is sync text-only OpenAI in [feat-0007](../feat-0007/PRODUCT.md).

## Problem

Two large legacy specs describe streaming, vision, RAG, and human queues that are not built. Engineers need one roadmap with phases without reading 1700+ lines.

## Current vs target

| Capability | Today | Target |
|------------|-------|--------|
| Model call | Sync `chat/completions` in API | Async job + polling/WS |
| Images in AI | Stored only | Vision model or image URLs in messages |
| System prompt | Generic multilingual in API | Per-`claimLanguage` from `languages.ts` |
| Confidence | None | Score threshold → human queue |
| Audit | None | `ClaimAiRun` table |
| Package | Inline `apps/api` | `@afalambe/ai` package |
| Streaming | None | Optional SSE to web |
| Human queue | Emails only | feat-0028 + FAILED status |

## Phased delivery

### Phase A (near-term)

1. Move `generateAssistantText` / `extractClaimMetadata` to `packages/ai`.
2. Wire `getSystemPrompt(claimLanguage)` from [`languages.ts`](../../apps/web/lib/languages.ts).
3. Pass image URLs from attachments into multimodal message content (OpenAI vision).
4. Fix lifecycle emails per [feat-0030](../feat-0030/PRODUCT.md).

### Phase B (medium-term)

1. `ClaimAiRun` model + persist tokens/latency/model id.
2. Confidence score in structured output (JSON mode).
3. If below threshold → `status=FAILED`, queue email only, no auto RESOLVED.

### Phase C (long-term)

1. Retrieval over curated source corpus (RAG) — **started in [feat-0038](../feat-0038/PRODUCT.md)** (`_data` + DB keyword grounding).
2. Streaming assistant tokens to UI.
3. Admin tools to override verdict ([feat-0028](../feat-0028/PRODUCT.md)).

## Non-goals

- Open web crawl as fact source.
- Fully autonomous publishing without human oversight for sensitive topics.

## Acceptance criteria (Phase A)

1. Image attached to claim is visible to the model in `generateAssistantReply`.
2. French claim receives French system prompt from `LANGUAGE_SYSTEM_PROMPTS.fr`.
3. No regression to sync text-only path for text-only claims.

## Related

- [feat-0031 TECH](./TECH.md)
- [feat-0007](../feat-0007/PRODUCT.md)
