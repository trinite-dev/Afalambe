# apps/api Structure

Canonical structure for the API application:

```text
apps/api/
  src/
    routers/
    services/
    repositories/
    integrations/
    middleware/
    context/
    schemas/
    utils/
  tests/
```

## Boundaries

- `routers/`: transport and contract boundary.
- `services/`: business orchestration and rules.
- `repositories/`: database access abstractions.
- `integrations/`: external providers (AI, email, messaging, etc.).
