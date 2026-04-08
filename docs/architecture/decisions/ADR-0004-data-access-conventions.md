# ADR-0004: Data Access Conventions (Prisma + Supabase)

- Status: accepted
- Date: 2026-04-08
- Owners: project maintainer

## Context

The project uses Supabase Postgres as the database provider and Prisma for application-level data access.

## Decision

- Use Prisma schema and client as the primary data access layer.
- Keep Supabase as database platform and service ecosystem.
- Use explicit query selection and safe migration practices.

## Consequences

- Strong developer ergonomics and type safety in data access.
- Requires clear ownership of migration and schema workflows.

## Alternatives considered

- Direct SQL-only access in app layers (rejected for maintainability).
