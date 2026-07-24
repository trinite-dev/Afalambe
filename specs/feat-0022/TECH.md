# feat-0022: Tech Spec — Database

## Package

[`packages/prisma`](../../packages/prisma):

- [`schema.prisma`](../../packages/prisma/schema.prisma)
- [`prisma.config.ts`](../../packages/prisma/prisma.config.ts) — loads `apps/api/.env`, prefers `DIRECT_URL` for migrate
- [`src/index.ts`](../../packages/prisma/src/index.ts) — singleton `PrismaClient` + pg adapter

## Migrations

| Migration | Purpose |
|-----------|---------|
| `20260428120500_add_resend_email_models` | Email tables |
| `20260512120000_add_factcheck_fields` | Claim metadata, verdict enums |

## Env

| Variable | Use |
|----------|-----|
| `DATABASE_URL` | API runtime (pooler recommended) |
| `DIRECT_URL` | `prisma migrate` |

## Connection pitfalls

- URL-encode `@` in passwords as `%40`.
- Pooler user: `postgres.{projectRef}` on port 6543.
- Direct host: `db.{projectRef}.supabase.co` on 5432.

## API env loading

[`apps/api/src/load-env.ts`](../../apps/api/src/load-env.ts) must run before Prisma import.

## Related

- [feat-0001 TECH](../feat-0001/TECH.md)
