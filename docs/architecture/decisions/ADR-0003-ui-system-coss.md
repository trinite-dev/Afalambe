# ADR-0003: Shared UI System with COSS

- Status: accepted
- Date: 2026-04-08
- Owners: project maintainer

## Context

The project needs a consistent UI foundation with reusable components and predictable styling across apps.

## Decision

- Use `packages/ui` as the shared UI package.
- Use COSS-generated primitives as the base component layer.
- Consume shared components through package exports.

## Consequences

- Faster UI development and consistency across screens.
- Requires controlled updates when regenerating components.

## Alternatives considered

- App-local component duplication (rejected for consistency and maintenance reasons).
