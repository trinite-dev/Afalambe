import type * as React from 'react'

import { cn } from '../../lib/utils'

export type AuthCardFooterProps = {
    children: React.ReactNode
    className?: string
}

/** Footer region under the auth card for links (sign up / sign in, forgot password, home). */
export function AuthCardFooter({ children, className }: AuthCardFooterProps): React.ReactElement {
    return (
        <footer
            className={cn(
                'mt-8 flex w-full max-w-[min(100%,24rem)] flex-col items-center gap-3 text-center text-[length:0.8125rem] text-[var(--lp-fg-muted)]',
                className,
            )}
            data-slot="auth-card-footer"
        >
            {children}
        </footer>
    )
}
