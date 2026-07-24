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
- `EMAIL_FROM`: verified sender address for transactional sends
- `RESEND_WEBHOOK_SIGNING_SECRET`: shared secret used to verify Resend webhook requests

## packages/emails (Resend)

- `RESEND_API_KEY`: Resend API key
- `EMAIL_FROM`: verified sender email

## packages/prisma

- `DATABASE_URL`: Prisma datasource URL

## AI pipeline

- `AI_PROVIDER`: `openai` (default) or `gemini` / `google`
- `AI_MODEL`: model name/version (`gpt-4.1-mini` for OpenAI, `gemini-flash-latest` for Gemini)
- `AI_API_KEY`: provider API key (server only; used by `claim.generateAssistantReply`, metadata extraction, and transcription)
- `NEXT_PUBLIC_OPENAI_API_KEY`: **not used** — voice transcription is proxied via API (`claim.transcribeAudio`) with server `AI_API_KEY` ([feat-0015](../../specs/feat-0015/PRODUCT.md))

When `AI_PROVIDER=gemini`, chat and metadata use Google Generative Language `generateContent`. Transcription uses Gemini multimodal audio.

## Notes

- Keep secrets out of source control.
- Commit only `.env.example` templates without real credentials.
