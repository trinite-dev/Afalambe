import type * as React from 'react'

import { cn } from '../../lib/utils'
import { LandingKitRoot } from '../landing/landing-kit-root'

export type AuthPageShellProps = {
    children: React.ReactNode
    /** Fixed top-left slot (e.g. back link). */
    topStartSlot?: React.ReactNode
    /** Fixed top-right slot (e.g. theme toggle). */
    topEndSlot?: React.ReactNode
    /** Optional mark above the title (e.g. wordmark `Image`). */
    logo?: React.ReactNode
    /** Primary heading shown above the card (e.g. Sign in). */
    title: React.ReactNode
    /** Optional node under the title (subtitle). */
    description?: React.ReactNode
    className?: string
}

/**
 * Full-viewport auth layout using marketing landing tokens (`--lp-*`).
 * Pairs with {@link LandingKitRoot}; inputs should use COSS primitives for a11y.
 */
export function AuthPageShell({
    topStartSlot,
    topEndSlot,
    logo,
    title,
    description,
    children,
    className,
}: AuthPageShellProps): React.ReactElement {
    return (
        <LandingKitRoot className={cn('relative flex flex-col', className)}>
            {topStartSlot ?? topEndSlot ? (
                <div className="fixed left-4 right-4 top-4 z-[60] flex items-center justify-between gap-3">
                    <div className="min-w-0 shrink-0">{topStartSlot}</div>
                    <div className="shrink-0">{topEndSlot}</div>
                </div>
            ) : null}
            <div className="flex min-h-dvh w-full flex-1 flex-col items-center justify-center px-4 py-10 sm:px-6">
                <div className="w-full max-w-[min(100%,24rem)]">
                    {logo ? <div className="mb-6 flex justify-center">{logo}</div> : null}
                    <header className="mb-8 text-center">
                        <h1 className="font-semibold tracking-tight text-[var(--lp-fg)] text-2xl sm:text-3xl">
                            {title}
                        </h1>
                        {description ? (
                            <p className="mt-2 text-[length:0.9375rem] leading-relaxed text-[var(--lp-fg-muted)]">
                                {description}
                            </p>
                        ) : null}
                    </header>
                    <div
                        className="rounded-[var(--lp-radius-lg)] border border-[var(--lp-border)] bg-[var(--lp-bg-elevated)] p-6 shadow-[var(--lp-shadow-md)] sm:p-8"
                        data-slot="auth-card"
                    >
                        {children}
                    </div>
                </div>
            </div>
        </LandingKitRoot>
    )
}
