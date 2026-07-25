import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { mapWebhookEventToDeliveryStatus, chatUploadLimits } from './index';

describe('api-runtime exports', () => {
    it('exposes chat upload limits', () => {
        assert.equal(chatUploadLimits.maxBytes > 0, true);
        assert.equal(chatUploadLimits.allowedMimeTypes.length > 0, true);
    });

    it('maps Resend webhook event types', () => {
        assert.equal(mapWebhookEventToDeliveryStatus('email.delivered'), 'delivered');
        assert.equal(mapWebhookEventToDeliveryStatus('email.bounced'), 'bounced');
        assert.equal(mapWebhookEventToDeliveryStatus('email.failed'), 'failed');
        assert.equal(mapWebhookEventToDeliveryStatus('email.complained'), 'complained');
        assert.equal(mapWebhookEventToDeliveryStatus('email.opened'), 'received');
    });
});
