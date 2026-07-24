import type * as React from 'react'

import { cn } from '../../lib/utils'

import { ChatMessageActions, type ChatMessageActionLabels } from './chat-message-actions'
import { ChatMessageBubble, type ChatMessageBubbleProps } from './chat-message-bubble'

export type ChatMessageRowProps = {
    role: ChatMessageBubbleProps['role']
    children: React.ReactNode
    showAssistantActions?: boolean
    onCopy?: () => void
    onRegenerate?: () => void
    onThumbsUp?: () => void
    onThumbsDown?: () => void
    feedbackRating?: 'GOOD' | 'BAD' | null
    actionLabels?: Partial<ChatMessageActionLabels>
    className?: string
}

export function ChatMessageRow({
    role,
    children,
    showAssistantActions = false,
    onCopy,
    onRegenerate,
    onThumbsUp,
    onThumbsDown,
    feedbackRating = null,
    actionLabels,
    className,
}: ChatMessageRowProps): React.ReactElement {
    return (
        <div
            className={cn(
                'group flex w-full max-w-3xl flex-col gap-1 py-4',
                role === 'user' ? 'ml-auto items-end' : 'items-start',
                className,
            )}
        >
            <ChatMessageBubble role={role}>{children}</ChatMessageBubble>
            {role === 'assistant' && showAssistantActions ? (
                <ChatMessageActions
                    labels={actionLabels}
                    onCopy={onCopy}
                    onRegenerate={onRegenerate}
                    onThumbsUp={onThumbsUp}
                    onThumbsDown={onThumbsDown}
                    feedbackRating={feedbackRating}
                />
            ) : null}
        </div>
    )
}
