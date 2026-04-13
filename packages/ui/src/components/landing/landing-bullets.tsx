import type * as React from 'react'

import { cn } from '../../lib/utils'

export type LandingBullet = {
    title: string
    body: string
}

export type LandingBulletsProps = {
    id?: string
    heading: string
    items: LandingBullet[]
    className?: string
}

export function LandingBullets({ id = 'why', heading, items, className }: LandingBulletsProps): React.ReactElement {
    return (
        <section id={id} className={cn('scroll-mt-20 px-4 py-16 sm:px-6', className)}>
            <div className="mx-auto max-w-[var(--lp-max-width)]">
                <h2 className="text-center text-2xl font-semibold tracking-tight text-[var(--lp-fg)] sm:text-3xl">
                    {heading}
                </h2>
                <ul className="mt-12 grid gap-6 sm:grid-cols-2">
                    {items.map((item) => (
                        <li
                            key={item.title}
                            className="rounded-[var(--lp-radius-md)] border border-[var(--lp-border)] bg-[var(--lp-bg-elevated)] p-5 shadow-[var(--lp-shadow-sm)]"
                        >
                            <h3 className="font-semibold text-[var(--lp-fg)]">{item.title}</h3>
                            <p className="mt-2 text-sm leading-relaxed text-[var(--lp-fg-muted)]">{item.body}</p>
                        </li>
                    ))}
                </ul>
            </div>
        </section>
    )
}
