import type * as React from 'react'

import { cn } from '../../lib/utils'

export type ChatAppShellProps = {
    sidebar: React.ReactNode
    children: React.ReactNode
    className?: string
}

/** Primary two-column shell: fixed sidebar + flexible main column. */
export function ChatAppShell({ sidebar, children, className }: ChatAppShellProps): React.ReactElement {
    return (
        <div className={cn('flex min-h-dvh w-full bg-[var(--chat-canvas)]', className)}>
            {sidebar}
            <div className="flex min-h-0 min-w-0 flex-1 flex-col">{children}</div>
        </div>
    )
}
