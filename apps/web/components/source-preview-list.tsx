'use client';

import { useState, type ReactElement } from 'react';

import { cn } from '@afalambe/ui/lib/utils';
import {
    buildSourcePreviewItems,
    type SourceMediaKind,
    type SourcePreviewItem,
} from '@/lib/source-preview';
import { SOURCE_PREVIEW_UI, type UiLocale } from '@/lib/ui-locale';

export type SourcePreviewListProps = {
    locale: UiLocale;
    urls: string[];
    mimeByUrl?: Record<string, string>;
    className?: string;
};

function kindLabel(locale: UiLocale, kind: SourceMediaKind): string {
    return SOURCE_PREVIEW_UI[locale][kind];
}

function LinkPreview({
    item,
    locale,
    className,
}: {
    item: SourcePreviewItem;
    locale: UiLocale;
    className?: string;
}): ReactElement {
    const labels = SOURCE_PREVIEW_UI[locale];
    return (
        <a
            href={item.url}
            target="_blank"
            rel="noopener noreferrer"
            className={cn(
                'flex min-w-0 flex-col gap-0.5 rounded-[var(--chat-radius-sm)] border border-[var(--chat-border-subtle)] bg-[var(--chat-surface)] px-2.5 py-2 no-underline transition-colors hover:border-[var(--chat-accent)]',
                className,
            )}
            aria-label={`${labels.openSource}: ${item.hostname}`}
        >
            <span className="truncate text-[11px] font-semibold text-[var(--chat-text-primary)]">
                {item.hostname}
            </span>
            <span className="truncate text-[11px] text-[var(--chat-text-tertiary)]">{item.pathnameLabel}</span>
        </a>
    );
}

function MediaChip({
    item,
    locale,
}: {
    item: SourcePreviewItem;
    locale: UiLocale;
}): ReactElement {
    const labels = SOURCE_PREVIEW_UI[locale];
    return (
        <a
            href={item.url}
            target="_blank"
            rel="noopener noreferrer"
            className="flex min-w-0 items-center gap-2 rounded-[var(--chat-radius-sm)] border border-[var(--chat-border-subtle)] bg-[var(--chat-surface)] px-2.5 py-2 no-underline hover:border-[var(--chat-accent)]"
            aria-label={`${labels.openSource}: ${kindLabel(locale, item.kind)}`}
        >
            <span className="shrink-0 rounded bg-[var(--chat-surface-raised)] px-1.5 py-0.5 text-[10px] font-medium uppercase tracking-wide text-[var(--chat-text-secondary)]">
                {kindLabel(locale, item.kind)}
            </span>
            <span className="min-w-0 truncate text-[11px] text-[var(--chat-text-primary)]">
                {item.pathnameLabel}
            </span>
        </a>
    );
}

function ImagePreview({
    item,
    locale,
}: {
    item: SourcePreviewItem;
    locale: UiLocale;
}): ReactElement {
    const [failed, setFailed] = useState(false);
    const labels = SOURCE_PREVIEW_UI[locale];

    if (failed) {
        return <LinkPreview item={{ ...item, kind: 'link' }} locale={locale} />;
    }

    return (
        <a
            href={item.url}
            target="_blank"
            rel="noopener noreferrer"
            className="block overflow-hidden rounded-[var(--chat-radius-sm)] border border-[var(--chat-border-subtle)] bg-[var(--chat-surface)]"
            aria-label={`${labels.openSource}: ${labels.image}`}
        >
            <img
                src={item.url}
                alt={labels.image}
                className="max-h-36 w-full object-contain"
                loading="lazy"
                onError={() => setFailed(true)}
            />
        </a>
    );
}

export function SourcePreviewList({
    locale,
    urls,
    mimeByUrl,
    className,
}: SourcePreviewListProps): ReactElement | null {
    const items = buildSourcePreviewItems(urls, mimeByUrl);
    if (items.length === 0) return null;

    return (
        <ul className={cn('flex flex-col gap-2', className)}>
            {items.map((item) => (
                <li key={item.url} className="min-w-0">
                    {item.kind === 'image' ? (
                        <ImagePreview item={item} locale={locale} />
                    ) : item.kind === 'video' || item.kind === 'audio' ? (
                        <MediaChip item={item} locale={locale} />
                    ) : (
                        <LinkPreview item={item} locale={locale} />
                    )}
                </li>
            ))}
        </ul>
    );
}
