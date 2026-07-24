export type FactCheckDetailsLocale = 'fr' | 'en';

export type FactCheckDetailsInput = {
    factCheckStatus?: string | null;
    factCheckDate?: Date | string | null;
    topicCategory?: string | null;
    location?: string | null;
    claimDate?: Date | string | null;
    sourceName?: string | null;
    sourceType?: string | null;
    platform?: string | null;
    sourceUrl?: string | null;
    sourceUrls?: string[];
    locale: FactCheckDetailsLocale;
};

export type FactCheckDetailsRow = {
    key: string;
    label: string;
    value: string;
};

const LABELS: Record<
    FactCheckDetailsLocale,
    Record<
        | 'status'
        | 'factCheckDate'
        | 'topic'
        | 'location'
        | 'claimDate'
        | 'who'
        | 'platform'
        | 'sources'
        | 'sourceType'
        | 'sourceName'
        | 'notAvailable',
        string
    >
> = {
    fr: {
        status: 'Statut de verification',
        factCheckDate: 'Date de verification',
        topic: 'Categorie',
        location: 'Lieu de la declaration',
        claimDate: 'Date de la declaration',
        who: 'Auteur de la declaration',
        platform: 'Plateforme',
        sources: 'Sources',
        sourceType: 'Type de source',
        sourceName: 'Nom de la source',
        notAvailable: 'Non',
    },
    en: {
        status: 'Fact-check status',
        factCheckDate: 'Fact-check date',
        topic: 'Topic category',
        location: 'Claim location',
        claimDate: 'Claim date',
        who: 'Who made the claim',
        platform: 'Platform',
        sources: 'Sources',
        sourceType: 'Source type',
        sourceName: 'Source name',
        notAvailable: 'Not',
    },
};

const STATUS_LABELS: Record<FactCheckDetailsLocale, Record<string, string>> = {
    fr: {
        PENDING: 'En attente',
        VERIFIED: 'Verifie',
        DEBUNKED: 'Dementi',
        MISLEADING: 'Trompeur',
        PARTIALLY_TRUE: 'Partiellement vrai',
        UNVERIFIABLE: 'Non verifiable',
    },
    en: {
        PENDING: 'Pending',
        VERIFIED: 'Verified',
        DEBUNKED: 'Debunked',
        MISLEADING: 'Misleading',
        PARTIALLY_TRUE: 'Partially true',
        UNVERIFIABLE: 'Unverifiable',
    },
};

const TOPIC_LABELS: Record<FactCheckDetailsLocale, Record<string, string>> = {
    fr: {
        POLITICS: 'Politique',
        HEALTH: 'Sante',
        FINANCE: 'Finance',
        TECH: 'Tech',
        SECURITY: 'Securite',
        EDUCATION: 'Education',
        ENVIRONMENT: 'Environnement',
    },
    en: {
        POLITICS: 'Politics',
        HEALTH: 'Health',
        FINANCE: 'Finance',
        TECH: 'Tech',
        SECURITY: 'Security',
        EDUCATION: 'Education',
        ENVIRONMENT: 'Environment',
    },
};

const SOURCE_TYPE_LABELS: Record<FactCheckDetailsLocale, Record<string, string>> = {
    fr: {
        POLITICIAN: 'Politicien',
        MEDIA: 'Media',
        SOCIAL_MEDIA: 'Reseau social',
        BLOG: 'Blog',
        NGO: 'ONG',
        CITIZEN: 'Citoyen',
    },
    en: {
        POLITICIAN: 'Politician',
        MEDIA: 'Media',
        SOCIAL_MEDIA: 'Social media',
        BLOG: 'Blog',
        NGO: 'NGO',
        CITIZEN: 'Citizen',
    },
};

function toDate(value: Date | string | null | undefined): Date | null {
    if (!value) return null;
    const date = value instanceof Date ? value : new Date(value);
    return Number.isNaN(date.getTime()) ? null : date;
}

function formatDateTime(value: Date | string | null | undefined, locale: FactCheckDetailsLocale): string | null {
    const date = toDate(value);
    if (!date) return null;
    return date.toLocaleString(locale === 'fr' ? 'fr-FR' : 'en-US', {
        dateStyle: 'short',
        timeStyle: 'short',
    });
}

