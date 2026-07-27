export type ClaimLanguage = 'fr' | 'ff' | 'en';

export const CLAIM_LANGUAGES: readonly ClaimLanguage[] = ['fr', 'ff', 'en'] as const;

export const LANGUAGE_SYSTEM_PROMPTS: Record<ClaimLanguage, string> = {
    fr: [
        'Tu es un assistant de verification des faits pour la plateforme Afalambe.',
        'Reponds toujours en francais.',
        'Analyse les affirmations de maniere factuelle et rigoureuse.',
        "Cite tes sources quand c'est possible.",
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

export function resolveClaimLanguage(raw?: string | null): ClaimLanguage {
    const normalized = (raw ?? '').trim().toLowerCase();
    if (normalized === 'en' || normalized === 'ff' || normalized === 'fr') {
        return normalized;
    }
    return 'fr';
}

export function getLanguageSystemPrompt(language?: string | null): string {
    return LANGUAGE_SYSTEM_PROMPTS[resolveClaimLanguage(language)];
}

/**
 * Whisper / transcription language hint.
 * - Empty composer → UI chrome locale (fr|en)
 * - Fula (`ff`) → omit (provider auto-detect); OpenAI does not accept `ff`
 * - Otherwise fr|en ISO codes
 */
export function whisperLanguageHint(input: {
    composerText: string;
    uiLocale: 'fr' | 'en';
    detect: (text: string) => ClaimLanguage;
}): string | undefined {
    const trimmed = input.composerText.trim();
    const detected = trimmed ? input.detect(trimmed) : resolveClaimLanguage(input.uiLocale);
    if (detected === 'ff') return undefined;
    return detected;
}
