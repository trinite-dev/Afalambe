# Environment Contract

This document defines required environment variables by runtime.

## apps/web

- `NEXT_PUBLIC_APP_URL`: public application URL
- `NEXT_PUBLIC_API_URL`: API endpoint used by web client

## apps/api

- `API_PORT`: server port
- `DATABASE_URL`: Postgres connection string
- `SUPABASE_URL`: Supabase project URL
- `SUPABASE_ANON_KEY`: Supabase anon key
- `SUPABASE_SERVICE_ROLE_KEY`: Supabase service role key
- `SUPABASE_STORAGE_BUCKET_CHAT_UPLOADS`: storage bucket for chat image uploads
- `CHAT_IMAGE_MAX_BYTES`: max image upload size in bytes
- `CHAT_ALLOWED_IMAGE_MIME_TYPES`: comma-separated allowlist for image mimes
- `AUTH_SECRET`: documented in templates; **unused in application code** (see [feat-0027](../feat-0027/PRODUCT.md))
- `AUTH_COOKIE_NAME`: HTTP-only session cookie name
- `AUTH_COOKIE_SECURE`: set `true` in production
- `RESEND_API_KEY`: Resend API key for transactional sends
- `EMAIL_FROM`: verified sender address for transactional sends. Must use a domain verified in Resend for production. For local sandbox only, `beth.t@example.com` (recipient restrictions apply).
- `EMAIL_DEV_LOG_OTP`: when `true` and not production, log verification OTP to the API console if Resend fails
- `EMAIL_DEV_EXPOSE_OTP`: when `true` and not production, include `devOtp` on register response (local UI only; never enable in production)
- `RESEND_WEBHOOK_SIGNING_SECRET`: shared secret used to verify Resend webhook requests

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

Dev web is pinned to **http://localhost:3002** (`next dev -p 3002`). Set `NEXT_PUBLIC_APP_URL` accordingly in `apps/web/.env` and `apps/api/.env`. If Turbo still shows web as failed after a port change, restart `pnpm dev:all` and clear a stale `apps/web/.next` if duplicate Next processes fought over cache.

## AI pipeline

- `AI_PROVIDER`: `openai` (default) or `gemini` / `google`
- `AI_MODEL`: model name/version (`gpt-4.1-mini` for OpenAI, `gemini-flash-latest` for Gemini)
- `AI_API_KEY`: provider API key (server only; used by `claim.generateAssistantReply`, metadata extraction, and transcription)
- `NEXT_PUBLIC_OPENAI_API_KEY`: **not used** — voice transcription is proxied via API (`claim.transcribeAudio`) with server `AI_API_KEY` ([feat-0015](../../specs/feat-0015/PRODUCT.md))

When `AI_PROVIDER=gemini`, chat and metadata use Google Generative Language `generateContent`. Transcription uses Gemini multimodal audio.

## Notes

- Keep secrets out of source control.
- Commit only `.env.example` templates without real credentials.
