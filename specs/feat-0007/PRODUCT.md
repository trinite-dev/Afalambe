# feat-0007: AI fact-check pipeline

## Summary

When a user submits a claim (or follow-up), **`claim.generateAssistantReply`** calls **OpenAI chat completions** with a fact-checking system prompt, optional **metadata extraction** from the user text, and **verdict parsing** from the assistant response. Claim `factCheckStatus` and `ClaimStatus` are updated.

## Problem

Users expect an AI assistant to analyze claims with clear verdicts and African context awareness. The pipeline must fail gracefully and not block the UI indefinitely.

## Non-goals (not implemented)

- Vision / image understanding in model calls (images stored but **not** sent to OpenAI).
- Async job queue with `ClaimAiRun` table.
- RAG over external corpus.
- Human reviewer assignment workflow.

## Use case catalog

| ID | Use case | Trigger | Success |
|----|----------|---------|---------|
| **UC-AI01** | Generate reply | After `claim.create` or append | Assistant message persisted |
| **UC-AI02** | Extract metadata | On create (if `AI_API_KEY` set) | topic, source, platform, location fields |
| **UC-AI03** | Parse verdict | After model response | VERIFIED / DEBUNKED / MISLEADING / PARTIALLY_TRUE / PENDING |
| **UC-AI04** | Model timeout | 30s OpenAI call | Error thrown; partial handling in router |
| **UC-AI05** | Missing API key | No `AI_API_KEY` | Error on generate |

## Behavior (product rules)

1. System prompt in [`apps/api/src/index.ts`](../../apps/api/src/index.ts) — multilingual instruction (French, Fula, English); **not** wired to `languages.ts` per-language prompts.
2. Thread sent as user/assistant messages from `ClaimMessage` history.
3. Spec [`AI_CHATBOT_SPEC.md`](../AI_CHATBOT_SPEC.md) describes fuller vision (streaming, human queue) — treat as roadmap.

## Acceptance criteria

1. Text-only claim receives assistant reply with verdict language in body.
2. Claim `factCheckStatus` updates when regex matches verdict tokens.
3. Typing indicator shown while `generateAssistantReply.isPending`.

## Related

- [feat-0007 TECH](./TECH.md)
- [feat-0030](../feat-0030/PRODUCT.md) — lifecycle and email timing
- [feat-0031](../feat-0031/PRODUCT.md) — AI roadmap
- [`AI_CHAT_IMAGE_CONTEXT.md`](../AI_CHAT_IMAGE_CONTEXT.md)
