# feat-0030: Tech Spec — Claim lifecycle

## Implementation

[`packages/trpc/src/routers/claim.ts`](../../packages/trpc/src/routers/claim.ts) — `create`, `generateAssistantReply`, `parseVerdict`.

## parseVerdict

```ts
const VERDICT_PATTERN = /\b(verified|debunked|misleading|partially[_ ]true)\b/i;
```

Maps to `FactCheckStatus` enum values in schema.

## generateAssistantReply sequence

1. `requireVerifiedEmail`
2. Load claim + last 20 messages
3. `status → PROCESSING`
4. Send `claim-queued` email + `EmailDelivery` upsert
5. Parallel: `generateAssistantText` + optional `extractClaimMetadata`
6. On error: fallback French string (still continues)
7. Create ASSISTANT `ClaimMessage`
8. `status → RESOLVED`, set `factCheckText`, `factCheckStatus`, `factCheckDate`
9. WebSocket: `message.created`, `claim.statusChanged`
10. Send `claim-resolved` email + `EmailDelivery` upsert

## Metadata extraction

When claim lacks topic/source/location/platform, extract from first USER message via `extractClaimMetadata` ([feat-0007](../feat-0007/TECH.md)).

## listMine

- `take: 50`, `orderBy: updatedAt desc`
- Filters: `search`, `factCheckStatus`, `topicCategory` (UI uses search only)

## Attachment refresh

`byId` calls `refreshMessageAttachments` — re-signs Supabase read URLs for stored `uploadPath` ([feat-0008](../feat-0008/TECH.md)).

## Prisma fields (fact-check migration)

`claimText`, `claimLanguage`, `claimDate`, `sourceName`, `sourceType`, `sourceUrl`, `mediaType`, `topicCategory`, `location`, `platform`, `factCheckStatus`, `factCheckText`, `factCheckDate`.

## Refactor targets

1. Split email triggers per UC-LC06 escalation rules.
2. Do not set RESOLVED on AI hard failure.
3. Add `ClaimAiRun` row per attempt ([feat-0031](../feat-0031/PRODUCT.md)).

## Related

- [feat-0011 TECH](../feat-0011/TECH.md)
