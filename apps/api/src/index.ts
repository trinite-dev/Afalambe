import './load-env.js';
import { createServer } from 'node:http';
import { WebSocketServer, type WebSocket } from 'ws';
import { createHTTPHandler } from '@trpc/server/adapters/standalone';
import type { CreateHTTPContextOptions } from '@trpc/server/adapters/standalone';
import { appRouter } from '@afalambe/trpc';
import { prisma } from '@afalambe/prisma';
import {
    buildClearSessionCookie,
    buildSessionCookie,
    cleanupOrphans,
    createTrpcContext,
    hashToken,
    mapWebhookEventToDeliveryStatus,
    parseCookies,
    processResendWebhook,
    SESSION_COOKIE,
    verifyResendWebhookSignature,
    chatUploadLimits,
} from '@afalambe/api-runtime';

/** Local Next.js is pinned to 3002; keep 3000/3001 for older tabs and stray processes. */
const DEFAULT_DEV_WEB_ORIGINS = [
    'http://localhost:3000',
    'http://localhost:3001',
    'http://localhost:3002',
    'http://127.0.0.1:3000',
    'http://127.0.0.1:3001',
    'http://127.0.0.1:3002',
];

function getCorsAllowedOrigins(): string[] {
    const primary = process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3002';
    const extra = (process.env.CORS_ALLOWED_ORIGINS ?? '')
        .split(',')
        .map((value) => value.trim())
        .filter(Boolean);
    return [...new Set([primary, ...extra, ...DEFAULT_DEV_WEB_ORIGINS])];
}

function applyCorsHeaders(
    req: { headers: { origin?: string | string[] } },
    res: { setHeader: (name: string, value: string) => void },
): void {
    const allowed = getCorsAllowedOrigins();
    const originHeader = req.headers.origin;
    const origin = Array.isArray(originHeader) ? originHeader[0] : originHeader;
    const matched = origin && allowed.includes(origin) ? origin : allowed[0];
    res.setHeader('Access-Control-Allow-Origin', matched ?? 'http://localhost:3002');
    res.setHeader('Access-Control-Allow-Credentials', 'true');
}

async function createContext(opts: CreateHTTPContextOptions) {
    return createTrpcContext({
        cookies: {
            getCookieHeader: () => opts.req.headers.cookie,
            setSessionCookie: (token, expiresAt) => {
                opts.res.setHeader('Set-Cookie', buildSessionCookie(token, expiresAt));
            },
            clearSessionCookie: () => {
                opts.res.setHeader('Set-Cookie', buildClearSessionCookie());
            },
        },
        broadcastToClaimSubscribers,
    });
}

const trpcHandler = createHTTPHandler({
    router: appRouter,
    createContext,
});

async function readBody(req: import('node:http').IncomingMessage): Promise<string> {
    return new Promise((resolve, reject) => {
        const chunks: Buffer[] = [];
        req.on('data', (chunk) => chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk)));
        req.on('end', () => resolve(Buffer.concat(chunks).toString('utf8')));
        req.on('error', reject);
    });
}

async function handleResendWebhook(
    req: import('node:http').IncomingMessage,
    res: import('node:http').ServerResponse,
): Promise<void> {
    if (req.method !== 'POST') {
        res.statusCode = 405;
        res.end('Method not allowed');
        return;
    }
    const signature = req.headers['x-resend-signature'];
    const signatureValue = Array.isArray(signature) ? signature[0] : signature;
    if (!verifyResendWebhookSignature(signatureValue ?? null)) {
        res.statusCode = 401;
        res.end('Invalid signature');
        return;
    }

    const raw = await readBody(req);
    const result = await processResendWebhook(raw);
    res.statusCode = result.status;
    res.end(result.ok ? 'ok' : result.body);
}

const ENV_LABELS: Record<string, { label: string; color: string; bg: string }> = {
    production: { label: 'PRODUCTION', color: '#dc2626', bg: '#fef2f2' },
    staging: { label: 'STAGING', color: '#d97706', bg: '#fffbeb' },
    development: { label: 'DEVELOPMENT', color: '#2563eb', bg: '#eff6ff' },
};

function getEnvironment(): string {
    const env = (process.env.NODE_ENV ?? 'development').toLowerCase();
    if (env === 'production') return 'production';
    if (env === 'staging') return 'staging';
    return 'development';
}

