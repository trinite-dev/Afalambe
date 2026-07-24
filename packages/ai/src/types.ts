export type FactCheckVerdict =
    | 'VERIFIED'
    | 'DEBUNKED'
    | 'MISLEADING'
    | 'PARTIALLY_TRUE'
    | 'UNVERIFIABLE';

export type FactCheckCorpusEntry = {
    id: string;
    claimText: string;
    language: 'fr' | 'en' | 'ff' | string;
    languageRaw?: string | null;
    publishedAt?: string | null;
    author?: string | null;
    sourceType?: string | null;
    sourceTypeRaw?: string | null;
    sourceUrl?: string | null;
    sourceUrlRaw?: string | null;
    mediaType?: string | null;
    mediaTypeRaw?: string | null;
    factCheckText: string;
    factCheckStatusRaw?: string | null;
    verdict: FactCheckVerdict | string;
    topicCategory?: string | null;
    topicCategoryRaw?: string | null;
    country?: string | null;
    platform?: string | null;
    sources?: string[];
};

export type FactCheckCorpusFile = {
    version: number;
    name: string;
    description?: string;
    importedFrom?: string[];
    count: number;
    entries: FactCheckCorpusEntry[];
};

export type EvidenceHit = {
    id: string;
    source: 'corpus' | 'database';
    claimText: string;
    factCheckText: string;
    verdict: string;
    sourceUrl?: string | null;
    score: number;
};

export type RetrieveOptions = {
    limit?: number;
    topicCategory?: string | null;
};
