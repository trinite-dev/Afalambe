# packages/\* Structure

Canonical package roles:

```text
packages/
  ui/        # shared UI components and styles
  trpc/      # API contracts, helpers, client/server setup
  prisma/    # schema, migrations, and db client
  emails/    # templates and send orchestration
  testing/   # shared test helpers/fixtures
```

## Import direction

- `apps/*` may import from `packages/*`.
- `packages/*` must not import from `apps/*`.
- Cross-package imports should use public exports only.