function buildHealthHtml(environment: string): string {
    const env = ENV_LABELS[environment] ?? ENV_LABELS['development']!;
    const now = new Date().toLocaleString('en-GB', {
        dateStyle: 'long',
        timeStyle: 'medium',
    });
    const uptimeSeconds = Math.floor(process.uptime());
    const uptimeDisplay =
        uptimeSeconds < 60
            ? `${uptimeSeconds}s`
            : uptimeSeconds < 3600
              ? `${Math.floor(uptimeSeconds / 60)}m ${uptimeSeconds % 60}s`
              : `${Math.floor(uptimeSeconds / 3600)}h ${Math.floor((uptimeSeconds % 3600) / 60)}m`;

    return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Afalambe API - Health Check</title>
  <style>
    body { font-family: system-ui, sans-serif; padding: 2rem; }
    .env-pill { color: ${env.color}; background: ${env.bg}; padding: 0.25rem 0.5rem; border-radius: 0.5rem; }
  </style>
</head>
<body>
  <h1>Afalambe API</h1>
  <p>Status: 200 OK · Environment: <span class="env-pill">${env.label}</span> · Uptime: ${uptimeDisplay}</p>
  <p>Generated at ${now}</p>
</body>
</html>`;
}

export const server = createServer(async (req, res) => {
    if (!req.url) {
        res.statusCode = 400;
        res.end('Bad request');
        return;
    }

    if (req.url === '/' && req.method === 'GET') {
        const environment = getEnvironment();
        const html = buildHealthHtml(environment);
        res.statusCode = 200;
        res.setHeader('Content-Type', 'text/html; charset=utf-8');
        res.end(html);
        return;
    }

    if (req.url.startsWith('/webhooks/resend')) {
        await handleResendWebhook(req, res);
        return;
    }

    if (req.method === 'OPTIONS') {
        applyCorsHeaders(req, res);
        res.setHeader('Access-Control-Allow-Headers', 'content-type, x-trpc-source');
        res.setHeader('Access-Control-Allow-Methods', 'GET,POST,OPTIONS');
        res.statusCode = 204;
        res.end();
        return;
    }

    applyCorsHeaders(req, res);
    const originalUrl = req.url;
    if (req.url?.startsWith('/trpc')) {
        req.url = req.url.slice(5) || '/';
    }
    trpcHandler(req, res);
    req.url = originalUrl;
});

interface WSClient {
    ws: WebSocket;
    userId: string;
    subscribedClaimIds: Set<string>;
}

interface WSMessage {
    type: string;
    payload: Record<string, unknown>;
    ts: number;
    seq?: number;
}

const wss = new WebSocketServer({ noServer: true });
const wsClients = new Map<string, WSClient>();
let globalSeq = 0;

function broadcastToClaimSubscribers(claimId: string, msg: Omit<WSMessage, 'ts' | 'seq'>): void {
    globalSeq += 1;
    const frame = JSON.stringify({ ...msg, ts: Date.now(), seq: globalSeq });
    for (const client of wsClients.values()) {
        if (client.subscribedClaimIds.has(claimId) && client.ws.readyState === 1) {
            client.ws.send(frame);
        }
    }
}

export { broadcastToClaimSubscribers };

const HEARTBEAT_INTERVAL = 30_000;

function attachWebSocketUpgrade(): void {
    server.on('upgrade', async (req, socket, head) => {
        try {
            const cookies = parseCookies(req.headers.cookie);
            const rawToken = cookies[SESSION_COOKIE];
            if (!rawToken) {
                socket.write('HTTP/1.1 401 Unauthorized\r\n\r\n');
                socket.destroy();
                return;
            }

            const tokenHash = hashToken(rawToken);
            const session = await prisma.session.findFirst({
                where: { tokenHash, expiresAt: { gt: new Date() } },
                include: { user: true },
            });
            if (!session) {
                socket.write('HTTP/1.1 401 Unauthorized\r\n\r\n');
                socket.destroy();
                return;
            }

            wss.handleUpgrade(req, socket, head, (ws: WebSocket) => {
                const client: WSClient = {
                    ws,
                    userId: session.user.id,
                    subscribedClaimIds: new Set(),
                };
                wsClients.set(session.user.id, client);

                ws.on('message', (raw: Buffer | ArrayBuffer | Buffer[]) => {
                    try {
                        const msg = JSON.parse(raw.toString());
                        if (msg.type === 'subscribe' && Array.isArray(msg.payload?.claimIds)) {
                            for (const id of msg.payload.claimIds) {
                                client.subscribedClaimIds.add(id);
                            }
                        }
                        if (msg.type === 'unsubscribe' && Array.isArray(msg.payload?.claimIds)) {
                            for (const id of msg.payload.claimIds) {
                                client.subscribedClaimIds.delete(id);
                            }
                        }
                        if (msg.type === 'ping') {
                            ws.send(JSON.stringify({ type: 'pong', payload: {}, ts: Date.now() }));
                        }
                    } catch {
                        // ignore malformed messages
                    }
                });

                ws.on('close', () => {
                    wsClients.delete(session.user.id);
                });
            });
        } catch {
            socket.write('HTTP/1.1 500 Internal Server Error\r\n\r\n');
            socket.destroy();
        }
    });

    setInterval(() => {
        for (const client of wsClients.values()) {
            if (client.ws.readyState === 1) {
                client.ws.ping();
            }
        }
    }, HEARTBEAT_INTERVAL);
}

const port = Number(process.env.API_PORT ?? 4000);
const isMainModule = process.argv[1]
    ? import.meta.url === new URL(`file://${process.argv[1]}`).href
    : false;

if (isMainModule) {
    attachWebSocketUpgrade();

    const shutdown = (): void => {
        server.close(() => {
            process.exit(0);
        });
        setTimeout(() => process.exit(0), 2_000).unref();
    };
    process.once('SIGTERM', shutdown);
    process.once('SIGINT', shutdown);

    server.on('error', (err: NodeJS.ErrnoException) => {
        if (err.code === 'EADDRINUSE') {
            console.error(
                `@afalambe/api: port ${port} is already in use. Stop the other process (lsof -iTCP:${port} -sTCP:LISTEN) or set API_PORT.`,
            );
            process.exit(1);
        }
        console.error('@afalambe/api listen error', err);
        process.exit(1);
    });

    server.listen(port, () => {
        console.log(`@afalambe/api listening on :${port}`);
    });

    setInterval(async () => {
        try {
            const result = await cleanupOrphans();
            if (result.deleted > 0) {
                console.log(`Orphan cleanup: checked ${result.checked}, deleted ${result.deleted}`);
            }
        } catch (err) {
            console.error('Orphan cleanup failed:', err);
        }
    }, 60 * 60 * 1_000);
}

export { chatUploadLimits, mapWebhookEventToDeliveryStatus };
