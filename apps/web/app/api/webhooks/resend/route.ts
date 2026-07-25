import {
    processResendWebhook,
    verifyResendWebhookSignature,
} from '@afalambe/api-runtime';

export const runtime = 'nodejs';

export async function POST(req: Request): Promise<Response> {
    const signature = req.headers.get('x-resend-signature');
    if (!verifyResendWebhookSignature(signature)) {
        return new Response('Invalid signature', { status: 401 });
    }

    const raw = await req.text();
    const result = await processResendWebhook(raw);
    if (!result.ok) {
        return new Response(result.body, { status: result.status });
    }
    return new Response('ok', { status: 200 });
}
