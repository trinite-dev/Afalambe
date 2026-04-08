# ADR-0005: Email Delivery with Resend

- Status: accepted
- Date: 2026-04-08
- Owners: project maintainer

## Context

The project needs reliable transactional email delivery for product flows and operational notifications.

## Decision

- Use Resend as the default email provider.
- Version email templates and track ownership in code.
- Use idempotency for retriable sends and a defined retry/backoff policy.
- Log and monitor delivery failures with clear fallback behavior.

## Consequences

- Fast implementation and modern API ergonomics.
- Requires explicit delivery observability and provider outage handling.

## Alternatives considered

- SMTP-only provider setup (rejected for slower iteration and weaker API ergonomics).
