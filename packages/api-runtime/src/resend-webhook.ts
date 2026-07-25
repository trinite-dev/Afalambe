import { createHash } from 'node:crypto';
import { prisma } from '@afalambe/prisma';

export function mapWebhookEventToDeliveryStatus(eventType: string): string {
    if (eventType.includes('delivered')) return 'delivered';
    if (eventType.includes('bounced')) return 'bounced';
    if (eventType.includes('failed')) return 'failed';
    if (eventType.includes('complained')) return 'complained';
    return 'received';
}

export type ResendWebhookResult =
    | { ok: true; status: 200 }
    | { ok: false; status: 400 | 401 | 405; body: string };

/**
 * Process a Resend webhook body. Signature must already be verified by the caller
 * against `RESEND_WEBHOOK_SIGNING_SECRET` (shared-secret header check).
 */
export async function processResendWebhook(rawBody: string): Promise<ResendWebhookResult> {
    let payload: {
        id?: string;
        type?: string;
        data?: { email_id?: string };
    };
    try {
        payload = JSON.parse(rawBody) as typeof payload;
    } catch {
        return { ok: false, status: 400, body: 'Invalid JSON' };
    }

    const eventId = payload.id ?? `unknown-${createHash('sha256').update(rawBody).digest('hex')}`;
    const eventType = payload.type ?? 'unknown';
    const payloadHash = createHash('sha256').update(rawBody).digest('hex');

    const existing = await prisma.resendWebhookEvent.findUnique({ where: { eventId } });
    if (existing) {
        return { ok: true, status: 200 };
    }

    await prisma.resendWebhookEvent.create({
        data: {
            eventId,
            eventType,
            payloadHash,
        },
    });

    const messageId = payload.data?.email_id;
    if (messageId) {
        const status = mapWebhookEventToDeliveryStatus(eventType);
        await prisma.emailDelivery.updateMany({
            where: { providerMessageId: messageId },
            data: {
                status,
                lastAttemptAt: new Date(),
            },
        });
    }

    return { ok: true, status: 200 };
}

export function verifyResendWebhookSignature(signatureHeader: string | null): boolean {
    const secret = process.env.RESEND_WEBHOOK_SIGNING_SECRET ?? '';
    if (!secret) return false;
    return signatureHeader === secret;
}
