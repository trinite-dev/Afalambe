import test from 'node:test';
import assert from 'node:assert/strict';

import { DEMO_PAGE_META, DEMO_UI } from './demo-ui';

const DEMO_UI_KEYS = [
    'badge',
    'disclaimer',
    'signUpCta',
    'signInCta',
    'placeholder',
    'reset',
    'examplesTitle',
    'assistantTyping',
    'unavailableTitle',
    'unavailableBody',
    'backHome',
    'composeAria',
    'sendAria',
    'demoDisclaimer',
    'moreOptionsAria',
    'voiceTranscript',
] as const;

test('DEMO_UI has matching keys for fr and en', () => {
    for (const key of DEMO_UI_KEYS) {
        assert.ok(DEMO_UI.fr[key], `missing fr key: ${key}`);
        assert.ok(DEMO_UI.en[key], `missing en key: ${key}`);
    }
});

test('DEMO_PAGE_META has title and description for both locales', () => {
    for (const locale of ['fr', 'en'] as const) {
        assert.ok(DEMO_PAGE_META[locale].title.length > 0);
        assert.ok(DEMO_PAGE_META[locale].description.length > 0);
    }
});
