import type * as React from 'react'

import { cn } from '../../lib/utils'

export type ChatAppShellProps = {
    sidebar: React.ReactNode
    children: React.ReactNode
    className?: string
}

/** Primary two-column shell: viewport-locked sidebar + scrollable main column. */
export function ChatAppShell({ sidebar, children, className }: ChatAppShellProps): React.ReactElement {
    return (
        <div className={cn('flex h-full max-h-full w-full overflow-hidden bg-[var(--chat-canvas)]', className)}>
            {sidebar}
            <div className="flex h-full min-h-0 min-w-0 flex-1 flex-col overflow-hidden">{children}</div>
        </div>
    )
}
