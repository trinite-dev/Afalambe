import { cleanupOrphans } from '@afalambe/api-runtime';

export const runtime = 'nodejs';
export const maxDuration = 60;

function authorizeCron(req: Request): boolean {
    const secret = process.env.CRON_SECRET;
    if (!secret) return false;
    const auth = req.headers.get('authorization');
    if (auth === `Bearer ${secret}`) return true;
    // Vercel Cron may send this header on Pro plans.
    const cronHeader = req.headers.get('x-vercel-cron-secret');
    if (cronHeader && cronHeader === secret) return true;
    return false;
}

async function runCleanup(req: Request): Promise<Response> {
    if (process.env.ORPHAN_CLEANUP_DISABLED === 'true') {
        return Response.json({ ok: true, skipped: true, reason: 'ORPHAN_CLEANUP_DISABLED' });
    }
    if (!authorizeCron(req)) {
        return new Response('Unauthorized', { status: 401 });
    }

    try {
        const result = await cleanupOrphans();
        return Response.json({ ok: true, ...result });
    } catch (error) {
        console.error('[cron] cleanup-orphans failed', error);
        return Response.json({ ok: false, error: 'cleanup_failed' }, { status: 500 });
    }
}

export async function GET(req: Request): Promise<Response> {
    return runCleanup(req);
}

export async function POST(req: Request): Promise<Response> {
    return runCleanup(req);
}
