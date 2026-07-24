import test from 'node:test';
import assert from 'node:assert/strict';

import { HOME_EXAMPLE_CLAIMS } from './home-examples';
import {
    assertDemoScenarioParity,
    getDemoExampleScenarios,
    getDemoScenarios,
    isHumanQueueFallbackCopy,
    listDemoScenarioIds,
    matchDemoScenario,
} from './demo-scenarios';

test('demo scenario IDs match between locales', () => {
    assertDemoScenarioParity();
    assert.deepEqual(listDemoScenarioIds('fr'), ['D1', 'D2', 'D3', 'D4', 'D5', 'UNMATCHED']);
    assert.deepEqual(listDemoScenarioIds('en'), ['D1', 'D2', 'D3', 'D4', 'D5', 'UNMATCHED']);
});

test('home example claims map to D1–D4 example lines', () => {
    const expected = {
        'AFA-001': 'D1',
        'AFA-002': 'D2',
        'AFA-004': 'D3',
        'AFA-008': 'D4',
    } as const;

    for (const locale of ['fr', 'en'] as const) {
        for (const claim of HOME_EXAMPLE_CLAIMS) {
            const scenarioId = expected[claim.id as keyof typeof expected];
            assert.ok(scenarioId, `unexpected home claim ${claim.id}`);
            const matched = matchDemoScenario(locale, claim[locale]);
            assert.equal(matched.id, scenarioId);
            assert.equal(matched.factCheckStatus, 'DEBUNKED');
            assert.equal(isHumanQueueFallbackCopy(matched.assistantReply), false);
        }
    }
});

test('keyword packs resolve D1–D4', () => {
    assert.equal(matchDemoScenario('fr', 'video manifestation Alpha Conde').id, 'D1');
    assert.equal(matchDemoScenario('en', 'Alpha Condé protest video after the coup').id, 'D1');
    assert.equal(matchDemoScenario('fr', 'mineurs maliens diamants Guinee').id, 'D2');
    assert.equal(matchDemoScenario('en', 'Malian miners diamonds Guinea images').id, 'D2');
    assert.equal(matchDemoScenario('fr', 'rapport FMI retirer argent banques').id, 'D3');
    assert.equal(matchDemoScenario('en', 'IMF report withdraw money banks').id, 'D3');
    assert.equal(matchDemoScenario('fr', 'vaccin Mpox sterilite').id, 'D4');
    assert.equal(matchDemoScenario('en', 'Mpox vaccine sterility WhatsApp').id, 'D4');
});

test('unrelated text returns OFF_TOPIC or UNMATCHED guidance, not human-queue copy', () => {
    for (const locale of ['fr', 'en'] as const) {
        const matched = matchDemoScenario(locale, 'Hello there, what is the weather today?');
        assert.ok(matched.id === 'OFF_TOPIC' || matched.id === 'UNMATCHED');
        assert.equal(matched.factCheckStatus, undefined);
        assert.equal(isHumanQueueFallbackCopy(matched.assistantReply), false);
    }
});

test('meta and follow-up intents are detected in demo', () => {
    assert.equal(matchDemoScenario('fr', 'Comment fonctionne Afalambe ?').id, 'META');
    assert.equal(matchDemoScenario('en', 'What is fact-checking?').id, 'META');
    assert.equal(
        matchDemoScenario('en', 'Why that verdict?', { hasPriorAssistant: true }).id,
        'FOLLOW_UP',
    );
});

test('D5 intentional pending only on distinctive unverifiable phrasing', () => {
    assert.equal(matchDemoScenario('fr', 'Pouvez-vous verifier cette rumeur sans source claire ?').id, 'D5');
    assert.equal(matchDemoScenario('en', 'Can you verify this rumor with no clear source?').id, 'D5');
    assert.equal(matchDemoScenario('fr', 'rumeur sans source claire').factCheckStatus, 'PENDING');
    // Broad "verify" alone must not force the old generic queue path.
    const broad = matchDemoScenario('en', 'Please verify this claim for me');
    assert.notEqual(broad.id, 'D5');
    assert.equal(broad.id, 'UNMATCHED');
});

test('example scenarios expose five clickable lines', () => {
    for (const locale of ['fr', 'en'] as const) {
        const examples = getDemoExampleScenarios(locale);
        assert.equal(examples.length, 5);
        assert.ok(examples.every((scenario) => scenario.exampleLine.length > 10));
        assert.ok(getDemoScenarios(locale).some((scenario) => scenario.id === 'UNMATCHED'));
    }
});

test('debunked demo scenarios expose full fact-check details fields', () => {
    for (const locale of ['fr', 'en'] as const) {
        for (const id of ['D1', 'D2', 'D3', 'D4'] as const) {
            const scenario = getDemoScenarios(locale).find((entry) => entry.id === id);
            assert.ok(scenario);
            assert.equal(scenario.factCheckStatus, 'DEBUNKED');
            assert.ok(scenario.claimMetadata.sourceName);
            assert.equal(scenario.claimMetadata.sourceType, 'SOCIAL_MEDIA');
            assert.ok(scenario.claimMetadata.platform);
            assert.ok(scenario.claimMetadata.topicCategory);
            assert.ok(scenario.claimMetadata.location);
            assert.ok(scenario.claimMetadata.claimDate);
            assert.ok(scenario.claimMetadata.factCheckDate);
            assert.ok(
                scenario.claimMetadata.sourceUrl ||
                    (scenario.claimMetadata.sourceUrls && scenario.claimMetadata.sourceUrls.length > 0),
            );
        }
    }

    const pending = matchDemoScenario('en', 'Can you verify this rumor with no clear source?');
    assert.equal(pending.factCheckStatus, 'PENDING');
    assert.equal(pending.claimMetadata.factCheckDate, undefined);
});

test('debunked demo scenarios do not invent image sources', () => {
    for (const locale of ['fr', 'en'] as const) {
        for (const scenario of getDemoScenarios(locale)) {
            const urls = [
                scenario.claimMetadata.sourceUrl,
                ...(scenario.claimMetadata.sourceUrls ?? []),
            ].filter((url): url is string => Boolean(url));
            for (const url of urls) {
                assert.equal(
                    /\.(png|jpe?g|webp|gif|avif)(\?|$)/i.test(url) || url.startsWith('/'),
                    false,
                    `${scenario.id} must not invent image/path sources: ${url}`,
                );
            }
        }
    }
});
