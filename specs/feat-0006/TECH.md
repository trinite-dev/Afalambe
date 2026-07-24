# feat-0006: Tech Spec — Claims and chat

## Procedures

| Procedure | Type | Notes |
|-----------|------|-------|
| `claim.listMine` | query | `search`, `factCheckStatus`, `topicCategory`, cursor |
| `claim.byId` | query | Messages + signed attachment URLs |
| `claim.create` | mutation | Content, metadata, attachments, `clientRequestId` |
| `claim.appendUserMessage` | mutation | Idempotent via `clientReqId` unique per claim |
| `claim.updateMetadata` | mutation | Partial metadata patch |
| `claim.requestUpload` | mutation | Signed Supabase PUT URL |
| `claim.generateAssistantReply` | mutation | See feat-0007 |

Router: [`packages/trpc/src/routers/claim.ts`](../../packages/trpc/src/routers/claim.ts).

## Prisma

**Claim** — status `ClaimStatus` (OPEN, PROCESSING, RESOLVED, FAILED); fact-check fields on same model.

**ClaimMessage** — `role` USER|ASSISTANT|SYSTEM; `attachments` Json; `clientReqId` unique per claim.

## Web

| Module | Role |
|--------|------|
| `apps/web/app/chat/page.tsx` | Route shell |
| `apps/web/components/chat-page-client.tsx` | Main orchestration |
| `packages/ui/src/components/chat/**` | Shell, sidebar, composer, messages |

## Realtime integration

`broadcastToClaimSubscribers` on message create / status change (feat-0009).

## Email side effects

`sendClaimQueuedEmail` / `sendClaimResolvedEmail` — see **[feat-0030](./feat-0030/PRODUCT.md)** for exact trigger timing (fires on every `generateAssistantReply` today).

## Known gaps

| Gap | Notes |
|-----|-------|
| `updateMetadata` no UI | API only |
| List filters not in UI | Only search wired |
| `ClaimStatus.FAILED` unused | No human queue |
| Home columns hardcoded French | Not using `languages.ts` |

## Testing

`packages/trpc/src/upload-validation.test.ts`; manual chat flow.

## Related

- [feat-0007 TECH](../feat-0007/TECH.md)
- [feat-0008 TECH](../feat-0008/TECH.md)
