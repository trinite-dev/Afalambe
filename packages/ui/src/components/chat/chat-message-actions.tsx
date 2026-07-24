'use client';

import type * as React from 'react'
import { Copy, RefreshCw, ThumbsDown, ThumbsUp } from 'lucide-react'

import { Button } from '../ui/button'
import { cn } from '../../lib/utils'

export type ChatMessageActionLabels = {
    copyAria: string
    regenerateAria: string
    thumbsUpAria: string
    thumbsDownAria: string
}

const defaultLabels: ChatMessageActionLabels = {
    copyAria: 'Copier',
    regenerateAria: 'Regenerer',
    thumbsUpAria: 'Bonne reponse',
    thumbsDownAria: 'Mauvaise reponse',
}

export type ChatMessageActionsProps = {
    className?: string
    labels?: Partial<ChatMessageActionLabels>
    onCopy?: () => void
    onRegenerate?: () => void
    onThumbsUp?: () => void
    onThumbsDown?: () => void
    feedbackRating?: 'GOOD' | 'BAD' | null
}

export function ChatMessageActions({
    className,
    labels: labelsProp,
    onCopy,
    onRegenerate,
    onThumbsUp,
    onThumbsDown,
    feedbackRating = null,
}: ChatMessageActionsProps): React.ReactElement {
    const labels = { ...defaultLabels, ...labelsProp }

    return (
        <div
            className={cn(
                'flex items-center gap-0.5 opacity-0 transition-opacity duration-[var(--chat-duration-fast)] ease-[var(--chat-ease-standard)] group-hover:opacity-100',
                className,
            )}
        >
            <Button
                type="button"
                variant="ghost"
                size="icon-sm"
                className="text-[var(--chat-control-icon)] hover:bg-[var(--chat-surface-hover)] hover:text-[var(--chat-control-icon-hover)]"
                aria-label={labels.copyAria}
                disabled={!onCopy}
                onClick={onCopy}
            >
                <Copy className="size-3.5" />
            </Button>
            <Button
                type="button"
                variant="ghost"
                size="icon-sm"
                className="text-[var(--chat-control-icon)] hover:bg-[var(--chat-surface-hover)] hover:text-[var(--chat-control-icon-hover)]"
                aria-label={labels.regenerateAria}
                disabled={!onRegenerate}
                onClick={onRegenerate}
            >
                <RefreshCw className="size-3.5" />
            </Button>
            <Button
                type="button"
                variant="ghost"
                size="icon-sm"
                className={cn(
                    'text-[var(--chat-control-icon)] hover:bg-[var(--chat-surface-hover)] hover:text-[var(--chat-control-icon-hover)]',
                    feedbackRating === 'GOOD' && 'bg-[var(--chat-surface-hover)] text-[var(--chat-control-icon-hover)]',
                )}
                aria-label={labels.thumbsUpAria}
                aria-pressed={feedbackRating === 'GOOD'}
                disabled={!onThumbsUp}
                onClick={onThumbsUp}
            >
                <ThumbsUp className="size-3.5" />
            </Button>
            <Button
                type="button"
                variant="ghost"
                size="icon-sm"
                className={cn(
                    'text-[var(--chat-control-icon)] hover:bg-[var(--chat-surface-hover)] hover:text-[var(--chat-control-icon-hover)]',
                    feedbackRating === 'BAD' && 'bg-[var(--chat-surface-hover)] text-[var(--chat-control-icon-hover)]',
                )}
                aria-label={labels.thumbsDownAria}
                aria-pressed={feedbackRating === 'BAD'}
                disabled={!onThumbsDown}
                onClick={onThumbsDown}
            >
                <ThumbsDown className="size-3.5" />
            </Button>
        </div>
    )
}
