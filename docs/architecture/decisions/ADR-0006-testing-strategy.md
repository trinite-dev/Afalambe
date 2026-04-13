# ADR-0006: Testing Strategy

- Status: accepted
- Date: 2026-04-08
- Owners: project maintainer

## Context

The project requires a practical testing approach that balances speed and reliability for a single-maintainer workflow.

## Decision

- Use layered testing:
    - Unit tests for pure logic
    - Integration tests for API/data/provider boundaries
    - Focused end-to-end tests for critical user journeys
- Require regression tests for bug fixes.
- Enforce lint and typecheck as baseline quality gates.

## Consequences

- Improves release confidence without excessive process overhead.
- Requires consistent test ownership as features are added.

## Alternatives considered

- End-to-end heavy strategy (rejected for maintenance cost).
