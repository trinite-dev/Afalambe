import type * as React from 'react'
import { cva, type VariantProps } from 'class-variance-authority'

import { cn } from '../../lib/utils'

const bubbleVariants = cva('max-w-[min(100%,48rem)] text-[15px] leading-relaxed', {
    defaultVariants: {
        role: 'assistant',
    },
    variants: {
        role: {
            assistant: 'text-[var(--chat-text-primary)]',
            system: 'text-center text-sm text-[var(--chat-system-fg)]',
            user: 'ml-auto rounded-[var(--chat-radius-bubble)] border border-[var(--chat-user-bubble-border)] bg-[var(--chat-user-bubble)] px-4 py-2.5 text-[var(--chat-text-primary)]',
        },
    },
})

export type ChatMessageBubbleProps = {
    role: NonNullable<VariantProps<typeof bubbleVariants>['role']>
    children: React.ReactNode
    className?: string
    /** Assistant-only: show soft bubble background */
    assistantContained?: boolean
}

export function ChatMessageBubble({
    role,
    children,
    className,
    assistantContained = true,
}: ChatMessageBubbleProps): React.ReactElement {
    const isAssistant = role === 'assistant'
    return (
        <div
            className={cn(
                bubbleVariants({ role }),
                isAssistant && assistantContained
                    ? 'rounded-[var(--chat-radius-bubble)] bg-[var(--chat-assistant-bubble)] px-4 py-2.5'
                    : null,
                className,
            )}
        >
            {children}
        </div>
    )
}
