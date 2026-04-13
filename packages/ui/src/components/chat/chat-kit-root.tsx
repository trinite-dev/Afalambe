import type * as React from 'react'

import { cn } from '../../lib/utils'

export type ChatKitRootProps = {
    children: React.ReactNode
    className?: string
}

/**
 * Opt-in root for ChatGPT-style kit tokens (`chat-gpt-kit.css`).
 * Sets `data-ui-kit="chatgpt"` and `dark` for descendant `dark:` Tailwind usage.
 */
export function ChatKitRoot({ children, className }: ChatKitRootProps): React.ReactElement {
    return (
        <div data-ui-kit="chatgpt" className={cn('dark min-h-dvh w-full bg-[var(--chat-canvas)]', className)}>
            {children}
        </div>
    )
}
