# feat-0033: Tech Spec — Platform ops

## Monorepo

| File | Role |
|------|------|
| [`package.json`](../../package.json) | Root scripts |
| [`pnpm-workspace.yaml`](../../pnpm-workspace.yaml) | Workspace packages |
| [`turbo.json`](../../turbo.json) | `dev`, `build`, `test`, `lint` |

## Apps

| Package | Dev | Port |
|---------|-----|------|
| `@afalambe/web` | `next dev` | 3000 |
| `@afalambe/api` | `tsx watch src/index.ts` | `API_PORT` 4000 |

API must load [`load-env.ts`](../../apps/api/src/load-env.ts) first.

## Build

```bash
pnpm build          # turbo build all
pnpm typecheck      # turbo typecheck
pnpm lint           # turbo lint
```

## Background jobs

| Job | Interval | Module |
|-----|----------|--------|
| Orphan cleanup | 60 min | `cleanup-orphans.ts` |
| WS heartbeat ping | 30 sec | `index.ts` |

## CI (recommended)

```bash
pnpm install --frozen-lockfile
pnpm typecheck
pnpm test:unit
pnpm test:e2e   # requires running web+api or webServer in playwright config
```

**Gap:** Playwright `webServer` block not in config — start services manually or add.

## Prisma config

[`packages/prisma/prisma.config.ts`](../../packages/prisma/prisma.config.ts) loads `../../apps/api/.env`.

## Related

- [feat-0022 TECH](../feat-0022/TECH.md)
- [feat-0026 TECH](../feat-0026/TECH.md)
