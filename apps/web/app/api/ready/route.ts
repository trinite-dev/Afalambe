import { prisma } from '@afalambe/prisma';

export const runtime = 'nodejs';

export async function GET(): Promise<Response> {
    try {
        await prisma.$queryRaw`SELECT 1`;
        return Response.json({ ok: true, ready: true });
    } catch (error) {
        console.error('[ready] database check failed', error);
        return Response.json({ ok: false, ready: false }, { status: 503 });
    }
}
