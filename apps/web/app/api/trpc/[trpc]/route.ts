import { fetchRequestHandler } from '@trpc/server/adapters/fetch';
import { appRouter } from '@afalambe/trpc';

import { createNextTrpcContext, withSetCookieHeaders } from '@/server/trpc-context';

export const runtime = 'nodejs';
export const maxDuration = 60;

async function handler(req: Request): Promise<Response> {
    const { ctx, pendingCookies } = await createNextTrpcContext(req);
    const response = await fetchRequestHandler({
        endpoint: '/api/trpc',
        req,
        router: appRouter,
        createContext: () => ctx,
    });
    return withSetCookieHeaders(response, pendingCookies);
}

export { handler as GET, handler as POST };
