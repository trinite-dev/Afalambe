import test from 'node:test';
import assert from 'node:assert/strict';
import {
    getLocaleFromPathname,
    localizedHref,
    localizedPath,
    stripLocalePrefix,
} from './localized-path';

test('getLocaleFromPathname detects en prefix', () => {
    assert.equal(getLocaleFromPathname('/en'), 'en');
    assert.equal(getLocaleFromPathname('/en/chat'), 'en');
    assert.equal(getLocaleFromPathname('/chat'), 'fr');
    assert.equal(getLocaleFromPathname('/'), 'fr');
});

test('stripLocalePrefix removes /en', () => {
    assert.equal(stripLocalePrefix('/en/chat'), '/chat');
    assert.equal(stripLocalePrefix('/en'), '/');
    assert.equal(stripLocalePrefix('/chat'), '/chat');
});

test('localizedHref adds /en for English only', () => {
    assert.equal(localizedHref('/chat', 'fr'), '/chat');
    assert.equal(localizedHref('/chat', 'en'), '/en/chat');
    assert.equal(localizedHref('/', 'en'), '/en');
    assert.equal(localizedHref('/sign-in?next=/chat', 'en'), '/en/sign-in?next=/chat');
    assert.equal(localizedHref('/demo', 'fr'), '/demo');
    assert.equal(localizedHref('/demo', 'en'), '/en/demo');
});

test('localizedPath switches locale for current pathname', () => {
    assert.equal(localizedPath('/chat', 'en'), '/en/chat');
    assert.equal(localizedPath('/en/chat', 'fr'), '/chat');
});

test('localizedHref keeps claim id under chat', () => {
    assert.equal(localizedHref('/chat/claim-123', 'fr'), '/chat/claim-123');
    assert.equal(localizedHref('/chat/claim-123', 'en'), '/en/chat/claim-123');
    assert.equal(localizedPath('/en/chat/claim-123', 'fr'), '/chat/claim-123');
});
