import type * as React from 'react'

import { cn } from '../../lib/utils'

export type ChatTypingIndicatorProps = {
    className?: string
}

export function ChatTypingIndicator({ className }: ChatTypingIndicatorProps): React.ReactElement {
    return (
        <div
            className={cn('flex items-center gap-1 px-1 py-2', className)}
            role="status"
            aria-label="Assistant is typing"
        >
            {[0, 1, 2].map((i) => (
                <span
                    key={i}
                    className="size-2 animate-pulse rounded-full bg-[var(--chat-text-tertiary)]"
                    style={{ animationDelay: `${i * 0.15}s` }}
                />
            ))}
        </div>
    )
}
