'use client';

import type * as React from 'react'
import { Copy, RefreshCw, ThumbsDown, ThumbsUp } from 'lucide-react'

import { Button } from '../ui/button'
import { cn } from '../../lib/utils'

export type ChatMessageActionsProps = {
    className?: string
    onCopy?: () => void
    onRegenerate?: () => void
}

export function ChatMessageActions({
    className,
    onCopy,
    onRegenerate,
}: ChatMessageActionsProps): React.ReactElement {
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
                aria-label="Copy"
                onClick={onCopy}
            >
                <Copy className="size-3.5" />
            </Button>
            <Button
                type="button"
                variant="ghost"
                size="icon-sm"
                className="text-[var(--chat-control-icon)] hover:bg-[var(--chat-surface-hover)] hover:text-[var(--chat-control-icon-hover)]"
                aria-label="Regenerate"
                onClick={onRegenerate}
            >
                <RefreshCw className="size-3.5" />
            </Button>
            <Button
                type="button"
                variant="ghost"
                size="icon-sm"
                className="text-[var(--chat-control-icon)] hover:bg-[var(--chat-surface-hover)] hover:text-[var(--chat-control-icon-hover)]"
                aria-label="Good response"
            >
                <ThumbsUp className="size-3.5" />
            </Button>
            <Button
                type="button"
                variant="ghost"
                size="icon-sm"
                className="text-[var(--chat-control-icon)] hover:bg-[var(--chat-surface-hover)] hover:text-[var(--chat-control-icon-hover)]"
                aria-label="Bad response"
            >
                <ThumbsDown className="size-3.5" />
            </Button>
        </div>
    )
}
