# feat-0008: Tech Spec — Image uploads

## Procedures

`claim.requestUpload` — input `claimId?`, `filename`, `mimeType`, `sizeBytes`.

Validation: [`packages/trpc/src/upload-validation.ts`](../../packages/trpc/src/upload-validation.ts).

Client validation: [`apps/web/lib/image-validation.ts`](../../apps/web/lib/image-validation.ts).

## Supabase

[`apps/api/src/index.ts`](../../apps/api/src/index.ts):

- `getSupabaseClient()` — service role, no persisted auth session
- `createSignedUploadUrl` — path `claims/{claimId}/{timestamp}-{safeName}`
- `createSignedReadUrl` — for attachment display

## Env

| Variable | Purpose |
|----------|---------|
| `SUPABASE_URL` | Project URL |
| `SUPABASE_SERVICE_ROLE_KEY` | Signing |
| `SUPABASE_STORAGE_BUCKET_CHAT_UPLOADS` | Default `chat-uploads` |
| `CHAT_IMAGE_MAX_BYTES` | Server limit |
| `CHAT_ALLOWED_IMAGE_MIME_TYPES` | Comma-separated |
| `NEXT_PUBLIC_CHAT_IMAGE_MAX_BYTES` | Optional client cap |

## Upload flow

1. `claim.requestUpload` returns `uploadUrl`, `uploadPath`, `readUrl`, `publicUrl`.
2. Client `PUT` file to `uploadUrl`.
3. Attachments stored on message with `uploadPath` for refresh.
4. `claim.byId` calls `refreshMessageAttachments` to re-sign `readUrl` before display.

## Prisma

`ClaimMessage.attachments` — array of `{ url, mimeType, sizeBytes, uploadPath? }`.

## Tests

`packages/trpc/src/upload-validation.test.ts`, `apps/web/lib/image-validation.test.ts`.

## Related

- [feat-0010 TECH](../feat-0010/TECH.md)
