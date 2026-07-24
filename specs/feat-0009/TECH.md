# feat-0009: Tech Spec — Realtime

## Server

[`apps/api/src/index.ts`](../../apps/api/src/index.ts):

- `WebSocketServer` with `noServer: true`
- Upgrade: validate session cookie → attach `WSClient` with `subscribedClaimIds`
- `broadcastToClaimSubscribers(claimId, msg)` — injected into tRPC context

Message frame: `{ type, payload, ts, seq }`.

## Client

[`apps/web/hooks/use-realtime.ts`](../../apps/web/hooks/use-realtime.ts) — connects to API URL WebSocket; subscribe on `activeThreadId`.

## Auth

Same `AUTH_COOKIE_NAME` as HTTP; 401 on upgrade if missing/invalid session.

## Env

`NEXT_PUBLIC_API_URL` — WS origin (typically `ws://localhost:4000`).

## Known gaps

| Gap | Notes |
|-----|-------|
| No server typing events | Client handles typing messages unused |
| Single connection per userId map | Last connection wins |

## Related

- [feat-0006 TECH](../feat-0006/TECH.md)
