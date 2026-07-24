import test from 'node:test';
import assert from 'node:assert/strict';
import { getLandingContent } from './landing-content';

test('landing FAQ count matches between locales', () => {
    const fr = getLandingContent('fr');
    const en = getLandingContent('en');

    assert.equal(fr.faqItems.length, en.faqItems.length);
    assert.equal(fr.steps.length, en.steps.length);
    assert.equal(fr.featureCards.length, en.featureCards.length);
    assert.equal(fr.footer.columns.length, en.footer.columns.length);
});

test('English landing hero uses EN labels', () => {
    const en = getLandingContent('en');

    assert.equal(en.signInLabel, 'Sign in');
    assert.equal(en.primaryCtaLabel, 'Get started');
    assert.match(en.heroTitle, /Verify claims/i);
});
