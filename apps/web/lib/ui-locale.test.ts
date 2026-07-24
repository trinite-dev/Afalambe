import test from 'node:test';
import assert from 'node:assert/strict';
import {
    getAlternateUiLocale,
    getLocaleToggleAriaLabel,
    isUiLocale,
    UI_LOCALE_STORAGE_KEY,
} from './ui-locale';

test('isUiLocale accepts fr and en only', () => {
    assert.equal(isUiLocale('fr'), true);
    assert.equal(isUiLocale('en'), true);
    assert.equal(isUiLocale('ff'), false);
    assert.equal(isUiLocale('de'), false);
});

test('UI_LOCALE_STORAGE_KEY is stable', () => {
    assert.equal(UI_LOCALE_STORAGE_KEY, 'afalambe_locale');
});

test('getAlternateUiLocale toggles fr and en', () => {
    assert.equal(getAlternateUiLocale('fr'), 'en');
    assert.equal(getAlternateUiLocale('en'), 'fr');
});

test('getLocaleToggleAriaLabel describes target language', () => {
    assert.equal(getLocaleToggleAriaLabel('fr'), 'Switch to English');
    assert.equal(getLocaleToggleAriaLabel('en'), 'Passer en francais');
});
