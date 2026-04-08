# Testing Rules

## Coverage expectations

- New behavior includes at least one test.
- Bug fixes include a regression test.
- Critical paths (auth, claims, AI response flow, email notifications) require integration coverage.

## Test layers

- Unit tests for pure logic and helpers.
- Integration tests for API, database, and provider boundaries.
- End-to-end tests for high-value user journeys only.

## Quality principles

- Prefer deterministic tests with controlled fixtures/mocks.
- Assert observable behavior, not implementation details.
- Keep test setup close to the unit/feature under test.

## Required checks

- `pnpm lint`
- `pnpm typecheck`
- Package-specific test commands for changed scope
