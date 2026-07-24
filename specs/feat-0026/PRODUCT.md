# feat-0026: Testing strategy (unit, integration, E2E)

## Summary

Defines **how Afalambe is verified**: unit tests in packages and apps, Playwright E2E smoke tests, and gaps for integration tests covering auth, claims, and AI.

Complements all `feat-*` specs (each TECH file should reference test cases here).

## Problem

Without a testing spec, CI can pass while core flows (French UI, tRPC auth, claim lifecycle) remain untested. E2E tests currently use **English** copy that does not match the **French** product UI.

## Non-goals

- 100% line coverage mandate.
- Load/stress testing (separate ops spec).
- Mocking OpenAI in every unit test (integration optional).

## Test layers

| Layer | Tool | Location | Status |
|-------|------|----------|--------|
| Unit | Node test / Vitest | `packages/trpc`, `packages/emails`, `apps/api`, `apps/web/lib` | Partial |
| Integration | tRPC + test DB | Not present | **Gap** |
| E2E | Playwright | `tests/e2e/` | Partial (smoke only) |

## Use case catalog

| ID | Use case | Status |
|----|----------|--------|
| **UC-T01** | `health.ping` returns ok | Implemented (`packages/trpc/src/index.test.ts`) |
| **UC-T02** | Upload validation rejects oversize MIME | Implemented |
| **UC-T03** | Email template includes OTP | Implemented |
| **UC-T04** | Webhook status mapping | Implemented (`apps/api/src/index.test.ts`) |
| **UC-T05** | Auth pages render (E2E) | **Stale** — expects English labels |
| **UC-T06** | Register → verify → chat (E2E) | **Not implemented** |
| **UC-T07** | Claim create + AI reply (integration) | **Not implemented** |
| **UC-T08** | CI runs `pnpm test` + `test:e2e` on PR | Per repo CI config |

## Acceptance criteria

1. E2E selectors match **French** UI strings (`Se connecter`, `Creer un compte`, etc.).
2. Critical path UC-T06 documented with seed data strategy (test email / Resend sandbox).
3. Each `feat-*` TECH lists at least one manual or automated test case.

## Related

- [feat-0026 TECH](./TECH.md)
- [feat-0033](../feat-0033/PRODUCT.md) — CI commands
