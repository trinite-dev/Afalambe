import type * as React from 'react'
import { ChevronDown } from 'lucide-react'

import { cn } from '../../lib/utils'

export type LandingFaqItem = {
    question: string
    answer: string
}

export type LandingFaqProps = {
    id?: string
    heading: string
    items: LandingFaqItem[]
    className?: string
}

export function LandingFaq({ id = 'faq', heading, items, className }: LandingFaqProps): React.ReactElement {
    return (
        <section id={id} className={cn('scroll-mt-20 border-t border-[var(--lp-border)] bg-[var(--lp-bg-elevated)] px-4 py-16 sm:px-6', className)}>
            <div className="mx-auto max-w-[42rem]">
                <h2 className="text-center text-2xl font-semibold tracking-tight text-[var(--lp-fg)] sm:text-3xl">
                    {heading}
                </h2>
                <div className="mt-10 flex flex-col gap-3">
                    {items.map((item) => (
                        <details
                            key={item.question}
                            className="rounded-[var(--lp-radius-md)] border border-[var(--lp-border)] bg-[var(--lp-bg)] px-4 py-1 shadow-[var(--lp-shadow-sm)] open:shadow-[var(--lp-shadow-md)]"
                        >
                            <summary className="cursor-pointer list-none py-3 font-medium text-[var(--lp-fg)] marker:content-none [&::-webkit-details-marker]:hidden">
                                <span className="flex items-center justify-between gap-2">
                                    {item.question}
                                    <ChevronDown
                                        className="landing-faq-chevron size-4 shrink-0 text-[var(--lp-fg-subtle)] transition-transform duration-200"
                                        aria-hidden
                                    />
                                </span>
                            </summary>
                            <p className="border-t border-[var(--lp-border)] pb-3 pt-2 text-sm leading-relaxed text-[var(--lp-fg-muted)]">
                                {item.answer}
                            </p>
                        </details>
                    ))}
                </div>
            </div>
        </section>
    )
}
