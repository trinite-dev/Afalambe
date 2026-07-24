# feat-0001: API platform (HTTP server, health, tRPC mount)

## Summary

The **Afalambe API** (`apps/api`) is a standalone Node.js HTTP server that exposes typed business logic via **tRPC**, a public **health dashboard** at the root URL, **CORS** for the web app, a **Resend webhook** route, and **WebSocket** upgrades for realtime. It is the single backend entry point for authenticated chat and auth flows.

Complements [feat-0017](../feat-0017/PRODUCT.md) (web client), [feat-0020](../feat-0020/PRODUCT.md) (database), and legacy [`api.md`](../api.md).

## Problem

Without a documented platform boundary, engineers cannot tell which routes are tRPC vs raw HTTP, how env is loaded at startup, or what must run before feature work (migrations, CORS, cookie domain).

## Non-goals

- Public REST/GraphQL API in MVP.
- Multi-region deployment topology (document separately when needed).
- Kubernetes/infra manifests (out of scope).

## Actors

| Actor | Description |
|-------|-------------|
| **Browser (web app)** | Calls `/trpc/*` with credentials; reads `GET /` for ops checks. |
| **Resend** | POSTs delivery events to `/webhooks/resend`. |
| **Operator** | Opens health page to confirm API process is alive. |

## Use case catalog

| ID | Use case | Preconditions | Main flow | Postcondition |
|----|----------|---------------|-----------|---------------|
| **UC-H01** | Health check (HTML) | API running | `GET http://localhost:4000/` | 200 HTML dashboard (name, version, env, uptime) |
| **UC-H02** | Health ping (tRPC) | API running | `health.ping` | `{ ok: true }` |
| **UC-H03** | CORS preflight | Browser from `NEXT_PUBLIC_APP_URL` | `OPTIONS` to `/trpc/*` | 204 with Allow-Origin + credentials |
| **UC-H04** | tRPC procedure call | Valid path | `POST/GET /trpc/{procedure}` | JSON tRPC response |
| **UC-H05** | Invalid tRPC path | Unknown segment | Request without `/trpc` strip fix | 404 NOT_FOUND (must mount at `/trpc`) |
| **UC-H06** | Load env at boot | `apps/api/.env` present | Process starts via `load-env.ts` first | `DATABASE_URL`, Resend, Supabase vars available before Prisma |

## Behavior (product rules)

1. API listens on `API_PORT` (default **4000**).
2. Health page is **public** (no auth).
3. CORS `Access-Control-Allow-Origin` must match web origin (`NEXT_PUBLIC_APP_URL`).
4. Session cookies require `credentials: 'include'` on the web client.
5. tRPC paths are served under `/trpc`; server strips prefix before the standalone handler.

## Acceptance criteria

1. `GET /` returns branded HTML health dashboard in development and production.
2. `health.ping` succeeds from web or curl.
3. Browser sign-in from `localhost:3000` can call API without CORS errors when env is aligned.
4. `.env` is loaded from `apps/api/.env` before any Prisma import.

## Related

- [feat-0001 TECH](./TECH.md)
- [feat-0002](../feat-0002/PRODUCT.md) — auth uses this server
- [feat-0009](../feat-0009/PRODUCT.md) — WebSocket on same server
