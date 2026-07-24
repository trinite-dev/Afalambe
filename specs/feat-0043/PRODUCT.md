# feat-0043: Detect non-claim chats (meta + follow-up questions)

## Summary

Not every user message is a **claim to fact-check**. Afalambe must detect:

| Intent | Meaning |
|--------|---------|
| **FACT_CHECK** | User submits a claim / asks to verify something |
| **FOLLOW_UP** | Further question about the current thread’s verification (sources, meaning, why) |
| **META** | Question about fact-checking itself or the product (how it works, what Afalambe is) |
| **OFF_TOPIC** | Unrelated chatter |

Only **FACT_CHECK** runs the full verification pipeline (retrieval, verdict, status/email, details footer). Other intents get a helpful conversational reply without inventing a new verdict.

Applies to authenticated **chat** and public **demo**.

## Assumptions

1. Classification is primarily **deterministic heuristics** (FR + EN) for speed, tests, and no extra API cost; optional LLM refine later is out of scope for v1.
2. If a thread already has an assistant reply and the user asks a short clarifying question, prefer **FOLLOW_UP** over starting a new fact-check.
3. Ambiguous first messages that look like claims default to **FACT_CHECK** (safer for the product mission).
4. Demo uses the same classifier; scripted D1–D5 remain for known claim examples.

## Problem

Today every `generateAssistantReply` treats the last user text as a claim: retrieval, fact-check prompt, verdict parse, status update, email, and details footer. Asking “How do you fact-check?” or “Why is that misleading?” can overwrite the verdict and spam “resolved” emails.

## Goals

| Goal | Detail |
|------|--------|
| **Detect intent** | Classify last user message before generation |
| **FACT_CHECK path** | Unchanged verification behaviour |
| **FOLLOW_UP path** | Answer about prior analysis; keep existing verdict/status; no resolved email |
| **META path** | Explain product / fact-checking; no corpus verdict |
| **OFF_TOPIC path** | Redirect toward submitting a claim (polite) |
| **Demo parity** | Same intent classes on `/demo` |
| **No fake media** | Do not invent sources/images when answering meta/follow-up |

## Non-goals

- LLM-based intent model as the only classifier
- Separate Prisma tables for intents
- Changing claim ownership or multi-claim split inside one thread
- Full FAQ CMS

## Actors

| Actor | Description |
|-------|-------------|
| **Verified user** | Mixes claims, follow-ups, and product questions in `/chat` |
| **Demo visitor** | Same intents on guided demo |
| **System** | Routes generation and claim lifecycle by intent |

## Use case catalog

| ID | Use case | Trigger | Success |
|----|----------|---------|---------|
| **UC-IN01** | Verify claim | “Est-ce vrai que…?” / “Is it true that…?” | FACT_CHECK pipeline |
| **UC-IN02** | Follow-up | After a verdict: “Pourquoi ?” / “What sources?” | Conversational reply; verdict unchanged |
| **UC-IN03** | Meta product | “Comment fonctionne Afalambe ?” | Explains product; no verdict |
| **UC-IN04** | Meta process | “What is fact-checking?” | Educational reply; no verdict |
| **UC-IN05** | Off-topic | “What’s the weather?” | Redirect to submit a claim |
| **UC-IN06** | First message claim-like | Long claim statement | FACT_CHECK (default) |
| **UC-IN07** | Demo meta | Same phrasing on `/demo` | Guided meta reply, not D1–D4 |

## Acceptance criteria

1. Spec PRODUCT + TECH exist and are indexed in `specs/README.md`.
2. `classifyMessageIntent` unit tests cover FACT_CHECK / FOLLOW_UP / META / OFF_TOPIC (FR + EN).
3. `generateAssistantReply` skips verdict overwrite + resolved email for non-FACT_CHECK.
4. Non-FACT_CHECK replies omit forcing a new fact-check details footer (FOLLOW_UP may reuse existing claim fields in UI).
5. Demo uses the classifier for non-scenario matches (or explicit meta/follow-up paths).
6. Typecheck passes for `@afalambe/ai`, `@afalambe/trpc`, `@afalambe/web`.

## Related

- [feat-0043 TECH](./TECH.md)
- [feat-0007](../feat-0007/PRODUCT.md)
- [feat-0039](../feat-0039/PRODUCT.md)
- [feat-0040](../feat-0040/PRODUCT.md)
