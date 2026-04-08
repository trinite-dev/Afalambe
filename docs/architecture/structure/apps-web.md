# apps/web Structure

Canonical structure for the web application:

```text
apps/web/
  app/
  components/
  features/
  lib/
  server/
  styles/
  tests/
```

## Boundaries

- `components/`: web-app specific UI, not shared package internals.
- `features/`: domain modules for product behavior.
- `server/`: server-only adapters and route-bound logic.
- Shared code should live in `packages/*` when reused across apps.
