# feat-0023: Tech Spec — Web tRPC client

## Provider

[`apps/web/components/trpc-provider.tsx`](../../apps/web/components/trpc-provider.tsx):

```ts
httpBatchLink({
  url: `${apiUrl}/trpc`,
  fetch: (url, options) => fetchWithRetry(url, { ...options, credentials: 'include' }),
})
```

## Types

`AppRouter` imported from `@afalambe/trpc` for end-to-end typing.

## Toast API

[`apps/web/lib/api-toast.ts`](../../apps/web/lib/api-toast.ts) — `notifyApiError`, `notifyApiException`, etc.

## Related

- [feat-0001 TECH](../feat-0001/TECH.md)
- [feat-0005 TECH](../feat-0005/TECH.md)
