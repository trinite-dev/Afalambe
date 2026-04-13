import { AlertTriangle, MessageSquare, Zap } from 'lucide-react';
import type * as React from 'react';

import { cn } from '../../lib/utils';

export type ChatHomeEmptyColumn = {
    id: string;
    title: string;
    /** Lucide icon name handled internally; maps to Examples / Capabilities / Limitations pattern. */
    tone: 'examples' | 'capabilities' | 'limitations';
    lines: string[];
};

const toneIcon = {
    examples: MessageSquare,
    capabilities: Zap,
    limitations: AlertTriangle,
} as const;

export type ChatHomeEmptyProps = {
    columns: ChatHomeEmptyColumn[];
    /** Optional: clicking a suggestion fills the composer or starts a turn. */
    onLineClick?: (line: string) => void;
    className?: string;
};

/**
 * ChatGPT-style empty home: three starter columns (Figma node 807-3335).
 * Surfaces use chat kit tokens and `--chat-radius-*` for corners.
 */
export function ChatHomeEmpty({
    columns,
    onLineClick,
    className,
}: ChatHomeEmptyProps): React.ReactElement {
    return (
        <div
            className={cn(
                'flex w-full flex-col items-center gap-6 py-8 sm:gap-8 sm:py-10',
                className,
            )}
        >
            <div className="grid w-full max-w-6xl grid-cols-1 gap-4 px-2 sm:grid-cols-3 sm:gap-6">
                {columns.map((col) => {
                    const Icon = toneIcon[col.tone];
                    return (
                        <section
                            key={col.id}
                            className="flex flex-col overflow-hidden rounded-[var(--chat-radius-lg)] border border-[var(--chat-border-subtle)] bg-[var(--chat-surface-raised)]"
                        >
                            <div className="flex items-center gap-2 border-b border-[var(--chat-border-subtle)] px-4 py-3">
                                <Icon
                                    className="size-4 shrink-0 text-[var(--chat-text-secondary)]"
                                    aria-hidden
                                />
                                <h2 className="text-sm font-semibold text-[var(--chat-text-primary)]">
                                    {col.title}
                                </h2>
                            </div>
                            <ul className="flex flex-col gap-0 p-2">
                                {col.lines.map((line) => (
                                    <li key={line}>
                                        <button
                                            type="button"
                                            className={cn(
                                                'w-full rounded-[var(--chat-radius-md)] px-3 py-2.5 text-left text-sm leading-snug text-[var(--chat-text-secondary)]',
                                                'hover:bg-[var(--chat-surface-hover)] hover:text-[var(--chat-text-primary)]',
                                                'focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-0 focus-visible:outline-[var(--chat-composer-ring)]',
                                                onLineClick ? 'cursor-pointer' : 'cursor-default',
                                            )}
                                            onClick={() => onLineClick?.(line)}
                                            disabled={!onLineClick}
                                        >
                                            {line}
                                        </button>
                                    </li>
                                ))}
                            </ul>
                        </section>
                    );
                })}
            </div>
        </div>
    );
}
