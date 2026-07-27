import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import {
    getLanguageSystemPrompt,
    resolveClaimLanguage,
    whisperLanguageHint,
    type ClaimLanguage,
} from './claim-language';

describe('resolveClaimLanguage', () => {
    it('normalizes known codes and defaults unknown to fr', () => {
        assert.equal(resolveClaimLanguage('en'), 'en');
        assert.equal(resolveClaimLanguage('FF'), 'ff');
        assert.equal(resolveClaimLanguage(''), 'fr');
        assert.equal(resolveClaimLanguage(null), 'fr');
        assert.equal(resolveClaimLanguage('pt'), 'fr');
    });
});

describe('getLanguageSystemPrompt', () => {
    it('returns language-specific instructions', () => {
        assert.match(getLanguageSystemPrompt('en'), /Always respond in English/i);
        assert.match(getLanguageSystemPrompt('fr'), /Reponds toujours en francais/i);
        assert.match(getLanguageSystemPrompt('ff'), /Pulaar/i);
    });
});

describe('whisperLanguageHint', () => {
    const detect = (text: string): ClaimLanguage => {
        if (text.includes('hello')) return 'en';
        if (text.includes('pulaar')) return 'ff';
        return 'fr';
    };

    it('uses UI locale when composer is empty', () => {
        assert.equal(
            whisperLanguageHint({ composerText: '  ', uiLocale: 'en', detect }),
            'en',
        );
        assert.equal(
            whisperLanguageHint({ composerText: '', uiLocale: 'fr', detect }),
            'fr',
        );
    });

    it('omits hint for Fula so providers auto-detect', () => {
        assert.equal(
            whisperLanguageHint({ composerText: 'pulaar text', uiLocale: 'fr', detect }),
            undefined,
        );
    });

    it('uses detection for non-empty composer', () => {
        assert.equal(
            whisperLanguageHint({ composerText: 'hello world', uiLocale: 'fr', detect }),
            'en',
        );
    });
});
