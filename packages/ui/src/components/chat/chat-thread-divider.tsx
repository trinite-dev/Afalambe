import type * as React from 'react'

import { cn } from '../../lib/utils'

export type ChatThreadDividerProps = {
    label: string
    className?: string
}

export function ChatThreadDivider({ label, className }: ChatThreadDividerProps): React.ReactElement {
    return (
        <div
            className={cn(
                'my-6 flex items-center gap-3 text-xs font-medium text-[var(--chat-text-tertiary)]',
                className,
            )}
            role="separator"
            aria-label={label}
        >
            <span className="h-px flex-1 bg-[var(--chat-divider)]" />
            <span className="shrink-0">{label}</span>
            <span className="h-px flex-1 bg-[var(--chat-divider)]" />
        </div>
    )
}
