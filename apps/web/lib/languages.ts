import { getCorpusPromptSuggestions } from '@/lib/home-examples';

/**
 * Language Configuration for Afalambe Fact-Checking Platform
 * Supports: French, Fula/Peul, English
 */

export type SupportedLanguage = 'fr' | 'ff' | 'en';

export const LANGUAGES: Record<SupportedLanguage, { name: string; label: string; code: string }> = {
  fr: { name: 'French', label: 'Francais', code: 'fr' },
  ff: { name: 'Fula', label: 'Pulaar / Fulfulde', code: 'ff' },
  en: { name: 'English', label: 'English', code: 'en' },
};

export const DEFAULT_LANGUAGE: SupportedLanguage = 'fr';

export const LANGUAGE_SYSTEM_PROMPTS: Record<SupportedLanguage, string> = {
  fr: [
    'Tu es un assistant de verification des faits pour la plateforme Afalambe.',
    'Reponds toujours en francais.',
    'Analyse les affirmations de maniere factuelle et rigoureuse.',
    'Cite tes sources quand c\'est possible.',
    'Indique clairement ton niveau de certitude : verifie, dementi, trompeur ou partiellement vrai.',
    'Si tu ne peux pas verifier, dis-le explicitement.',
  ].join(' '),
  ff: [
    'A on wallitooɗo ƴeewndagol goonga e fenaande dow Afalambe.',
    'Jaabo e Pulaar/Fulfulde.',
    'Ƴeewnu haalaaji ɗii e nuunɗal.',
    'Hollu ɗo njiiɗaa humpito maa.',
    'Haal fes so a waawaa ƴeewndaade haala kaa.',
  ].join(' '),
  en: [
    'You are a fact-checking assistant for the Afalambe platform.',
    'Always respond in English.',
    'Analyze claims factually and rigorously.',
    'Cite sources when possible.',
    'Clearly state your confidence level: verified, debunked, misleading, or partially true.',
    'If you cannot verify, say so explicitly.',
  ].join(' '),
};

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

export const WHISPER_LANGUAGE_CODES: Record<SupportedLanguage, string> = {
  fr: 'fr',
  ff: 'ff',
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
  return LANGUAGE_SYSTEM_PROMPTS[language] || LANGUAGE_SYSTEM_PROMPTS.fr;
};

export const getPromptSuggestions = (language: SupportedLanguage): string[] => {
  return getCorpusPromptSuggestions(language);
};

export const getUILabel = (language: SupportedLanguage, key: string): string => {
  const labels = UI_LABELS[language];
  return labels[key] || UI_LABELS.fr[key] || '';
};
