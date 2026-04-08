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

## packages/emails (Resend)

- `RESEND_API_KEY`: Resend API key
- `EMAIL_FROM`: verified sender email

## packages/prisma

- `DATABASE_URL`: Prisma datasource URL

## AI pipeline

- `AI_PROVIDER`: provider identifier
- `AI_MODEL`: model name/version
- `AI_API_KEY`: provider API key

## Notes

- Keep secrets out of source control.
- Commit only `.env.example` templates without real credentials.
