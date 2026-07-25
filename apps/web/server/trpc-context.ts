import {
    buildClearSessionCookie,
    buildSessionCookie,
    createTrpcContext,
    type CookieJar,
} from '@afalambe/api-runtime';

/**
 * Collect Set-Cookie values during a tRPC request, then append them to the Response.
 * The standalone Node adapter writes cookies on `res`; the fetch adapter cannot.
 */
export function createPendingCookieJar(req: Request): {
    jar: CookieJar;
    pendingCookies: string[];
} {
    const pendingCookies: string[] = [];
    const jar: CookieJar = {
        getCookieHeader: () => req.headers.get('cookie') ?? undefined,
        setSessionCookie: (token, expiresAt) => {
            pendingCookies.push(buildSessionCookie(token, expiresAt));
        },
        clearSessionCookie: () => {
            pendingCookies.push(buildClearSessionCookie());
        },
    };
    return { jar, pendingCookies };
}

export async function createNextTrpcContext(req: Request) {
    const { jar, pendingCookies } = createPendingCookieJar(req);
    const ctx = await createTrpcContext({
        cookies: jar,
        // No WS on Vercel — clients poll / invalidate instead.
        broadcastToClaimSubscribers: undefined,
    });
    return { ctx, pendingCookies };
}

export function withSetCookieHeaders(response: Response, pendingCookies: string[]): Response {
    if (pendingCookies.length === 0) return response;
    const headers = new Headers(response.headers);
    for (const cookie of pendingCookies) {
        headers.append('Set-Cookie', cookie);
    }
    return new Response(response.body, {
        status: response.status,
        statusText: response.statusText,
        headers,
    });
}
