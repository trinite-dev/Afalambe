# feat-0023: Web API client (tRPC, retries, toasts)

## Summary

The web app communicates with the API through **tRPC + React Query**, with **cookie credentials**, **fetch retry**, and **toast** helpers for user-visible errors.

## Problem

Consistent error UX and session propagation across all pages.

## Components

| Module | Role |
|--------|------|
| `TrpcProvider` | Client + QueryClient |
| `trpc.ts` | React hooks factory |
| `fetch-with-retry.ts` | Network retry |
| `api-toast.ts` | Success/error/info/warning toasts |
| `app-toast-providers.tsx` | Root toast hosts |

## Use case catalog

| ID | Behavior |
|----|----------|
| **UC-TR01** | All mutations show French toast on error |
| **UC-TR02** | Session cookie sent on every tRPC call |
| **UC-TR03** | 401 on protected routes → redirect sign-in (chat) |

## Env

`NEXT_PUBLIC_API_URL`, `NEXT_PUBLIC_APP_URL`.

## Related

- [feat-0023 TECH](./TECH.md)