function formatDateOnly(value: Date | string | null | undefined, locale: FactCheckDetailsLocale): string | null {
    const date = toDate(value);
    if (!date) return null;
    return date.toLocaleDateString(locale === 'fr' ? 'fr-FR' : 'en-US', {
        dateStyle: 'medium',
    });
}

function displayOrNot(value: string | null | undefined, locale: FactCheckDetailsLocale): string {
    const trimmed = value?.trim();
    return trimmed && trimmed.length > 0 ? trimmed : LABELS[locale].notAvailable;
}

function mapEnum(
    value: string | null | undefined,
    table: Record<string, string>,
    locale: FactCheckDetailsLocale,
): string {
    if (!value) return LABELS[locale].notAvailable;
    return table[value] ?? value;
}

export function collectSourceUrls(input: {
    sourceUrl?: string | null;
    sourceUrls?: string[];
}): string[] {
    const urls = [...(input.sourceUrls ?? [])];
    if (input.sourceUrl) urls.unshift(input.sourceUrl);
    const seen = new Set<string>();
    const result: string[] = [];
    for (const raw of urls) {
        const url = raw.trim();
        if (!url || seen.has(url)) continue;
        seen.add(url);
        result.push(url);
    }
    return result;
}

export function extractHttpUrls(text: string): string[] {
    const matches = text.match(/https?:\/\/[^\s)\]>'"]+/gi) ?? [];
    return matches.map((url) => url.replace(/[.,;:!?]+$/, ''));
}

export function buildFactCheckDetailsRows(input: FactCheckDetailsInput): FactCheckDetailsRow[] {
    const labels = LABELS[input.locale];
    const sources = collectSourceUrls(input);

    return [
        {
            key: 'status',
            label: labels.status,
            value: mapEnum(input.factCheckStatus, STATUS_LABELS[input.locale], input.locale),
        },
        {
            key: 'factCheckDate',
            label: labels.factCheckDate,
            value: displayOrNot(formatDateTime(input.factCheckDate, input.locale), input.locale),
        },
        {
            key: 'topic',
            label: labels.topic,
            value: mapEnum(input.topicCategory, TOPIC_LABELS[input.locale], input.locale),
        },
        {
            key: 'location',
            label: labels.location,
            value: displayOrNot(input.location, input.locale),
        },
        {
            key: 'claimDate',
            label: labels.claimDate,
            value: displayOrNot(formatDateOnly(input.claimDate, input.locale), input.locale),
        },
        {
            key: 'who',
            label: labels.who,
            value: displayOrNot(input.sourceName, input.locale),
        },
        {
            key: 'platform',
            label: labels.platform,
            value: displayOrNot(input.platform, input.locale),
        },
        {
            key: 'sources',
            label: labels.sources,
            value: sources.length > 0 ? sources.join('\n') : labels.notAvailable,
        },
        {
            key: 'sourceType',
            label: labels.sourceType,
            value: mapEnum(input.sourceType, SOURCE_TYPE_LABELS[input.locale], input.locale),
        },
        {
            key: 'sourceName',
            label: labels.sourceName,
            value: displayOrNot(input.sourceName, input.locale),
        },
    ];
}

export function formatFactCheckDetailsFooter(input: FactCheckDetailsInput): string {
    const rows = buildFactCheckDetailsRows(input);
    const body = rows.map((row) => `${row.label}: ${row.value.replace(/\n/g, ', ')}`).join('\n');
    return `\n\n---\n${body}`;
}

export function appendFactCheckDetailsFooter(
    assistantText: string,
    input: Omit<FactCheckDetailsInput, 'sourceUrls'> & { sourceUrls?: string[] },
): string {
    const urlsFromText = extractHttpUrls(assistantText);
    const footer = formatFactCheckDetailsFooter({
        ...input,
        sourceUrls: [...(input.sourceUrls ?? []), ...urlsFromText],
    });
    const trimmed = assistantText.trimEnd();
    if (trimmed.includes('\n---\nStatut de verification:') || trimmed.includes('\n---\nFact-check status:')) {
        return trimmed;
    }
    return `${trimmed}${footer}`;
}

export function resolveFactCheckLocale(claimLanguage?: string | null): FactCheckDetailsLocale {
    const normalized = (claimLanguage ?? 'fr').toLowerCase();
    if (normalized.startsWith('en')) return 'en';
    return 'fr';
}
