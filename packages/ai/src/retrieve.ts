import { loadFactCheckCorpus } from './load-corpus';
import type { EvidenceHit, FactCheckCorpusEntry, RetrieveOptions } from './types';

const STOPWORDS = new Set([
    'the',
    'a',
    'an',
    'and',
    'or',
    'of',
    'to',
    'in',
    'on',
    'for',
    'is',
    'are',
    'was',
    'were',
    'this',
    'that',
    'with',
    'from',
    'by',
    'as',
    'it',
    'be',
    'at',
    'le',
    'la',
    'les',
    'un',
    'une',
    'des',
    'du',
    'de',
    'et',
    'ou',
    'en',
    'au',
    'aux',
    'ce',
    'ces',
    'cet',
    'cette',
    'qui',
    'que',
    'quoi',
    'dans',
    'pour',
    'par',
    'sur',
    'avec',
    'sans',
    'pas',
    'plus',
    'est',
    'sont',
    'ete',
    'été',
    'une',
    'montrer',
    'montre',
    'video',
    'vidéo',
    'image',
    'images',
    'affiche',
    'affirmation',
]);

export function foldText(input: string): string {
    return input
        .normalize('NFKD')
        .replace(/\p{M}+/gu, '')
        .toLowerCase();
}

export function tokenize(input: string): string[] {
    const folded = foldText(input);
    const tokens = folded.match(/[a-z0-9]{3,}/g) ?? [];
    return [...new Set(tokens.filter((token) => !STOPWORDS.has(token)))];
}

function haystackForEntry(entry: FactCheckCorpusEntry): string {
    return foldText(
        [
            entry.claimText,
            entry.factCheckText,
            entry.country ?? '',
            entry.topicCategoryRaw ?? '',
            entry.topicCategory ?? '',
            entry.author ?? '',
            entry.platform ?? '',
        ].join(' '),
    );
}

export function scoreAgainstHaystack(
    tokens: string[],
    haystack: string,
    topicBoost?: string | null,
): number {
    if (tokens.length === 0) return 0;
    let score = 0;
    for (const token of tokens) {
        if (haystack.includes(token)) {
            score += 1;
        }
    }
    if (topicBoost && haystack.includes(foldText(topicBoost))) {
        score += 1;
    }
    return score;
}

export function scoreCorpusEntry(
    entry: FactCheckCorpusEntry,
    tokens: string[],
    topicCategory?: string | null,
): number {
    const haystack = haystackForEntry(entry);
    let score = scoreAgainstHaystack(tokens, haystack);
    if (
        topicCategory &&
        entry.topicCategory &&
        entry.topicCategory.toUpperCase() === topicCategory.toUpperCase()
    ) {
        score += 1;
    }
    return score;
}

export function retrieveFromCorpus(
    query: string,
    options: RetrieveOptions = {},
    entries?: FactCheckCorpusEntry[],
): EvidenceHit[] {
    const limit = options.limit ?? 5;
    const corpus = entries ?? loadFactCheckCorpus();
    const tokens = tokenize(query);
    if (tokens.length === 0) return [];

    return corpus
        .map((entry) => ({
            entry,
            score: scoreCorpusEntry(entry, tokens, options.topicCategory),
        }))
        .filter((row) => row.score > 0)
        .sort((a, b) => b.score - a.score || a.entry.id.localeCompare(b.entry.id))
        .slice(0, limit)
        .map(({ entry, score }) => ({
            id: entry.id,
            source: 'corpus' as const,
            claimText: entry.claimText,
            factCheckText: entry.factCheckText,
            verdict: String(entry.verdict),
            sourceUrl: entry.sourceUrl ?? null,
            score,
        }));
}

export function scoreDatabaseCandidate(
    candidate: {
        id: string;
        claimText?: string | null;
        factCheckText?: string | null;
        factCheckStatus?: string | null;
        topicCategory?: string | null;
        location?: string | null;
        sourceUrl?: string | null;
    },
    tokens: string[],
    topicCategory?: string | null,
): number {
    const haystack = foldText(
        [
            candidate.claimText ?? '',
            candidate.factCheckText ?? '',
            candidate.location ?? '',
            candidate.topicCategory ?? '',
        ].join(' '),
    );
    let score = scoreAgainstHaystack(tokens, haystack);
    if (
        topicCategory &&
        candidate.topicCategory &&
        candidate.topicCategory.toUpperCase() === topicCategory.toUpperCase()
    ) {
        score += 1;
    }
    return score;
}

export function toDatabaseEvidenceHit(
    candidate: {
        id: string;
        claimText?: string | null;
        factCheckText?: string | null;
        factCheckStatus?: string | null;
        sourceUrl?: string | null;
    },
    score: number,
): EvidenceHit {
    return {
        id: candidate.id,
        source: 'database',
        claimText: candidate.claimText ?? '',
        factCheckText: candidate.factCheckText ?? '',
        verdict: candidate.factCheckStatus ?? 'PENDING',
        sourceUrl: candidate.sourceUrl ?? null,
        score,
    };
}

/** Significant tokens for Prisma `contains` filters (capped). */
export function significantTokensForDb(query: string, max = 5): string[] {
    return tokenize(query)
        .sort((a, b) => b.length - a.length)
        .slice(0, max);
}

export function mergeEvidenceHits(hits: EvidenceHit[], limit = 8): EvidenceHit[] {
    const seen = new Set<string>();
    const merged: EvidenceHit[] = [];
    for (const hit of [...hits].sort((a, b) => b.score - a.score || a.id.localeCompare(b.id))) {
        const key = foldText(hit.claimText).slice(0, 120);
        if (seen.has(key)) continue;
        seen.add(key);
        merged.push(hit);
        if (merged.length >= limit) break;
    }
    return merged;
}
