import type { EvidenceHit } from './types';

export function formatEvidenceBlock(hits: EvidenceHit[]): string {
    if (hits.length === 0) {
        return '';
    }

    const lines = hits.map((hit, index) => {
        const url = hit.sourceUrl ? ` URL: ${hit.sourceUrl}` : '';
        return [
            `${index + 1}. [${hit.source}:${hit.id}] verdict=${hit.verdict} (score=${hit.score})`,
            `   Claim: ${hit.claimText}`,
            `   Finding: ${hit.factCheckText}${url}`,
        ].join('\n');
    });

    return [
        'Approved evidence (use when relevant; cite the id or URL; do not invent ids that are not listed):',
        ...lines,
    ].join('\n');
}
