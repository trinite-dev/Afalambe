import type * as React from 'react'

import { cn } from '../../lib/utils'

export type ChatMessageListProps = {
    children: React.ReactNode
    className?: string
    /** Width of the inner column (default chat thread; wider for home empty state). */
    innerClassName?: string
    scrollContainerRef?: React.Ref<HTMLDivElement>
    onScroll?: React.UIEventHandler<HTMLDivElement>
    onTouchStart?: React.TouchEventHandler<HTMLDivElement>
}

/** Scrollable message column between top bar and composer. */
export function ChatMessageList({
    children,
    className,
    innerClassName,
    scrollContainerRef,
    onScroll,
    onTouchStart,
}: ChatMessageListProps): React.ReactElement {
    return (
        <div
            ref={scrollContainerRef}
            onScroll={onScroll}
            onTouchStart={onTouchStart}
            className={cn(
                'flex min-h-0 flex-1 flex-col items-center overflow-y-auto px-4 py-2',
                className,
            )}
        >
            <div className={cn('flex w-full max-w-3xl flex-col', innerClassName)}>{children}</div>
        </div>
    )
}
