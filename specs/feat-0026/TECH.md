# feat-0026: Tech Spec — Testing

## Commands

```bash
pnpm test:unit          # trpc, emails, prisma, ui, testing
pnpm test:integration   # api, web (when added)
pnpm test:e2e           # Playwright
pnpm --filter @afalambe/api test
```

## Playwright

[`playwright.config.ts`](../../playwright.config.ts) — `baseURL` from `NEXT_PUBLIC_APP_URL`, chromium only.

[`tests/e2e/auth-pages.spec.ts`](../../tests/e2e/auth-pages.spec.ts) — **must update**:

| Current (wrong) | Target (French) |
|-----------------|-----------------|
| `Sign in` | `Se connecter` |
| `Create account` | `Creer un compte` |
| `Send reset link` | Match forgot-password button copy |

## Unit test inventory

| Package | File | Covers |
|---------|------|--------|
| `@afalambe/trpc` | `index.test.ts` | `health.ping` |
| `@afalambe/trpc` | `upload-validation.test.ts` | MIME/size |
| `@afalambe/emails` | `index.test.ts` | Provider, OTP in text |
| `@afalambe/api` | `index.test.ts` | `mapWebhookEventToDeliveryStatus` |
| `@afalambe/web` | `image-validation.test.ts` | Client image rules |

## Recommended integration tests (gap)

1. Spin API with test `DATABASE_URL` (or Prisma test container).
2. `auth.register` → `auth.verifyEmail` with known OTP fixture.
3. `claim.create` + mock `generateAssistantText` in context.

## `@afalambe/testing`

[`packages/testing`](../../packages/testing) — stub package; target home for shared fixtures and tRPC test context factory.

## Related

- [feat-0027 TECH](../feat-0027/TECH.md) — no secrets in client bundles (test assertions)
