import assert from 'node:assert/strict';
import test from 'node:test';

import { formatEvidenceBlock } from './format-evidence';
import { loadFactCheckCorpus, resetCorpusCache } from './load-corpus';
import { retrieveFromCorpus, tokenize } from './retrieve';

test('loadFactCheckCorpus returns 65 AFA entries', () => {
    resetCorpusCache();
    const entries = loadFactCheckCorpus();
    assert.equal(entries.length, 65);
    assert.ok(entries.every((entry) => entry.id.startsWith('AFA-')));
});

test('tokenize drops short FR stopwords', () => {
    const tokens = tokenize('Le FMI a publié un rapport demandant aux Guinéens de retirer leur argent des banques');
    assert.ok(tokens.includes('fmi'));
    assert.ok(tokens.includes('banques') || tokens.includes('argent'));
    assert.ok(!tokens.includes('des'));
});

test('retrieveFromCorpus ranks FMI / banques claim near AFA-004', () => {
    resetCorpusCache();
    const hits = retrieveFromCorpus(
        'Le FMI demande aux Guinéens de retirer leur argent des banques',
        { limit: 5 },
    );
    assert.ok(hits.length > 0);
    assert.ok(
        hits.some((hit) => hit.id === 'AFA-004'),
        `expected AFA-004 in ${hits.map((h) => h.id).join(', ')}`,
    );
});

test('formatEvidenceBlock is empty for no hits', () => {
    assert.equal(formatEvidenceBlock([]), '');
});

test('formatEvidenceBlock lists corpus ids', () => {
    const block = formatEvidenceBlock([
        {
            id: 'AFA-001',
            source: 'corpus',
            claimText: 'Claim',
            factCheckText: 'Finding',
            verdict: 'DEBUNKED',
            score: 3,
        },
    ]);
    assert.match(block, /corpus:AFA-001/);
    assert.match(block, /DEBUNKED/);
});
