/**
 * Language Detection Utilities
 * Handles automatic language detection from text and audio
 */

import { franc } from 'franc';
import type { SupportedLanguage } from './languages';
import { DEFAULT_LANGUAGE, FRANC_TO_SUPPORTED_LANGUAGE } from './languages';

const SUPPORTED_LANG_SET = new Set<string>(['fr', 'ff', 'en']);

function toSupportedLanguage(code: string): SupportedLanguage | null {
  return SUPPORTED_LANG_SET.has(code) ? (code as SupportedLanguage) : null;
}

export const detectLanguageFromText = (text: string): SupportedLanguage => {
  if (!text || text.trim().length < 5) {
    return DEFAULT_LANGUAGE;
  }

  try {
    const detected = franc(text);
    const supported = FRANC_TO_SUPPORTED_LANGUAGE[detected];
    return supported ?? DEFAULT_LANGUAGE;
  } catch {
    return DEFAULT_LANGUAGE;
  }
};

export const getBrowserLanguage = (): SupportedLanguage => {
  if (typeof navigator === 'undefined') return DEFAULT_LANGUAGE;

  const browserLang = navigator.language || navigator.languages?.[0] || '';
  const langCode = (browserLang.split('-')[0] ?? '').toLowerCase();
  return toSupportedLanguage(langCode) ?? DEFAULT_LANGUAGE;
};

/**
 * Comprehensive language detection with fallback hierarchy:
 * audio detection > text detection > browser language > default (French)
 */
export const detectUserLanguage = (
  textInput?: string,
  audioLanguage?: string,
): SupportedLanguage => {
  if (audioLanguage) {
    const resolved = toSupportedLanguage(audioLanguage.toLowerCase());
    if (resolved) return resolved;
  }

  if (textInput && textInput.trim().length > 10) {
    return detectLanguageFromText(textInput);
  }

  return getBrowserLanguage();
};

export const formatLanguageCode = (code: SupportedLanguage): string => {
  return code.toUpperCase();
};
