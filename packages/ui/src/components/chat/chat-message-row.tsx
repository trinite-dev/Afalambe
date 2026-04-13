import type * as React from 'react'

import { cn } from '../../lib/utils'

import { ChatMessageActions } from './chat-message-actions'
import { ChatMessageBubble, type ChatMessageBubbleProps } from './chat-message-bubble'

export type ChatMessageRowProps = {
    role: ChatMessageBubbleProps['role']
    children: React.ReactNode
    showAssistantActions?: boolean
    className?: string
}

export function ChatMessageRow({
    role,
    children,
    showAssistantActions = false,
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
            {role === 'assistant' && showAssistantActions ? <ChatMessageActions /> : null}
        </div>
    )
}
