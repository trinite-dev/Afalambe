import assert from 'node:assert/strict';
import test from 'node:test';

import {
    appendFactCheckDetailsFooter,
    buildFactCheckDetailsRows,
    collectSourceUrls,
    formatFactCheckDetailsFooter,
} from './format-fact-check-footer';

test('buildFactCheckDetailsRows uses Not for missing English fields', () => {
    const rows = buildFactCheckDetailsRows({
        locale: 'en',
        factCheckStatus: 'DEBUNKED',
        factCheckDate: null,
        topicCategory: null,
        location: null,
        claimDate: null,
        sourceName: null,
        sourceType: null,
        platform: null,
        sourceUrl: null,
    });

    assert.equal(rows.find((r) => r.key === 'status')?.value, 'Debunked');
    assert.equal(rows.find((r) => r.key === 'factCheckDate')?.value, 'Not');
    assert.equal(rows.find((r) => r.key === 'sources')?.value, 'Not');
});

test('formatFactCheckDetailsFooter includes all required labels in French', () => {
    const footer = formatFactCheckDetailsFooter({
        locale: 'fr',
        factCheckStatus: 'VERIFIED',
        factCheckDate: new Date('2026-07-24T10:00:00Z'),
        topicCategory: 'POLITICS',
        location: 'Guinee',
        claimDate: new Date('2021-09-29'),
        sourceName: 'Compte Facebook',
        sourceType: 'SOCIAL_MEDIA',
        platform: 'facebook',
        sourceUrl: 'https://example.com/a',
        sourceUrls: ['https://example.com/b.png'],
    });

    assert.match(footer, /Statut de verification:/);
    assert.match(footer, /Date de verification:/);
    assert.match(footer, /Categorie:/);
    assert.match(footer, /Lieu de la declaration:/);
    assert.match(footer, /Date de la declaration:/);
    assert.match(footer, /Auteur de la declaration:/);
    assert.match(footer, /Plateforme:/);
    assert.match(footer, /Sources:/);
    assert.match(footer, /Type de source:/);
    assert.match(footer, /Nom de la source:/);
    assert.match(footer, /Reseau social/);
});

test('collectSourceUrls dedupes and keeps order', () => {
    assert.deepEqual(
        collectSourceUrls({
            sourceUrl: 'https://a.test',
            sourceUrls: ['https://a.test', 'https://b.test'],
        }),
        ['https://a.test', 'https://b.test'],
    );
});

test('appendFactCheckDetailsFooter does not duplicate footer', () => {
    const once = appendFactCheckDetailsFooter('Analyse complete.', {
        locale: 'en',
        factCheckStatus: 'MISLEADING',
    });
    const twice = appendFactCheckDetailsFooter(once, {
        locale: 'en',
        factCheckStatus: 'MISLEADING',
    });
    assert.equal(once, twice);
    assert.match(once, /Fact-check status: Misleading/);
});
