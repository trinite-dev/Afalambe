# feat-0010: Tech Spec — Orphan cleanup

## Module

[`apps/api/src/cleanup-orphans.ts`](../../apps/api/src/cleanup-orphans.ts).

Scheduled in [`apps/api/src/index.ts`](../../apps/api/src/index.ts) — `setInterval` 60 minutes when API is main module.

## Algorithm

1. List objects in `SUPABASE_STORAGE_BUCKET_CHAT_UPLOADS` under `claims/`.
2. Query DB for all `uploadPath` values in message attachments.
3. Delete storage objects not in reference set and older than threshold.

## Env

`SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`, `SUPABASE_STORAGE_BUCKET_CHAT_UPLOADS`, `DATABASE_URL`.

## Related

- [feat-0008 TECH](../feat-0008/TECH.md)
