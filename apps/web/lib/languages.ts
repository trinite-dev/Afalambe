import { getCorpusPromptSuggestions } from '@/lib/home-examples';
import {
    getLanguageSystemPrompt,
    LANGUAGE_SYSTEM_PROMPTS,
    type ClaimLanguage,
} from '@afalambe/ai/claim-language';

/**
 * Language Configuration for Afalambe Fact-Checking Platform
 * Supports: French, Fula/Peul, English
 */

export type SupportedLanguage = ClaimLanguage;

export const LANGUAGES: Record<SupportedLanguage, { name: string; label: string; code: string }> = {
  fr: { name: 'French', label: 'Francais', code: 'fr' },
  ff: { name: 'Fula', label: 'Pulaar / Fulfulde', code: 'ff' },
  en: { name: 'English', label: 'English', code: 'en' },
};

export const DEFAULT_LANGUAGE: SupportedLanguage = 'fr';

export { LANGUAGE_SYSTEM_PROMPTS };

export const PROMPT_SUGGESTIONS: Record<SupportedLanguage, string[]> = {
  fr: getCorpusPromptSuggestions('fr'),
  ff: getCorpusPromptSuggestions('ff'),
  en: getCorpusPromptSuggestions('en'),
};

export const UI_LABELS: Record<SupportedLanguage, Record<string, string>> = {
  fr: {
    startConversation: 'Commencez avec une de ces suggestions :',
    placeholder: 'Decrivez l\'affirmation a verifier...',
    detected: 'Detecte',
    newClaim: 'Nouvelle verification',
    verified: 'Verifie',
    debunked: 'Dementi',
    misleading: 'Trompeur',
    partiallyTrue: 'Partiellement vrai',
    pending: 'En attente',
  },
  ff: {
    startConversation: 'Fuɗɗor e gootal e ɗee misal :',
    placeholder: 'Winndoy haala kaa ko ƴeewndete...',
    detected: 'Yiytaama',
    newClaim: 'Ƴeewndaagol hesol',
    verified: 'Goongɗinaama',
    debunked: 'Fennaama',
    misleading: 'Jiiɓoowo',
    partiallyTrue: 'Seeɗa goonga',
    pending: 'Ina fadaa',
  },
  en: {
    startConversation: 'Start with one of these suggestions:',
    placeholder: 'Describe the claim to verify...',
    detected: 'Detected',
    newClaim: 'New verification',
    verified: 'Verified',
    debunked: 'Debunked',
    misleading: 'Misleading',
    partiallyTrue: 'Partially true',
    pending: 'Pending',
  },
};

/** ISO codes accepted by Whisper when known; Fula is omitted at call sites (auto-detect). */
export const WHISPER_LANGUAGE_CODES: Record<Exclude<SupportedLanguage, 'ff'>, string> = {
  fr: 'fr',
  en: 'en',
};

export const FRANC_TO_SUPPORTED_LANGUAGE: Record<string, SupportedLanguage> = {
  fra: 'fr',
  ful: 'ff',
  eng: 'en',
};

export const getLanguageName = (code: SupportedLanguage): string => {
  return LANGUAGES[code]?.name || 'Unknown';
};

export const getSystemPrompt = (language: SupportedLanguage): string => {
  return getLanguageSystemPrompt(language);
};

export const getPromptSuggestions = (language: SupportedLanguage): string[] => {
  return getCorpusPromptSuggestions(language);
};

export const getUILabel = (language: SupportedLanguage, key: string): string => {
  const labels = UI_LABELS[language];
  return labels[key] || UI_LABELS.fr[key] || '';
};
