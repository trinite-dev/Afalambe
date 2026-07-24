'use client';

import type { ReactElement } from 'react';
import {
    buildFactCheckDetailsRows,
    collectSourceUrls,
    type FactCheckDetailsLocale,
} from '@afalambe/ai/fact-check-details';
import { cn } from '@afalambe/ui/lib/utils';
import { SourcePreviewList } from '@/components/source-preview-list';

const VERDICT_STYLES: Record<string, string> = {
    VERIFIED: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300',
    DEBUNKED: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300',
    MISLEADING: 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300',
    PARTIALLY_TRUE: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300',
    PENDING: 'bg-gray-100 text-gray-600 dark:bg-gray-800/50 dark:text-gray-400',
};

export type FactCheckDetailsCardProps = {
    locale: FactCheckDetailsLocale;
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
    sourceMimeTypes?: Record<string, string>;
    className?: string;
};

export function FactCheckDetailsCard({
    locale,
    factCheckStatus,
    factCheckDate,
    topicCategory,
    location,
    claimDate,
    sourceName,
    sourceType,
    platform,
    sourceUrl,
    sourceUrls,
    sourceMimeTypes,
    className,
}: FactCheckDetailsCardProps): ReactElement {
    const rows = buildFactCheckDetailsRows({
        locale,
        factCheckStatus,
        factCheckDate,
        topicCategory,
        location,
        claimDate,
        sourceName,
        sourceType,
        platform,
        sourceUrl,
        sourceUrls,
    });
    const sources = collectSourceUrls({ sourceUrl, sourceUrls });

    return (
        <dl
            className={cn(
                'mt-3 space-y-1.5 rounded-[var(--chat-radius-md)] border border-[var(--chat-border-subtle)] bg-[var(--chat-surface-raised)] px-3 py-2.5 text-xs text-[var(--chat-text-secondary)]',
                className,
            )}
        >
            {rows.map((row) => (
                <div key={row.key} className="grid grid-cols-[minmax(0,9.5rem)_1fr] gap-x-3 gap-y-0.5">
                    <dt className="font-medium text-[var(--chat-text-tertiary)]">{row.label}</dt>
                    <dd className="min-w-0 break-words text-[var(--chat-text-primary)]">
                        {row.key === 'status' && factCheckStatus ? (
                            <span
                                className={cn(
                                    'inline-block rounded px-2 py-0.5 text-xs font-medium',
                                    VERDICT_STYLES[factCheckStatus] ?? VERDICT_STYLES.PENDING,
                                )}
                            >
                                {row.value}
                            </span>
                        ) : row.key === 'sources' && sources.length > 0 ? (
                            <SourcePreviewList
                                locale={locale}
                                urls={sources}
                                mimeByUrl={sourceMimeTypes}
                            />
                        ) : (
                            row.value
                        )}
                    </dd>
                </div>
            ))}
        </dl>
    );
}

/** Strip the structured --- footer so the card is not duplicated in prose. */
export function stripFactCheckDetailsFooter(content: string): string {
    const markers = ['\n\n---\nStatut de verification:', '\n\n---\nFact-check status:'];
    let cut = -1;
    for (const marker of markers) {
        const index = content.lastIndexOf(marker);
        if (index >= 0) cut = cut === -1 ? index : Math.min(cut, index);
    }
    if (cut === -1) {
        const fallback = content.lastIndexOf('\n---\n');
        if (fallback >= 0 && /Statut de verification:|Fact-check status:/.test(content.slice(fallback))) {
            cut = fallback;
        }
    }
    return cut >= 0 ? content.slice(0, cut).trimEnd() : content;
}
