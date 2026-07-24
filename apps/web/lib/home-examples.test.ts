import test from 'node:test';
import assert from 'node:assert/strict';

import { getCorpusPromptSuggestions, HOME_EXAMPLE_CLAIMS } from './home-examples';

test('home examples use four curated AFA corpus ids', () => {
    assert.equal(HOME_EXAMPLE_CLAIMS.length, 4);
    assert.deepEqual(
        HOME_EXAMPLE_CLAIMS.map((c) => c.id),
        ['AFA-001', 'AFA-004', 'AFA-002', 'AFA-008'],
    );
});

test('getCorpusPromptSuggestions returns locale-specific claim texts', () => {
    const fr = getCorpusPromptSuggestions('fr');
    const en = getCorpusPromptSuggestions('en');

    assert.equal(fr.length, 4);
    assert.ok((fr[0] ?? '').includes('?'));
    assert.ok((fr[0] ?? '').includes('Alpha Condé'));
    assert.ok((fr[1] ?? '').includes('FMI'));
    assert.ok((en[1] ?? '').includes('IMF'));
    assert.ok((fr[3] ?? '').includes('Mpox'));
    assert.ok((en[0] ?? '').startsWith('Does ') || (en[0] ?? '').includes('?'));
});
