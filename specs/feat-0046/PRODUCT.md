# feat-0046: Core loop hardening + local ops parity

## Summary

Harden Afalambe’s **already-shipped core fact-check loop** and local developer ops so they match the bar TruthSentry documented when porting Afalambe (their feat-0034) — plus the port-pin / migrate-baseline fixes that unblock `pnpm dev:all` and `prisma migrate`.

Afalambe stays **FR-first** (`/` FR, `/en/*` EN), keeps client scripted `/demo`, and does **not** adopt TruthSentry campaigns, dossier cards, or AR routing.

## Already shipped (do not regress)

| Capability | Where |
|------------|--------|
| `MessageFeedback` + thumbs | schema + `claim.submitMessageFeedback` + chat UI |
| `AdminAuditLog` + `listAuditLogs` | schema + admin queue |
| Corpus + RESOLVED DB evidence | `@afalambe/ai` + API prompts |
| Fact-check details footer (fr/en) | `@afalambe/ai/fact-check-details` + chat/demo cards |
| AI hard-fail on fact-check → `FAILED` + human-queue email | `claim.generateAssistantReply` |

## Gaps this feat closes

| Gap | Target |
|-----|--------|
| Admin resolve writes only SYSTEM `[Reviewer]` note | Also write **ASSISTANT** reply + realtime `message.created` |
| Audit action always `claim.updateStatus` | Prefer `claim.resolve` when status is `RESOLVED` |
| `listQueue` with no status filter returns all claims | Default to human-queue statuses (`FAILED`, `OPEN`, `PROCESSING`) |
| AI failure copy always French | Localized FR / EN from `claimLanguage` |
| Next may bind 3000/3001; duplicate servers fight over `.next` | Pin web to **3002**; CORS allow 3002 |
| No `app/en/error.tsx` | Add EN route error boundary |
| Migration chain ALTERs `User` without creating it | Idempotent `20260401000000_init` baseline |
| API EADDRINUSE is opaque | Clear log + exit hint |

## Non-goals

- Porting TruthSentry campaigns, ClaimDossierCard, or server `demo.*`
- Arabic UI or next-intl
- Vector RAG / embeddings
- Changing production deploy ports (Docker still uses image defaults unless env overrides)

## Actors

| Actor | Change |
|-------|--------|
| Claimant | Sees reviewer ASSISTANT text in chat after admin resolve; clearer EN fail copy |
| Admin | Queue defaults to human-review work; resolve audits as `claim.resolve` |
| Developer | Stable `http://localhost:3002`; migrate shadow DB has User; API port conflicts explained |

## Use cases

| ID | Use case | Success |
|----|----------|---------|
| **UC-A01** | Admin resolves claim | ASSISTANT + SYSTEM `[Reviewer]` messages; audit; broadcasts |
| **UC-A02** | Open admin queue with no filter | Only FAILED / OPEN / PROCESSING |
| **UC-C01** | AI throws on EN fact-check | EN failure message; claim `FAILED` |
| **UC-O01** | `pnpm dev:all` | Web on **3002** |
| **UC-O02** | Fresh / shadow migrate | Init creates User before later ALTERs |
| **UC-O03** | Error under `/en/*` | EN error boundary renders |

## Acceptance criteria

1. `admin.updateClaimStatus` creates ASSISTANT + SYSTEM messages and broadcasts `message.created` for the assistant (and status change).
2. `listQueue` without `status` matches `queueCount` human-queue filter.
3. `assistantFailureMessage` returns EN when `claimLanguage === 'en'`, else FR.
4. `@afalambe/web` `dev` / `start` use `-p 3002`; API CORS includes 3002; `.env.example` points at 3002.
5. `apps/web/app/en/error.tsx` exists.
6. `20260401000000_init` migration is present and idempotent.
7. Specs README lists feat-0046.

## Related

- TruthSentry [feat-0034](../../../truthsentry/specs/features/feat-0034-afalambe-core-parity/PRODUCT.md) (reference port *from* Afalambe)
- [feat-0028](../feat-0028/PRODUCT.md) admin UI
- [feat-0033](../feat-0033/PRODUCT.md) local runbook
- [feat-0038](../feat-0038/PRODUCT.md) corpus evidence
- [feat-0040](../feat-0040/PRODUCT.md) fact-check details
