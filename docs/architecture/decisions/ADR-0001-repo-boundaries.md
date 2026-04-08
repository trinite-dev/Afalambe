# ADR-0001: Repository Boundaries

- Status: accepted
- Date: 2026-04-08
- Owners: project maintainer

## Context

The repository is a pnpm monorepo and currently has a shared UI package. App folders are planned (`apps/web`, `apps/api`) and boundaries are needed before implementation scales.

## Decision

- Keep `apps/*` for deployable applications.
- Keep `packages/*` for reusable shared modules.
- Route cross-cutting concerns through package exports, not deep imports.

## Consequences

- Improves modularity and long-term maintainability.
- Requires explicit public exports and boundary discipline.

## Alternatives considered

- Single app repo without packages (rejected for reuse and scaling needs).
