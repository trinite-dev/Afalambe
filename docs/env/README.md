# Environment Contract

This document defines required environment variables by runtime.

## apps/web (single-deploy / feat-0047)

Same-origin mode: **omit** `NEXT_PUBLIC_API_URL`. Server secrets live on the Vercel project (or in `apps/web/.env` locally).

### Public

- `NEXT_PUBLIC_APP_URL`: public application URL (email links, canonical origin)
- `NEXT_PUBLIC_API_URL`: **optional dual-run only** — when set, client talks to standalone `apps/api` (`…/trpc` + WebSocket). When unset, client uses `/api/trpc` and polling.
- `NEXT_PUBLIC_DEMO_ENABLED`: optional; set `false` to disable `/demo`
- `NEXT_PUBLIC_CHAT_IMAGE_MAX_BYTES`: optional client-side image size mirror

### Server (required for `/api/trpc`, webhooks, cron)

Same set as former `apps/api` secrets:

- `DATABASE_URL`: Postgres pooler URL
- `DIRECT_URL`: direct URL for migrations (CI / one-off)
- `SUPABASE_URL`, `SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`
- `SUPABASE_STORAGE_BUCKET_CHAT_UPLOADS`
- `CHAT_IMAGE_MAX_BYTES`, `CHAT_ALLOWED_IMAGE_MIME_TYPES`
- `AUTH_COOKIE_NAME`, `AUTH_COOKIE_SECURE` (`true` in production)
- `AUTH_SECRET`: documented in templates; **unused in application code**
- `RESEND_API_KEY`, `EMAIL_FROM`, `RESEND_WEBHOOK_SIGNING_SECRET`
- `AI_PROVIDER`, `AI_MODEL`, `AI_API_KEY`
- `CRON_SECRET`: bearer for `/api/cron/cleanup-orphans`
- `EMAIL_DEV_LOG_OTP` / `EMAIL_DEV_EXPOSE_OTP`: local only; never in production
- `ORPHAN_CLEANUP_DISABLED`: optional escape hatch
- `FACT_CHECK_CORPUS_PATH`: optional absolute path override for corpus.json
- `RATE_LIMIT_DISABLED`: optional; default off in production

### Routes on Next

| Path | Purpose |
|------|---------|
| `/api/trpc/*` | tRPC |
| `/api/webhooks/resend` | Resend delivery events |
| `/api/cron/cleanup-orphans` | Daily orphan cleanup (Vercel Cron `0 3 * * *` UTC). Hobby allows **once per day** only; Pro can use hourly. |
| `/api/health` | Liveness |
| `/api/ready` | DB readiness |

### Supabase Storage CORS

Allow `PUT`/`GET`/`HEAD` from your web origin (e.g. `https://your-domain` and local `http://localhost:3002`) on the chat-uploads bucket.

## apps/api (dual-run / rollback)

Keep until Phase 4 cutover is signed off. Same secrets as above, plus:

- `API_PORT`: server port (default `4000`)
- `CORS_ALLOWED_ORIGINS`: optional extra browser origins
- `NEXT_PUBLIC_APP_URL`: used for email links and CORS allowlist

## packages/emails (Resend)

- `RESEND_API_KEY`: Resend API key
- `EMAIL_FROM`: verified sender email

## packages/prisma

- `DATABASE_URL`: Prisma datasource URL (runtime / migrate target)
- Optional `packages/prisma/.env` — use this when migrations should hit a different DB than `apps/api/.env` (e.g. local Postgres vs remote Supabase)

### Migrations

Baseline `20260401000000_init` creates `User` / `Session` / `Claim` / `ClaimMessage` (idempotent). Later migrations ALTER those tables.

```bash
# Preferred when applying known migrations (CI / existing DB)
pnpm --filter @afalambe/prisma exec prisma migrate deploy

# Local iterative (creates new migrations when schema changes)
pnpm --filter @afalambe/prisma db:migrate
```

If your DB already applied later migrations before the init baseline existed, mark init as applied once:

```bash
pnpm --filter @afalambe/prisma exec prisma migrate resolve --applied 20260401000000_init
```

## Local web port

Dev web is pinned to **http://localhost:3002** (`next dev -p 3002`). Set `NEXT_PUBLIC_APP_URL` accordingly.

- **Same-origin (recommended):** copy server secrets into `apps/web/.env`, leave `NEXT_PUBLIC_API_URL` unset, run `pnpm dev:web`.
- **Dual-run:** set `NEXT_PUBLIC_API_URL=http://localhost:4000` and run `pnpm dev:all`.

## AI pipeline

- `AI_PROVIDER`: `openai` (default) or `gemini` / `google`
- `AI_MODEL`: model name/version (`gpt-4.1-mini` for OpenAI, `gemini-flash-latest` for Gemini)
- `AI_API_KEY`: provider API key (**server only** — used by `claim.generateAssistantReply`, metadata extraction, and `claim.transcribeAudio`)
- **Never** set `NEXT_PUBLIC_OPENAI_API_KEY` or any browser-exposed AI key. Voice stays on the server ([feat-0015](../../specs/feat-0015/PRODUCT.md), [feat-0048](../../specs/feat-0048/PRODUCT.md)).

When `AI_PROVIDER=gemini`, chat and metadata use Google Generative Language `generateContent`. Transcription uses Gemini multimodal audio. Whisper language follows UI locale / claim text; Fula uses auto-detect.

## Notes

- Keep secrets out of source control.
- Commit only `.env.example` templates without real credentials.
