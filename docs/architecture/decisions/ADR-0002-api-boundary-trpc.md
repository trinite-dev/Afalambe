# ADR-0002: API Boundary with tRPC

- Status: accepted
- Date: 2026-04-08
- Owners: project maintainer

## Context

The project needs typed API contracts between web and backend while moving quickly in a TypeScript stack.

## Decision

- Use tRPC as the API layer.
- Use Zod for input validation on all procedures.
- Keep routers domain-scoped and procedures thin.

## Consequences

- End-to-end type safety for web and server.
- Reduced API drift between client and backend.
- Requires disciplined schema and error contract management.

## Alternatives considered

- REST with manual typing (rejected due to higher contract drift risk).
