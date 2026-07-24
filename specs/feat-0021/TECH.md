# feat-0021: Tech Spec — Rate limiting

## Module

[`packages/trpc/src/rate-limit.ts`](../../packages/trpc/src/rate-limit.ts):

- `checkRateLimit(key, maxRequests, windowMs)`
- `resetRateLimit(key?)` — dev helper
- `isRateLimitDisabled()` — `NODE_ENV !== 'production'` or `RATE_LIMIT_DISABLED=true`

## Call sites

- [`packages/trpc/src/routers/auth.ts`](../../packages/trpc/src/routers/auth.ts)
- [`packages/trpc/src/routers/claim.ts`](../../packages/trpc/src/routers/claim.ts)

## Env

`NODE_ENV`, `RATE_LIMIT_DISABLED`.

## Related

- [feat-0002 TECH](../feat-0002/TECH.md)
