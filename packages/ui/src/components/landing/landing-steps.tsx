import type * as React from 'react'

import { cn } from '../../lib/utils'

export type LandingStep = {
    title: string
    description: string
}

export type LandingStepsProps = {
    id?: string
    heading: string
    steps: LandingStep[]
    className?: string
}

export function LandingSteps({ id = 'how', heading, steps, className }: LandingStepsProps): React.ReactElement {
    return (
        <section id={id} className={cn('scroll-mt-20 border-b border-[var(--lp-border)] px-4 py-16 sm:px-6', className)}>
            <div className="mx-auto max-w-[var(--lp-max-width)]">
                <h2 className="text-center text-2xl font-semibold tracking-tight text-[var(--lp-fg)] sm:text-3xl">
                    {heading}
                </h2>
                <ol className="mt-12 grid gap-8 sm:grid-cols-3">
                    {steps.map((step, i) => (
                        <li
                            key={step.title}
                            className="relative rounded-[var(--lp-radius-lg)] border border-[var(--lp-border)] bg-[var(--lp-bg-elevated)] p-6 shadow-[var(--lp-shadow-sm)]"
                        >
                            <span
                                className="mb-4 flex size-10 items-center justify-center rounded-full bg-[var(--lp-accent)]/10 text-sm font-bold text-[var(--lp-accent)]"
                                aria-hidden
                            >
                                {i + 1}
                            </span>
                            <h3 className="text-lg font-semibold text-[var(--lp-fg)]">{step.title}</h3>
                            <p className="mt-2 text-sm leading-relaxed text-[var(--lp-fg-muted)]">{step.description}</p>
                        </li>
                    ))}
                </ol>
            </div>
        </section>
    )
}
