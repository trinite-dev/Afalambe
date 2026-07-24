export type ChatMessageIntent = 'FACT_CHECK' | 'FOLLOW_UP' | 'META' | 'OFF_TOPIC';

export type ChatMessageIntentConfidence = 'high' | 'medium' | 'low';

export type ClassifyMessageIntentInput = {
    text: string;
    hasPriorAssistant: boolean;
};

export type ClassifyMessageIntentResult = {
    intent: ChatMessageIntent;
    confidence: ChatMessageIntentConfidence;
};

function normalize(text: string): string {
    return text
        .normalize('NFD')
        .replace(/\p{M}/gu, '')
        .toLowerCase()
        .replace(/\s+/g, ' ')
        .trim();
}

const META_PATTERNS: RegExp[] = [
    /\bafalambe\b/,
    /\bfact[ -]?check(ing|er|ers)?\b/,
    /\bverification (des faits|d information|d'information)\b/,
    /\bverificat(ion|eur)\b/,
    /\bcomment (ca|cela) marche\b/,
    /\bcomment fonctionne\b/,
    /\bhow (does|do) (this|it|afalambe|fact)/,
    /\bwhat (is|does) (afalambe|fact[ -]?check)/,
    /\bqu('|\s)?est[ -]?ce que (c('|\s)?est )?(qu('|\s)?est[ -]?ce que )?(afalambe|la verification|le fact)/,
    /\bc('|\s)?est quoi (afalambe|la verification|un fact)/,
    /\bwho (are|is) you\b/,
    /\bqui es[ -]?tu\b/,
    /\bque peux[ -]?tu faire\b/,
    /\bwhat can you (do|help)\b/,
    /\bhow (do|does) (you|fact) (verify|check|work)/,
    /\bcomment (tu|vous) (verifie|verifiez|fonctionne)/,
];

const FOLLOW_UP_PATTERNS: RegExp[] = [
    /\bpourquoi\b/,
    /\bwhy\b/,
    /\bexplique/,
    /\bexplain/,
    /\bclarif/,
    /\bprecis(e|er|ion)/,
    /\bsources?\b/,
    /\bplus (de )?(details|precisions|info)/,
    /\bmore (details|info|information|sources)/,
    /\bwhat does (that|this|it) mean\b/,
    /\bqu('|\s)?est[ -]?ce que (ca|cela|ce verdict|ce statut) (veut|signifie)/,
    /\best[ -]?ce (que )?(tu|vous) (es|etes|peux|pouvez) (sur|certain)/,
    /\bcan you (clarify|expand|elaborate|explain)/,
    /\bpouvez[ -]?vous (preciser|expliquer|clarifier)/,
    /\bpar rapport (a|au|aux)\b/,
    /\babout (that|this|the) (verdict|source|claim|reply)/,
    /\bce verdict\b/,
    /\bthat verdict\b/,
];

const FACT_CHECK_PATTERNS: RegExp[] = [
    /\b(verifie|verifier|verification)\b/,
    /\bfact[ -]?check\b/,
    /\best[ -]?ce (que c('|\s)?est )?(vrai|faux|reel)/,
    /\bis (it|this|that) (true|false|real|fake)/,
    /\b(can|could) you (verify|check|fact)/,
    /\bpeux[ -]?tu (verifier|dementir|confirmer)/,
    /\bpouvez[ -]?vous (verifier|dementir|confirmer)/,
    /\b(rumeur|rumour|hoax|fake news|desinformation|misinformation)\b/,
    /\b(dementi|debunk|debunked)\b/,
    /\bclaim\b/,
    /\baffirmation\b/,
    /\bon dit que\b/,
    /\bpeople (say|are saying)\b/,
    /\baccording to\b/,
    /\bselon\b/,
];

const OFF_TOPIC_PATTERNS: RegExp[] = [
    /^(salut|bonjour|bonsoir|hello|hi|hey|yo)([!?. ]*)$/,
    /\b(weather|meteo|temperature)\b/,
    /\b(joke|blague|rire)\b/,
    /\b(recipe|recette)\b/,
    /\b(football score|match hier)\b/,
];

function matchesAny(text: string, patterns: RegExp[]): boolean {
    return patterns.some((pattern) => pattern.test(text));
}

function isShortInterrogative(text: string): boolean {
    const words = text.split(' ').filter(Boolean);
    if (words.length === 0 || words.length > 14) return false;
    return (
        text.includes('?') ||
        /^(why|what|how|who|when|where|pouquoi|pourquoi|comment|qui|quand|ou|quoi)\b/.test(text)
    );
}

function looksSubstantialClaim(text: string): boolean {
    const words = text.split(' ').filter(Boolean);
    return words.length >= 8 || text.length >= 60;
}

export function classifyMessageIntent(input: ClassifyMessageIntentInput): ClassifyMessageIntentResult {
    const text = normalize(input.text);
    if (!text) {
        return { intent: 'OFF_TOPIC', confidence: 'high' };
    }

    if (matchesAny(text, META_PATTERNS)) {
        return { intent: 'META', confidence: 'high' };
    }

    if (input.hasPriorAssistant && matchesAny(text, FOLLOW_UP_PATTERNS)) {
        return { intent: 'FOLLOW_UP', confidence: 'high' };
    }

    if (matchesAny(text, FACT_CHECK_PATTERNS)) {
        return { intent: 'FACT_CHECK', confidence: 'high' };
    }

    if (input.hasPriorAssistant && isShortInterrogative(text) && !looksSubstantialClaim(text)) {
        return { intent: 'FOLLOW_UP', confidence: 'medium' };
    }

    if (matchesAny(text, OFF_TOPIC_PATTERNS)) {
        return { intent: 'OFF_TOPIC', confidence: 'high' };
    }

    if (looksSubstantialClaim(text)) {
        return { intent: 'FACT_CHECK', confidence: 'medium' };
    }

    if (isShortInterrogative(text) && !input.hasPriorAssistant) {
        // Short question with no claim cues → treat as meta-ish off-topic redirect
        return { intent: 'OFF_TOPIC', confidence: 'medium' };
    }

    return {
        intent: input.hasPriorAssistant ? 'FOLLOW_UP' : 'FACT_CHECK',
        confidence: 'low',
    };
}
